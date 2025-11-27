'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockCandidates } from '@/lib/mockData'; 
import { Candidate, Document, PhaseProgress, Phase, PhaseStatus } from '@/types';

interface CandidateDetailsProps {
  candidateId: string;
  onClose: () => void;
  onUpdateCandidate: (id: string, updatedFields: Partial<Candidate>) => void;
  onScheduleSession: (candidateId: string) => void;
  onRecordPayment: (candidateId: string) => void;
  onAddExamResult: (candidateId: string) => void;
}

export function CandidateDetails({ 
  candidateId, 
  onClose, 
  onUpdateCandidate,
  onScheduleSession,
  onRecordPayment,
  onAddExamResult 
}: CandidateDetailsProps) {
  
  const candidate = mockCandidates.find(c => c.id === candidateId) as Candidate | undefined;

  // 1. STATE FOR MODALS AND INLINE EDITING
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExamResultModalOpen, setIsExamResultModalOpen] = useState(false);
  const [currentExamPhase, setCurrentExamPhase] = useState<Phase>('highway_code');
  const [examResult, setExamResult] = useState<'passed' | 'failed'>('passed');
  
  // State for inline document editing
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const [editedDocuments, setEditedDocuments] = useState<Document[]>(candidate?.documents || []);

  if (!candidate) {
    return <div className="p-8">Candidate not found</div>;
  }
  
  // Array to use for rendering (uses edited state when editing, otherwise uses candidate data)
  const documentsForDisplay = isEditingDocuments ? editedDocuments : candidate.documents;

  // 2. HANDLERS
  
  // --- Delete Handlers ---
  const handleDeleteCandidate = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // API call/data removal would go here.
    console.log(`Deleting candidate with ID: ${candidateId}`);
    setIsDeleteModalOpen(false);
    onClose(); 
    alert(`Candidate ${candidate.name} has been deleted (Simulated).`);
  };

  // --- Exam Result Handlers ---
  const handleMarkResultClick = (phase: Phase) => {
    setCurrentExamPhase(phase);
    setIsExamResultModalOpen(true);
  };

  const handleExamResultSubmit = () => {
    const currentPhase = candidate.phases.find(p => p.phase === currentExamPhase);
    
    if (!currentPhase) {
      console.error('Phase not found');
      return;
    }

    // Create new exam history entry
    const newExamAttempt = {
      id: `exam-${Date.now()}`,
      phase: currentExamPhase,
      date: new Date().toISOString().split('T')[0],
      attemptNumber: candidate.examHistory.filter(e => e.phase === currentExamPhase).length + 1,
      passed: examResult === 'passed',
      notes: examResult === 'failed' ? 'Candidate must wait 15 days before retaking exam' : undefined
    };

    // Update candidate phases status
    const updatedPhases: PhaseProgress[] = candidate.phases.map(phase => {
      if (phase.phase === currentExamPhase) {
        const updatedPhase: PhaseProgress = {
          ...phase,
          status: examResult === 'passed' ? 'completed' : 'in_progress',
          examPassed: examResult === 'passed',
          examAttempts: phase.examAttempts + 1,
          lastExamDate: new Date().toISOString().split('T')[0],
          examDate: undefined
        };
        return updatedPhase;
      }
      
      // If current phase is passed and there's a next phase, activate it
      if (examResult === 'passed') {
        const phaseOrder: Phase[] = ['highway_code', 'parking', 'driving'];
        const currentIndex = phaseOrder.indexOf(currentExamPhase);
        if (currentIndex !== -1 && currentIndex < phaseOrder.length - 1) {
          const nextPhase = phaseOrder[currentIndex + 1];
          if (phase.phase === nextPhase && phase.status === 'not_started') {
            return { ...phase, status: 'in_progress' };
          }
        }
      }
      
      return phase;
    });

    // Update candidate data
    const updateData: Partial<Candidate> = {
      examHistory: [...candidate.examHistory, newExamAttempt],
      phases: updatedPhases
    };

    onUpdateCandidate(candidate.id, updateData);

    // Close modal and reset state
    setIsExamResultModalOpen(false);
    setCurrentExamPhase('highway_code');
    setExamResult('passed');
    
    alert(`Exam result recorded: ${examResult === 'passed' ? 'Passed' : 'Failed'}`);
  };

  // --- Documents Checklist Inline Edit Handlers ---
  const handleModifyClick = () => {
    // Copy the current documents to the temporary state
    setEditedDocuments([...candidate.documents]);
    // Activate edit mode
    setIsEditingDocuments(true);
  };

  const handleDocumentChange = (index: number, checked: boolean) => {
    // Update the temporary editedDocuments state
    setEditedDocuments(prevList => 
      prevList.map((doc, i) => (i === index ? { ...doc, checked } : doc))
    );
  };

  const handleCancelEdit = () => {
    // Discard temporary changes and exit edit mode
    setIsEditingDocuments(false);
  };
  
  const handleSaveChanges = () => {
    // Call the prop function to update the main data source
    onUpdateCandidate(candidate.id, { documents: editedDocuments });
    
    console.log('Documents saved and update function called.');
    setIsEditingDocuments(false);
  };

  // 3. UTILITY FUNCTIONS

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const getPhaseLabel = (phase: Phase) => {
    const labels: Record<Phase, string> = {
      highway_code: 'Highway Code',
      parking: 'Parking',
      driving: 'Driving'
    };
    return labels[phase];
  };

  const getStatusBadge = (status: PhaseStatus) => {
    if (status === 'completed') {
      return <span className="text-green-600 text-sm font-medium">completed</span>;
    }
    if (status === 'in_progress') {
      return <span className="text-blue-600 text-sm font-medium">in progress</span>;
    }
    if (status === 'failed') {
      return <span className="text-red-600 text-sm font-medium">failed</span>;
    }
    return <span className="text-gray-400 text-sm font-medium">not started</span>;
  };

  const getSessionStatusIcon = (status: 'scheduled' | 'completed' | 'cancelled') => {
    if (status === 'completed') {
      return (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    if (status === 'scheduled') {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const sessionStats = {
    completed: candidate.sessionHistory.filter(s => s.status === 'completed').length,
    scheduled: candidate.sessionHistory.filter(s => s.status === 'scheduled').length,
    cancelled: candidate.sessionHistory.filter(s => s.status === 'cancelled').length
  };

  // 4. MAIN RENDER
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Back Button & Header */}
      <div className="mb-6">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Candidates</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <p className="text-gray-600 text-sm">Candidate Details</p>
          </div>
          <button 
            onClick={handleDeleteCandidate} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete Candidate
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column content */}
        <div className="col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{candidate.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Age</label>
                <p className="text-gray-900 font-medium">{candidate.age} years</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900 font-medium">{candidate.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900 font-medium">{candidate.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">License Category</label>
                <p className="text-gray-900 font-medium">{candidate.licenseCategory}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Registration Date</label>
                <p className="text-gray-900 font-medium">{formatDate(candidate.registrationDate)}</p>
              </div>
            </div>
          </div>

          {/* Training Progress - UPDATED WITH MARK RESULT BUTTON UI */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h2>
            <div className="space-y-4">
              {candidate.phases.map((phase, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{getPhaseLabel(phase.phase)}</span>
                      <div className="flex items-center gap-3">
                        {/* Improved Mark Result Button UI */}
                        {phase.status === 'in_progress' && phase.examDate && (
                          <button
                            onClick={() => handleMarkResultClick(phase.phase)}
                            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-xs font-medium transition-colors shadow-md"
                          >
                            Mark Result
                          </button>
                        )}
                        {getStatusBadge(phase.status)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(phase.sessionsCompleted / phase.sessionsPlan) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {phase.sessionsCompleted} of {phase.sessionsPlan} sessions completed
                      {phase.examDate && (
                        <span className="ml-2 text-blue-600">
                          • Exam scheduled: {formatDate(phase.examDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            <div className="space-y-3">
              {candidate.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(payment.date)}</p>
                    <p className="text-sm text-gray-500">{payment.method} • {payment.note || 'No note'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{payment.amount} DZD</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold text-gray-900">Total Paid</span>
                <span className="font-bold text-blue-600">{candidate.paidAmount} DZD / {candidate.totalFee} DZD</span>
              </div>
            </div>
          </div>

          {/* Training Session History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Session History</h2>
            <div className="space-y-4">
              {candidate.sessionHistory.map((session) => (
                <div key={session.id} className="flex items-center gap-4">
                  {getSessionStatusIcon(session.status)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{getPhaseLabel(session.phase)} Session</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(session.date)} at {session.time}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${
                    session.status === 'completed' ? 'text-green-600' :
                    session.status === 'scheduled' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-6 text-sm">
                <div className="text-green-600">
                  <span className="font-semibold">{sessionStats.completed}</span> Completed
                </div>
                <div className="text-blue-600">
                  <span className="font-semibold">{sessionStats.scheduled}</span> Scheduled
                </div>
                <div className="text-red-600">
                  <span className="font-semibold">{sessionStats.cancelled}</span> Cancelled
                </div>
              </div>
            </div>
          </div>

          {/* Exam History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam History</h2>
            <div className="space-y-4">
              {candidate.examHistory.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-gray-900">{getPhaseLabel(exam.phase)} Exam</p>
                    <p className="text-sm text-gray-500">Attempt {exam.attemptNumber} • {formatDate(exam.date)}</p>
                    {exam.notes && <p className="text-sm text-gray-500 mt-1">{exam.notes}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    exam.passed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {exam.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Documents & Quick Actions */}
        <div className="space-y-6">
          
          {/* Documents Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents Checklist</h2>
              
              {!isEditingDocuments && (
                <button 
                  onClick={handleModifyClick}
                  className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Modify
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {documentsForDisplay.filter(d => d.checked).length} of {documentsForDisplay.length} documents submitted
            </p>
            
            {/* The Checklist - Conditionally Editable */}
            <div className="space-y-3">
              {documentsForDisplay.map((doc, index) => (
                <label 
                  key={index} 
                  className={`flex items-center gap-3 group ${isEditingDocuments ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={doc.checked}
                      onChange={isEditingDocuments ? (e) => handleDocumentChange(index, e.target.checked) : undefined}
                      readOnly={!isEditingDocuments}
                      className={`w-5 h-5 appearance-none border-2 rounded transition-colors ${
                        isEditingDocuments
                          ? 'border-gray-400 checked:bg-blue-600 checked:border-blue-600 cursor-pointer'
                          : 'border-gray-300 checked:bg-green-500 checked:border-green-500 cursor-default'
                      }`}
                    />
                    {doc.checked && (
                      <svg 
                        className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${doc.checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {doc.name}
                  </span>
                </label>
              ))}
            </div>
            
            {/* Conditional Save and Cancel Buttons */}
            {isEditingDocuments && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions - IMPROVED WITH BLUE HOVER EFFECTS */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/schedule"
                className="block w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-700">
                  Schedule Session
                </div>
                <div className="text-sm text-gray-500 group-hover:text-blue-600">Book a new training session</div>
              </Link>

              <Link
                href="/dashboard/schedule"
                className="block w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-700">
                  Schedule Exam
                </div>
                <div className="text-sm text-gray-500 group-hover:text-blue-600">Add a new payment record</div>
              </Link>

              <Link
                href="/dashboard/payments"
                className="block w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-700">
                  Record Payment 
                </div>
                <div className="text-sm text-gray-500 group-hover:text-blue-600">Record exam attempt</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delete Candidate
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>{candidate.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Result Modal - IMPROVED UI */}
      {isExamResultModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Record Exam Result 
              </h2>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Exam Details Section */}
              <div className="grid grid-cols-2 gap-4 border border-gray-200 p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">Candidate</p>
                  <p className="font-medium text-gray-900">{candidate.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phase</p>
                  <p className="font-medium text-gray-900">{getPhaseLabel(currentExamPhase)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Sessions Completed</p>
                  <p className="font-medium text-gray-900">
                    {candidate.phases.find(p => p.phase === currentExamPhase)?.sessionsCompleted} / 
                    {candidate.phases.find(p => p.phase === currentExamPhase)?.sessionsPlan}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Previous Attempts</p>
                  <p className="font-medium text-gray-900">
                    {candidate.examHistory.filter(e => e.phase === currentExamPhase).length}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Scheduled Exam Date</p>
                  <p className="font-medium text-gray-900">
                    {candidate.phases.find(p => p.phase === currentExamPhase)?.examDate 
                      ? formatDate(candidate.phases.find(p => p.phase === currentExamPhase)!.examDate!)
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>

              {/* Result Input Section */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Exam Result *</p>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    examResult === 'passed' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="examResult"
                      value="passed"
                      checked={examResult === 'passed'}
                      onChange={() => setExamResult('passed')}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-gray-900 font-medium">Passed </span>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    examResult === 'failed' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="examResult"
                      value="failed"
                      checked={examResult === 'failed'}
                      onChange={() => setExamResult('failed')}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-gray-900 font-medium">Failed </span>
                  </label>
                </div>
              </div>

              {examResult === 'passed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">
                    <span className="font-bold">Important:</span> Great! By law, candidate must wait 15 days from today before taking the next phase exam. Payment validation will be checked when scheduling sessions for the next phase.
                  </p>
                </div>
              )}
               {examResult === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">
                    <span className="font-bold">Important:</span> Candidate will need to wait 15 days before retaking this exam (legal requirement).
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsExamResultModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleExamResultSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Record Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}