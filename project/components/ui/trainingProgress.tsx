// components/candidates/TrainingProgress.tsx
import { Badge } from "../ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TrainingProgressProps {
  candidate: any;
}

export function TrainingProgress({ candidate }: TrainingProgressProps) {
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPhaseStatus = (phase: any, index: number) => {
    if (phase.status === 'completed') {
      return (
        <div className="mt-2">
          <div className="text-sm text-gray-600">
            Exam attempts: {phase.examAttempts} Last exam: {phase.lastExamDate}
          </div>
          <Badge className="bg-green-100 text-green-700 text-xs mt-1">
            Passed
          </Badge>
        </div>
      );
    } else if (phase.status === 'in_progress' && phase.examDate) {
      return (
        <div className="mt-2">
          <div className="text-sm text-gray-600">
            Exam scheduled for {phase.examDate}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Click "Mark Result" above to record the exam outcome.
          </div>
        </div>
      );
    } else if (phase.status === 'in_progress') {
      // Check if this is the last phase that needs payment
      const nextPhase = candidate.phases[index + 1];
      if (nextPhase && nextPhase.status === 'not_started') {
        const remainingPayment = candidate.totalFee - candidate.paidAmount;
        if (remainingPayment > 0) {
          return (
            <div className="mt-2">
              <div className="text-sm text-red-600 font-medium">
                ❌ Payment required to schedule sessions for next phase: {remainingPayment.toLocaleString()} DZD (current: {candidate.paidAmount.toLocaleString()} DZD)
              </div>
            </div>
          );
        }
      }
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Progress</h2>
      
      <div className="space-y-6">
        {candidate.phases.map((phase: any, index: number) => (
          <div key={phase.phase} className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPhaseIcon(phase.status)}
                  <h3 className="font-semibold text-lg capitalize">
                    {phase.phase.replace("_", " ")}
                  </h3>
                  <Badge
                    className={
                      phase.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : phase.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {phase.status === 'completed' ? 'Completed' : 
                     phase.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
                
                <div className="text-gray-700">
                  {phase.sessionsCompleted} / {phase.sessionsPlan} sessions completed
                </div>
                
                {getPhaseStatus(phase, index)}
              </div>
            </div>
            
            {index < candidate.phases.length - 1 && (
              <div className="my-4 border-t border-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}