// components/candidates/ExamHistory.tsx
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Award, Calendar } from "lucide-react";

interface ExamHistoryProps {
  candidate: any;
}

export function ExamHistory({ candidate }: ExamHistoryProps) {
  const formatPhaseName = (phase: string) => {
    return phase.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Exam History</h2>
      
      <div className="space-y-4">
        {candidate.examHistory.map((exam: any) => (
          <div key={exam.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium text-lg capitalize">
                    {formatPhaseName(exam.phase)}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {exam.date}
                  </div>
                  <div>Attempt #{exam.attemptNumber}</div>
                </div>
                
                {exam.notes && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {exam.notes}
                  </p>
                )}
              </div>
              
              <Badge
                className={
                  exam.passed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }
              >
                {exam.passed ? 'Passed' : 'Failed'}
              </Badge>
            </div>
          </div>
        ))}
        
        {candidate.examHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No exam history available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
