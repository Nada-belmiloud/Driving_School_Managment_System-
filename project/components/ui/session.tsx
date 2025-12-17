// components/candidates/SessionHistory.tsx
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Clock } from "lucide-react";

interface SessionHistoryProps {
  candidate: any;
}

export function SessionHistory({ candidate }: SessionHistoryProps) {
  const formatPhaseName = (phase: string) => {
    return phase.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Training Session History</h2>
      
      <div className="space-y-3">
        {candidate.sessionHistory.map((session: any) => (
          <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 mt-1">{session.date}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {formatPhaseName(session.phase)}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.time}
                </p>
              </div>
            </div>
            <Badge
              className={
                session.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : session.status === 'scheduled'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }
            >
              {session.status === 'completed' ? 'Completed' : 
               session.status === 'scheduled' ? 'Scheduled' : 'Cancelled'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
