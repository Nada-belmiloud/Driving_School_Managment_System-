"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import type { Phase } from "@/types";
import { scheduleApi, candidatesApi, instructorsApi, examsApi } from "@/lib/api";
import { toast } from "sonner";

// --- Interfaces for API data ---
interface Candidate {
  _id: string;
  id?: string;
  name: string;
  phases?: Array<{
    phase: Phase;
    status: string;
    sessionsCompleted: number;
    sessionsPlan: number;
    examDate?: string;
    examPassed?: boolean;
    examAttempts: number;
  }>;
  sessionHistory?: Array<{ status: string }>;
}

interface Instructor {
  _id: string;
  id?: string;
  name: string;
}

interface Session {
  _id: string;
  id?: string;
  candidateId: string | { _id: string; name: string };
  instructorId: string | { _id: string; name: string };
  lessonType: Phase;
  phase?: Phase;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Exam {
  _id: string;
  id?: string;
  candidateId: string | { _id: string; name: string };
  instructorId?: string | { _id: string; name: string };
  examType: Phase;
  date: string;
  time: string;
  status: 'scheduled' | 'passed' | 'failed' | 'cancelled';
}

// --- Constants ---
const phaseLabels: Record<Phase, string> = {
  highway_code: "Highway Code",
  parking: "Parking",
  driving: "Driving",
};

// --- Main Component ---
export function ScheduleComponent() {
  // State for API data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"training" | "exams">("training");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  
  // Modal + date selection state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // auto-select today
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessionsRes, candidatesRes, instructorsRes, examsRes] = await Promise.all([
        scheduleApi.getAll({ limit: 100 }),
        candidatesApi.getAll({ limit: 100 }),
        instructorsApi.getAll({ limit: 100 }),
        examsApi.getAll({ limit: 100 })
      ]);

      if (sessionsRes.success && sessionsRes.data) {
        // Handle both array and object response formats (backend returns data as array or data.schedules)
        const sessionsData = Array.isArray(sessionsRes.data)
          ? sessionsRes.data
          : (sessionsRes.data as { sessions?: Session[]; schedules?: Session[] }).sessions
            || (sessionsRes.data as { schedules?: Session[] }).schedules
            || [];
        setSessions(sessionsData as Session[]);
      }
      if (candidatesRes.success && candidatesRes.data) {
        // Handle both array and object response formats
        const candidatesData = Array.isArray(candidatesRes.data)
          ? candidatesRes.data
          : (candidatesRes.data as { candidates?: Candidate[] }).candidates || [];
        setCandidates(candidatesData as Candidate[]);
      }
      if (instructorsRes.success && instructorsRes.data) {
        // Handle both array and object response formats
        const instructorsData = Array.isArray(instructorsRes.data)
          ? instructorsRes.data
          : (instructorsRes.data as { instructors?: Instructor[] }).instructors || [];
        setInstructors(instructorsData as Instructor[]);
      }
      if (examsRes.success && examsRes.data) {
        // Handle both array and object response formats
        const examsData = Array.isArray(examsRes.data)
          ? examsRes.data
          : (examsRes.data as { exams?: Exam[] }).exams || [];
        setExams(examsData as Exam[]);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions using fetched data
  const getCandidateInfo = (candidateId: string): Candidate | undefined =>
    candidates.find((c) => c._id === candidateId || c.id === candidateId);

  const getInstructorName = (instructorId: string): string => {
    const instructor = instructors.find((i) => i._id === instructorId || i.id === instructorId);
    return instructor?.name || "Unknown";
  };
  
  const getCandidateCompletedSessions = (candidateId: string): Session[] => {
    // Get completed sessions from the sessions state (Schedule collection)
    return sessions.filter((s) => {
      const sessionCandidateId = s.candidateId && typeof s.candidateId === 'object'
        ? s.candidateId._id
        : s.candidateId;
      return sessionCandidateId === candidateId && s.status === 'completed';
    });
  };

  const getCandidateExamHistory = (candidateId: string) => {
    const candidate = candidates.find(c => c._id === candidateId || c.id === candidateId);
    if (!candidate) return [];

    // Initialize phases from candidate or with defaults
    const phases = candidate.phases && candidate.phases.length > 0
      ? candidate.phases
      : [
          { phase: 'highway_code' as Phase, status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0, examDate: undefined, lastExamDate: undefined },
          { phase: 'parking' as Phase, status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0, examDate: undefined, lastExamDate: undefined },
          { phase: 'driving' as Phase, status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0, examDate: undefined, lastExamDate: undefined }
        ];

    // Count completed sessions from the sessions state
    const sessionCounts: Record<string, number> = {
      highway_code: 0,
      parking: 0,
      driving: 0
    };

    sessions.forEach(session => {
      const sessionCandidateId = session.candidateId && typeof session.candidateId === 'object'
        ? session.candidateId._id
        : session.candidateId;
      if (sessionCandidateId === candidateId && session.status === 'completed') {
        const lessonType = session.lessonType || session.phase;
        if (lessonType && sessionCounts.hasOwnProperty(lessonType)) {
          sessionCounts[lessonType]++;
        }
      }
    });

    // Get exam info from exams state
    const candidateExams = exams.filter(exam => {
      const examCandidateId = exam.candidateId && typeof exam.candidateId === 'object'
        ? exam.candidateId._id
        : exam.candidateId;
      return examCandidateId === candidateId;
    });

    return phases.map(phase => {
        // Get exam info for this phase from exams state
        const phaseExams = candidateExams.filter(e => e.examType === phase.phase);
        const passedExam = phaseExams.find(e => e.status === 'passed');
        const failedExams = phaseExams.filter(e => e.status === 'failed');
        const scheduledExam = phaseExams.find(e => e.status === 'scheduled');

        // Get the last completed exam (passed or failed, not scheduled)
        const completedExams = phaseExams.filter(e => e.status === 'passed' || e.status === 'failed');
        const lastCompletedExam = completedExams.length > 0 ? completedExams[completedExams.length - 1] : null;

        // Use actual session count from sessions state, capped at sessionsPlan (10)
        const rawSessionsCompleted = sessionCounts[phase.phase] || phase.sessionsCompleted || 0;
        const sessionsPlan = phase.sessionsPlan || 10;
        const actualSessionsCompleted = Math.min(rawSessionsCompleted, sessionsPlan);

        // Determine exam results - only from actual completed exams
        const examPassed = passedExam ? true : (phase.examPassed || false);

        // Last exam date should be from completed exams only, formatted nicely
        const lastExamDateRaw = lastCompletedExam?.date || (phase.examPassed ? phase.examDate : null);
        const lastExamDateFormatted = lastExamDateRaw
          ? new Date(lastExamDateRaw).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : 'N/A';

        // Exam attempts = number of completed exams (passed or failed)
        const examAttempts = completedExams.length > 0 ? completedExams.length : (phase.examAttempts || 0);

        // Determine result based on actual exam status
        let examResult = 'N/A';
        if (examPassed) {
            examResult = 'Passed';
        } else if (failedExams.length > 0 || (examAttempts > 0 && !examPassed)) {
            examResult = 'Failed';
        } else if (scheduledExam) {
            examResult = 'Scheduled';
        }

        // Determine status based on exam results and 15-day waiting rule
        let waitingStatus = 'N/A';
        const lastExamDateObj = lastCompletedExam?.date ? new Date(lastCompletedExam.date) :
                                (phase.examDate ? new Date(phase.examDate) : null);

        if (examPassed) {
            waitingStatus = 'Completed';
        } else if (lastExamDateObj && !examPassed) {
            // Check 15-day waiting period after failed exam
            const fifteenDaysLater = new Date(lastExamDateObj);
            fifteenDaysLater.setDate(lastExamDateObj.getDate() + 15);
            if (new Date() < fifteenDaysLater) {
                const remainingDays = Math.ceil((fifteenDaysLater.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                waitingStatus = `Waiting (${remainingDays} days)`;
            } else {
                waitingStatus = 'Ready to retry';
            }
        } else if (scheduledExam) {
            const scheduledDate = new Date(scheduledExam.date);
            waitingStatus = `Exam on ${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else if (actualSessionsCompleted >= sessionsPlan) {
            waitingStatus = 'Ready for exam';
        } else if (actualSessionsCompleted > 0) {
            waitingStatus = 'In training';
        }

        // Determine phase status
        let phaseStatus = phase.status;
        if (examPassed) {
            phaseStatus = 'completed';
        } else if (actualSessionsCompleted >= sessionsPlan) {
            phaseStatus = 'completed'; // All sessions done, ready for exam
        } else if (actualSessionsCompleted > 0 && phaseStatus === 'not_started') {
            phaseStatus = 'in_progress';
        }

        return {
            phase: phaseLabels[phase.phase],
            lastExamDate: lastExamDateFormatted,
            results: examResult,
            attempts: examAttempts,
            waitingStatus: waitingStatus,
            currentPhaseStatus: phaseStatus,
            sessionsCompleted: actualSessionsCompleted,
        };
    });
  };

  // Filter Sessions
  const filteredSessions = useMemo(() => {
    if (filterStatus === "all") return sessions;
    return sessions.filter((s) => s.status === filterStatus);
  }, [sessions, filterStatus]);

  // Calendar utilities
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    // days from previous month to align first day of week
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    // days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Optionally you could append trailing days to fill the last week — kept as-is
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date(); // auto "today"

  // Stats
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      scheduled: sessions.filter((s) => s.status === "scheduled").length,
      completed: sessions.filter((s) => s.status === "completed").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
    };
  }, [sessions]);

  // Exam candidates from fetched candidates
  const examCandidates: { id: string; name: string; currentPhase: Phase; examDate: string; sessionsCompleted: number; sessionsPlan: number; examAttempts: number; }[] = useMemo(() => {
    return candidates
      .map((candidate) => {
        const currentPhase = candidate.phases?.find(
          (p) => p.status === "in_progress" || (p.examDate && !p.examPassed)
        );
        if (!currentPhase || !currentPhase.examDate) return null;
        
        const candidateId = candidate._id || candidate.id;
        if (!candidateId) return null;

        return {
          id: candidateId,
          name: candidate.name,
          currentPhase: currentPhase.phase,
          examDate: currentPhase.examDate,
          sessionsCompleted: currentPhase.sessionsCompleted,
          sessionsPlan: currentPhase.sessionsPlan,
          examAttempts: currentPhase.examAttempts,
        };
      })
      .filter((candidate): candidate is { id: string; name: string; currentPhase: Phase; examDate: string; sessionsCompleted: number; sessionsPlan: number; examAttempts: number; } => candidate !== null);
  }, [candidates]);

  // --- Handlers ---
  const handleComplete = async (sessionId: string) => {
    try {
      const result = await scheduleApi.complete(sessionId);
      if (result.success) {
        toast.success('Session marked as completed');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to complete session');
      }
    } catch (error) {
      toast.error('Failed to complete session');
    }
  };

  const handleCancel = async (sessionId: string) => {
    try {
      const result = await scheduleApi.cancel(sessionId);
      if (result.success) {
        toast.success('Session cancelled');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to cancel session');
      }
    } catch (error) {
      toast.error('Failed to cancel session');
    }
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta)
    );
  };

  // Add session handler (from modal)
  const handleAddSession = async (payload: {
    candidateId: string;
    phase: string;
    instructorId?: string;
    date: string;
    time: string;
  }) => {
    try {
      const result = await scheduleApi.create({
        candidateId: payload.candidateId,
        instructorId: payload.instructorId || instructors[0]?._id || "",
        date: payload.date,
        time: payload.time,
        lessonType: (payload.phase as 'highway_code' | 'parking' | 'driving') || "parking",
      });

      if (result.success) {
        toast.success('Session added successfully');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to add session');
      }
    } catch (error) {
      toast.error('Failed to add session');
    }
  };

  // Add exam handler (from modal)
  const handleAddExam = async (payload: { candidateId: string; phase: string; date: string; time: string }) => {
    try {
      const result = await examsApi.schedule({
        candidateId: payload.candidateId,
        instructorId: instructors[0]?._id || "",
        examType: payload.phase as 'highway_code' | 'parking' | 'driving',
        date: payload.date,
        time: payload.time,
      });

      if (result.success) {
        toast.success('Exam scheduled successfully');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to schedule exam');
      }
    } catch (error) {
      toast.error('Failed to schedule exam');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Centering the main content area */}
      <div className="w-full max-w-7xl p-8"> 
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Schedule Management </h1>
          <p className="text-sm text-gray-500">
            Manage training sessions and exams
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("training")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "training"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Training Sessions
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "exams"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Exams
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Left Panel */}
          <div className="flex-1">
            {activeTab === "training" ? (
              <TrainingSessionsView
                filteredSessions={filteredSessions}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                getCandidateInfo={getCandidateInfo}
                getInstructorName={getInstructorName}
                handleComplete={handleComplete}
                handleCancel={handleCancel}
                onOpenSessionModal={() => {
                  setShowSessionModal(true);
                }}
              />
            ) : (
              <ExamsView
                examCandidates={examCandidates}
                onOpenExamModal={() => setShowExamModal(true)}
                exams={exams}
                getCandidateInfo={getCandidateInfo}
              />
            )}
          </div>

          {/* Right Sidebar */}
          {activeTab === "training" && (
            <RightSidebar
              currentMonth={currentMonth}
              changeMonth={changeMonth}
              stats={stats}
              days={days}
              today={today}
              selectedDate={selectedDate}
              onSelectDate={(d: Date) => setSelectedDate(d)}
            />
          )}
        </div>
      </div>

      {/* ---------------------------
          SESSION MODAL
      --------------------------- */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[560px] rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Schedule New Session</h2>
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setShowSessionModal(false)}
              >
                <X />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <SessionForm
                defaultDate={selectedDate}
                instructors={instructors}
                candidates={candidates}
                getCandidateCompletedSessions={getCandidateCompletedSessions}
                onCancel={() => setShowSessionModal(false)}
                onSubmit={(payload) => {
                  handleAddSession(payload);
                  setShowSessionModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------
          EXAM MODAL
      --------------------------- */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[700px] rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Schedule Exam</h2>
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setShowExamModal(false)}
              >
                <X />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <ExamForm
                defaultDate={selectedDate}
                candidates={candidates}
                getCandidateExamHistory={getCandidateExamHistory}
                onCancel={() => setShowExamModal(false)}
                onSubmit={(payload) => {
                  handleAddExam(payload);
                  setShowExamModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// SessionForm component (Updated)
// ---------------------------
function SessionForm({
  defaultDate,
  instructors,
  candidates,
  getCandidateCompletedSessions,
  onCancel,
  onSubmit,
}: {
  defaultDate: Date;
  instructors: Instructor[];
  candidates: Candidate[];
  getCandidateCompletedSessions: (id: string) => Session[];
  onCancel: () => void;
  onSubmit: (payload: {
    candidateId: string;
    phase: string;
    instructorId?: string;
    date: string;
    time: string;
  }) => void;
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?._id || candidates[0]?.id || "");
  const [phase, setPhase] = useState<string>("parking");
  const [instructorId, setInstructorId] = useState<string>(
    instructors?.[0]?._id || instructors?.[0]?.id || ""
  );
  const [date, setDate] = useState<string>(() =>
    defaultDate.toISOString().slice(0, 10)
  );
  const [time, setTime] = useState<string>("09:00");
  
  const completedSessions = selectedCandidateId 
    ? getCandidateCompletedSessions(selectedCandidateId) 
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) return;
    
    onSubmit({
      candidateId: selectedCandidateId,
      phase,
      instructorId,
      date,
      time,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="p-3 border rounded-lg bg-gray-50">
          <label className="text-sm font-medium block mb-1">Select Candidate <span className="text-red-500">*</span></label>
          <select
            className="w-full border rounded p-2"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            required
          >
            {candidates.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-t pt-4">Completed Sessions History</h3>
          <div className="space-y-3 max-h-40 overflow-y-auto mb-4 border p-3 rounded-lg">
            {completedSessions.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-2">No completed sessions recorded for this candidate.</div>
            ) : (
              completedSessions.map((s: any) => (
                <div
                  key={s._id || s.id}
                  className="p-2 border rounded flex items-center justify-between bg-white"
                >
                  <div>
                    <p className="font-medium text-sm">{phaseLabels[(s.lessonType || s.phase) as Phase] || s.lessonType || s.phase}</p>
                    <p className="text-xs text-gray-500">
                      {s.date} — {s.time}
                    </p>
                  </div>
                  <CheckCircle className="text-green-600 w-5 h-5" />
                </div>
              ))
            )}
          </div>

          <h3 className="text-lg font-medium border-t pt-4">Schedule Details</h3>
          
          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Phase</label>
                <select
                    className="w-full border rounded p-2"
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    required
                >
                    <option value="parking">Parking (Phase 2)</option>
                    <option value="driving">Driving (Phase 3)</option>
                    <option value="highway_code">Highway Code (Phase 1)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Instructor</label>
                <select
                    className="w-full border rounded p-2"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    required
                >
                    {instructors.map((ins) => (
                        <option key={ins._id || ins.id} value={ins._id || ins.id}>
                            {ins.name}
                        </option>
                    ))}
                </select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Date</label>
                <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Time</label>
                <input
                    type="time"
                    className="w-full border rounded p-2"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                />
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              className="px-22 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-15 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ---------------------------
// ExamForm component (Updated)
// ---------------------------
function ExamForm({
  defaultDate,
  candidates,
  getCandidateExamHistory,
  onCancel,
  onSubmit,
}: {
  defaultDate: Date;
  candidates: Candidate[];
  getCandidateExamHistory: (id: string) => { 
    phase: string; 
    lastExamDate: string; 
    results: string; 
    attempts: number; 
    waitingStatus: string; 
    currentPhaseStatus: string;
    sessionsCompleted?: number;
  }[];
  onCancel: () => void;
  onSubmit: (payload: { candidateId: string; phase: string; date: string; time: string }) => void;
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?._id || candidates[0]?.id || "");
  const [date, setDate] = useState<string>(() =>
    defaultDate.toISOString().slice(0, 10)
  );
  const [time, setTime] = useState<string>("09:00");

  const examHistory = selectedCandidateId 
    ? getCandidateExamHistory(selectedCandidateId) 
    : [];
  
  // Auto-detect the current phase as the one marked 'in_progress' or the next phase if current is passed
  const candidate = candidates.find(c => (c._id || c.id) === selectedCandidateId);
  const currentPhase = candidate?.phases?.find(p => p.status === 'in_progress');
  const nextPhase = candidate?.phases?.find(p => p.status === 'not_started');
  
  // Determine exam phase: if current phase failed or needs retake, use current phase; otherwise use next phase
  const examPhase = currentPhase && (!currentPhase.examPassed || currentPhase.examDate) 
    ? currentPhase.phase 
    : nextPhase?.phase || currentPhase?.phase || 'highway_code';

  const currentPhaseLabel = phaseLabels[examPhase] || 'N/A';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) return;
    
    onSubmit({ candidateId: selectedCandidateId, phase: examPhase, date, time });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="p-3 border rounded-lg bg-gray-50">
          <label className="text-sm font-medium block mb-1">Select Candidate <span className="text-red-500">*</span></label>
          <select
            className="w-full border rounded p-2"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            required
          >
            {candidates.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-t pt-4">Exam History and Status</h3>
          


          <div className="max-h-56 overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Phase</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sessions</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Last Exam Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Attempts</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {examHistory.length > 0 ? (
                        examHistory.map((history, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{history.phase}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{history.sessionsCompleted ?? 0}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{history.lastExamDate}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        history.results === 'Passed' ? 'bg-green-100 text-green-800' :
                                        history.results === 'Failed' ? 'bg-red-100 text-red-800' :
                                        history.results === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {history.results}
                                    </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{history.attempts}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{history.waitingStatus}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={6} className="text-center py-4 text-sm text-gray-500">No exam history available.</td></tr>
                    )}
                </tbody>
            </table>
          </div>

          <h3 className="mt-2 text-lg font-medium border-t pt-4">Schedule Exam Details</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Exam Phase</p>
                <p className="text-lg font-semibold text-blue-900">{currentPhaseLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Auto-detected based on candidate progress</p>
                <p className="text-xs text-blue-600">
                  {currentPhase && !currentPhase.examPassed ? 'Retaking failed phase' : 
                   nextPhase ? 'Moving to next phase' : 'Final phase'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Exam Date</label>
                <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Exam Time</label>
                <input
                    type="time"
                    className="w-full border rounded p-2"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                />
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                  type="button"
                  className="px-32 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  onClick={onCancel}
              >
                  Cancel
              </button>
              <button
                  type="submit"
                  className="px-25 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                  Schedule Exam
              </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ---------------------------
// Sub-components (Updated)
// ---------------------------

interface TrainingSessionsViewProps {
  filteredSessions: Session[];
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  getCandidateInfo: (id: string) => Candidate | undefined;
  getInstructorName: (id: string) => string;
  handleComplete: (id: string) => void;
  handleCancel: (id: string) => void;
  onOpenSessionModal: () => void;
}

function TrainingSessionsView({
  filteredSessions,
  filterStatus,
  setFilterStatus,
  getCandidateInfo,
  getInstructorName,
  handleComplete,
  handleCancel,
  onOpenSessionModal,
}: TrainingSessionsViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold">Training Sessions</h2>
        <button
          onClick={onOpenSessionModal}
          className="px-6 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Schedule Session
        </button>
      </div>
      {/* Filter Buttons */}
      <div className="p-4 flex gap-2 border-b border-gray-200">
        {[
          { key: "all", label: "All" },
          { key: "scheduled", label: "Scheduled" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              filterStatus === filter.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {/* Sessions List */}
      <div className="divide-y divide-gray-200">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sessions found</div>
        ) : (
          filteredSessions.map((session) => {
            const candidateId = typeof session.candidateId === 'object' && session.candidateId !== null
              ? session.candidateId._id
              : session.candidateId;
            const candidateName = typeof session.candidateId === 'object' && session.candidateId !== null
              ? session.candidateId.name
              : getCandidateInfo(candidateId)?.name;
            const instructorId = typeof session.instructorId === 'object' && session.instructorId !== null
              ? session.instructorId._id
              : session.instructorId;
            const instructorName = typeof session.instructorId === 'object' && session.instructorId !== null
              ? session.instructorId.name
              : getInstructorName(instructorId);
            const phase = session.lessonType || session.phase;
            return (
              <div key={session._id || session.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {candidateName || "Unknown"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          session.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : session.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {phaseLabels[phase as Phase] || phase}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {instructorName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => handleComplete(session._id || session.id || '')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCancel(session._id || session.id || '')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Cancel session"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface ExamsViewProps {
  examCandidates: {
    id: string;
    name: string;
    currentPhase: Phase;
    examDate: string;
    sessionsCompleted: number;
    sessionsPlan: number;
    examAttempts: number;
  }[];
  onOpenExamModal: () => void;
  exams: Exam[];
  getCandidateInfo: (id: string) => Candidate | undefined;
}

function ExamsView({ examCandidates, onOpenExamModal, exams, getCandidateInfo }: ExamsViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Scheduled Exams</h2>
          <p className="text-sm text-gray-500">
            View and manage exams that have been scheduled
          </p>
        </div>
        <button
          onClick={onOpenExamModal}
          className="px-6 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Schedule Exam
        </button>
      </div>

      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-start gap-2 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Exams are scheduled flexibly based on manager-candidate agreement.
            The system enforces a 15-day waiting period after exam failures and
            between phases.
          </p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {examCandidates.length === 0 && exams.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-gray-500">
            No scheduled exams
          </div>
        ) : (
          <>
            {examCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {candidate.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {phaseLabels[candidate.currentPhase]}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Exam Scheduled
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exam Date:</span>
                    <span className="font-medium">{candidate.examDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions:</span>
                    <span className="font-medium">
                      {candidate.sessionsCompleted}/{candidate.sessionsPlan}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempts:</span>
                    <span className="font-medium">{candidate.examAttempts}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Also show scheduled exams from API */}
            {exams.map((e) => {
              const candidateIdStr = e.candidateId && typeof e.candidateId === 'object' ? e.candidateId._id : (e.candidateId || '');
              const candidateName = e.candidateId && typeof e.candidateId === 'object' ? e.candidateId.name : getCandidateInfo(candidateIdStr)?.name;
              return (
                <div key={e._id || e.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {candidateName || "Unknown Candidate"} - {phaseLabels[e.examType as Phase]}
                      </div>
                      <div className="text-sm text-gray-600">{e.date} {e.time}</div>
                    </div>
                    <span
                      className={`px-2 py-1 ${
                        e.status === "passed"
                          ? "bg-green-100 text-green-700"
                          : e.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      } text-xs rounded-full`}
                    >
                      {e.status ?? "Scheduled"}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// Right Sidebar Component (calendar + stats)
interface RightSidebarProps {
  currentMonth: Date;
  changeMonth: (delta: number) => void;
  stats: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  days: { date: Date; isCurrentMonth: boolean }[];
  today: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

function RightSidebar({
  currentMonth,
  changeMonth,
  stats,
  days,
  today,
  selectedDate,
  onSelectDate,
}: RightSidebarProps) {
  return (
    <div className="w-80 space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Monthly Calendar</h3>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Use this calendar to suggest dates to candidates
        </p>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isToday =
              day.isCurrentMonth &&
              day.date.getDate() === today.getDate() &&
              day.date.getMonth() === today.getMonth() &&
              day.date.getFullYear() === today.getFullYear();

            const isSelected =
              day.date.getDate() === selectedDate.getDate() &&
              day.date.getMonth() === selectedDate.getMonth() &&
              day.date.getFullYear() === selectedDate.getFullYear();

            return (
              <button
                key={idx}
                onClick={() => day.isCurrentMonth && onSelectDate(day.date)}
                className={`aspect-square flex items-center justify-center text-sm rounded ${
                  !day.isCurrentMonth
                    ? "text-gray-300 cursor-default"
                    : isSelected
                    ? "bg-black text-white font-semibold"
                    : isToday
                    ? "ring-2 ring-offset-1 ring-black font-semibold"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Sessions</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Scheduled</span>
            <span className="font-medium text-blue-600">
              {stats.scheduled}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completed</span>
            <span className="font-medium text-green-600">
              {stats.completed}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cancelled</span>
            <span className="font-medium text-red-600">
              {stats.cancelled}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleComponent;