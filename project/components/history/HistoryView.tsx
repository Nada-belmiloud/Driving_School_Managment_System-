'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, DollarSign, BookOpen, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { candidatesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface CompletedCandidate {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  licenseCategory: string;
  registrationDate: string;
  completionDate?: string;
  paidAmount: number;
  examHistory: Array<{ id: string; phase: string; date: string; passed: boolean; attemptNumber: number; notes?: string }>;
  sessionHistory: Array<{ id: string; phase: string; date: string; time: string; status: string }>;
  payments: Array<{ id: string; amount: number; date: string; note?: string }>;
}

export function HistoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CompletedCandidate | null>(null);
  const [completedCandidates, setCompletedCandidates] = useState<CompletedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await candidatesApi.getAll({ status: 'completed', limit: 100 });
      if (result.success && result.data) {
        const candidates = (result.data as { candidates: CompletedCandidate[] }).candidates || [];
        // Transform data and filter for completed candidates
        const completed = candidates.filter((c: any) => c.status === 'completed' || c.completionDate);
        setCompletedCandidates(completed.map((c: any) => ({
          ...c,
          id: c._id,
          examHistory: c.examHistory || [],
          sessionHistory: c.sessionHistory || [],
          payments: c.payments || []
        })));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = completedCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.phone.includes(searchTerm) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGraduated = completedCandidates.length;
  const avgExamAttempts = completedCandidates.length > 0
    ? completedCandidates.reduce((sum, c) => sum + (c.examHistory?.length || 0), 0) / completedCandidates.length
    : 0;
  const firstTryPassRate = completedCandidates.length > 0
    ? completedCandidates.filter(c => c.examHistory?.every(e => e.attemptNumber === 1)).length / completedCandidates.length * 100
    : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Graduated Candidates</h1>
        <p className="text-gray-600">History of all candidates who completed their training</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-gray-900">{totalGraduated}</div>
              <p className="text-sm text-gray-600">Total Graduated</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900">{avgExamAttempts.toFixed(1)}</div>
              <p className="text-sm text-gray-600">Avg. Exam Attempts</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-gray-900">{firstTryPassRate.toFixed(0)}%</div>
              <p className="text-sm text-gray-600">First Try Success</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-gray-600">License</th>
                <th className="text-left py-3 px-4 text-gray-600">Registration</th>
                <th className="text-left py-3 px-4 text-gray-600">Completion</th>
                <th className="text-left py-3 px-4 text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 text-gray-600">Total Exams</th>
                <th className="text-left py-3 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No graduated candidates found
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(candidate => {
                  const completionDateStr = candidate.completionDate || '';
                  const duration = completionDateStr ? Math.ceil(
                    (new Date(completionDateStr).getTime() -
                     new Date(candidate.registrationDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                  ) : 0;

                  return (
                    <tr key={candidate._id || candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="text-gray-900">{candidate.name}</div>
                        <p className="text-sm text-gray-500">{candidate.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{candidate.licenseCategory}</Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(candidate.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {candidate.completionDate ? new Date(candidate.completionDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {duration} days
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-900">{candidate.examHistory.length}</span>
                          <span className="text-xs text-gray-500">attempts</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCandidate.name} - Complete History</DialogTitle>
              <DialogDescription>
                Complete training and exam history for this graduated candidate
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <div className="text-gray-900">{new Date(selectedCandidate.registrationDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Date</p>
                  <div className="text-gray-900">{selectedCandidate.completionDate ? new Date(selectedCandidate.completionDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">License Category</p>
                  <Badge variant="outline">{selectedCandidate.licenseCategory}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Fee Paid</p>
                  <div className="text-gray-900">{selectedCandidate.paidAmount.toLocaleString()} DZD</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-blue-900">{selectedCandidate.sessionHistory.filter(s => s.status === 'completed').length}</div>
                  <p className="text-sm text-blue-700">Sessions Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-blue-900">{selectedCandidate.examHistory.length}</div>
                  <p className="text-sm text-blue-700">Total Exam Attempts</p>
                </div>
                <div className="text-center">
                  <div className="text-blue-900">
                    {(() => {
                      const completionDate = selectedCandidate.completionDate || '';
                      return completionDate ? Math.ceil(
                        (new Date(completionDate).getTime() -
                         new Date(selectedCandidate.registrationDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                      ) : 0;
                    })()} days
                  </div>
                  <p className="text-sm text-blue-700">Training Duration</p>
                </div>
              </div>

              <div>
                <div className="text-gray-900 mb-3">Phase Completion Timeline</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['highway_code', 'parking', 'driving'].map(phaseKey => {
                    const phaseExams = selectedCandidate.examHistory.filter(e => e.phase === phaseKey);
                    const passedExam = phaseExams.find(e => e.passed);
                    const phaseName = phaseKey === 'highway_code' ? 'Highway Code' :
                                     phaseKey === 'parking' ? 'Parking' : 'Driving';
                    
                    return (
                      <div key={phaseKey} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div className="text-sm text-gray-900">{phaseName}</div>
                        </div>
                        {passedExam && (
                          <>
                            <p className="text-xs text-gray-500 mb-1">Passed: {passedExam.date}</p>
                            <Badge variant="outline" className="text-xs">
                              {phaseExams.length === 1 ? '1st attempt ⭐' : `${phaseExams.length} attempts`}
                            </Badge>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-gray-700" />
                  <div className="text-gray-900">Detailed Exam History</div>
                </div>
                <div className="space-y-2">
                  {selectedCandidate.examHistory.map(exam => (
                    <div key={exam.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {exam.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <div>
                            <div className="text-sm text-gray-900">
                              {exam.phase === 'highway_code' ? 'Highway Code' :
                               exam.phase === 'parking' ? 'Parking' : 'Driving'}
                            </div>
                            <p className="text-xs text-gray-500">{exam.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={exam.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                            {exam.passed ? 'Passed' : 'Failed'}
                          </Badge>
                          <span className="text-xs text-gray-500">Attempt #{exam.attemptNumber}</span>
                        </div>
                      </div>
                      {exam.notes && (
                        <p className="text-sm text-gray-600 mt-2">{exam.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-gray-700" />
                  <div className="text-gray-900">Training Sessions ({selectedCandidate.sessionHistory.length} total)</div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedCandidate.sessionHistory.map(session => (
                    <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {session.phase === 'highway_code' ? 'Highway Code' :
                             session.phase === 'parking' ? 'Parking' : 'Driving'}
                          </div>
                          <p className="text-xs text-gray-500">{session.date} at {session.time}</p>
                        </div>
                      </div>
                      <Badge className={
                        session.status === 'completed' ? 'bg-green-50 text-green-700' :
                        session.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-gray-700" />
                  <div className="text-gray-900">Payment History</div>
                </div>
                <div className="space-y-2">
                  {selectedCandidate.payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm text-gray-900">{payment.amount.toLocaleString()} DZD</div>
                        <p className="text-xs text-gray-500">{payment.note || 'Payment'}</p>
                      </div>
                      <div className="text-sm text-gray-600">{payment.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
