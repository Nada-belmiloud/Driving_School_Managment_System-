import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Car, 
  CreditCard, 
  Award,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'instructors', label: 'Instructors', icon: GraduationCap },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'history', label: 'History', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-gray-900">Auto-École</div>
            <div className="text-sm text-gray-500">Management</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-700">AB</span>
          </div>
          <div className="flex-1">
            <div className="text-gray-900">Ahmed Benali</div>
            <div className="text-sm text-gray-500">Manager</div>
          </div>
        </div>
        {onLogout && (
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        )}
      </div>
    </aside>
  );
}
