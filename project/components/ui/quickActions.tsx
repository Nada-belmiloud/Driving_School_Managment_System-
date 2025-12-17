// components/candidates/QuickActions.tsx
import { Button } from "../ui/button";
import { Calendar, FileText, CreditCard } from "lucide-react";

interface QuickActionsProps {
  candidate: any;
}

export function QuickActions({ candidate }: QuickActionsProps) {
  const actions = [
    { 
      icon: Calendar, 
      label: 'Schedule Session', 
      enabled: false,
      completed: false
    },
    { 
      icon: FileText, 
      label: 'Schedule Exam', 
      enabled: true,
      completed: true
    },
    { 
      icon: CreditCard, 
      label: 'Record Payment', 
      enabled: true,
      completed: true
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="flex gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.enabled ? "default" : "outline"}
            className={`flex items-center gap-2 flex-1 ${
              action.completed ? 'opacity-50' : ''
            }`}
            disabled={!action.enabled}
          >
            <div className="flex items-center gap-2">
              {action.completed ? (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              )}
              <action.icon className="w-4 h-4" />
            </div>
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
