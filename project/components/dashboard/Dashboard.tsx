'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, Car, CreditCard, AlertTriangle, Calendar, X, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { dashboardApi, candidatesApi, instructorsApi, vehiclesApi, scheduleApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

interface DashboardStats {
  totalCandidates: number;
  totalInstructors: number;
  totalVehicles: number;
  pendingPayments: {
    count: number;
    totalAmount: number;
  };
}

interface Candidate {
  _id: string;
  name: string;
  phases: Array<{
    phase: string;
    status: string;
    sessionsCompleted: number;
    sessionsPlan: number;
  }>;
}

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  licensePlate: string;
  instructorId?: string;
  maintenanceLogs?: Array<{ date: string }>;
}

interface Instructor {
  _id: string;
  name: string;
}

interface Session {
  _id: string;
  candidateId: string | { _id: string; name: string };
  instructorId: string | { _id: string; name: string };
  lessonType: string;
  date: string;
  time: string;
  status: string;
}

// Helper function to get the most recent Thursday
function getMostRecentThursday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToSubtract = dayOfWeek >= 4 ? dayOfWeek - 4 : dayOfWeek + 3;
  const thursday = new Date(today);
  thursday.setDate(today.getDate() - daysToSubtract);
  thursday.setHours(0, 0, 0, 0);
  return thursday;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, candidatesRes, vehiclesRes, instructorsRes, sessionsRes] = await Promise.all([
          dashboardApi.getStats(),
          candidatesApi.getAll({ limit: 100 }),
          vehiclesApi.getAll({ limit: 100 }),
          instructorsApi.getAll({ limit: 100 }),
          scheduleApi.getUpcoming(5)
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data as DashboardStats);
        }
        if (candidatesRes.success && candidatesRes.data) {
          // Handle both array and object response formats
          const candidatesData = Array.isArray(candidatesRes.data)
            ? candidatesRes.data
            : (candidatesRes.data as { candidates?: Candidate[] }).candidates || [];
          setCandidates(candidatesData as Candidate[]);
        }
        if (vehiclesRes.success && vehiclesRes.data) {
          // Handle both array and object response formats
          const vehiclesData = Array.isArray(vehiclesRes.data)
            ? vehiclesRes.data
            : (vehiclesRes.data as { vehicles?: Vehicle[] }).vehicles || [];
          setVehicles(vehiclesData as Vehicle[]);
        }
        if (instructorsRes.success && instructorsRes.data) {
          // Handle both array and object response formats
          const instructorsData = Array.isArray(instructorsRes.data)
            ? instructorsRes.data
            : (instructorsRes.data as { instructors?: Instructor[] }).instructors || [];
          setInstructors(instructorsData as Instructor[]);
        }
        if (sessionsRes.success && sessionsRes.data) {
          // Handle both array and object response formats
          const sessionsData = Array.isArray(sessionsRes.data)
            ? sessionsRes.data
            : (sessionsRes.data as { sessions?: Session[] }).sessions || [];
          setUpcomingSessions(sessionsData as Session[]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const upcomingExams = candidates.filter(c => {
    const currentPhase = c.phases?.find(p => p.status === 'in_progress');
    return currentPhase && currentPhase.sessionsCompleted >= currentPhase.sessionsPlan * 0.8;
  });

  // Get weekly maintenance reminders (each Thursday)
  const mostRecentThursday = getMostRecentThursday();
  const thursdayDateStr = mostRecentThursday.toISOString().split('T')[0];

  const maintenanceReminders = vehicles
    .filter(vehicle => {
      if (dismissedReminders.includes(vehicle._id)) {
        return false;
      }
      const hasRecentLog = vehicle.maintenanceLogs?.some(log => {
        const logDate = new Date(log.date);
        return logDate >= mostRecentThursday;
      });
      return !hasRecentLog;
    })
    .map(vehicle => ({
      ...vehicle,
      reminderDate: thursdayDateStr
    }));

  const handleDismissReminder = (vehicleId: string) => {
    setDismissedReminders([...dismissedReminders, vehicleId]);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats?.totalCandidates || 0,
      subtitle: `Active candidates`,
      icon: Users,
      color: 'blue',
      onClick: () => onNavigate('candidates')
    },
    {
      title: 'Instructors',
      value: stats?.totalInstructors || 0,
      subtitle: 'All active',
      icon: GraduationCap,
      color: 'green',
      onClick: () => onNavigate('instructors')
    },
    {
      title: 'Vehicles',
      value: stats?.totalVehicles || 0,
      subtitle: `${maintenanceReminders.length} maintenance due`,
      icon: Car,
      color: 'purple',
      onClick: () => onNavigate('vehicles')
    },
    {
      title: 'Pending Payments',
      value: `${(stats?.pendingPayments?.totalAmount || 0).toLocaleString()} DZD`,
      subtitle: `${stats?.pendingPayments?.count || 0} payments`,
      icon: CreditCard,
      color: 'orange',
      onClick: () => onNavigate('payments')
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.onClick}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <div className="mt-2 text-gray-900">{stat.value}</div>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-gray-900">Upcoming Exams</div>
              <p className="text-sm text-gray-600">Candidates ready for testing</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-500">No exams scheduled</p>
            ) : (
              upcomingExams.map(candidate => {
                const phase = candidate.phases?.find(p => p.status === 'in_progress');
                return (
                  <div key={candidate._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-gray-900">{candidate.name}</div>
                      <p className="text-sm text-gray-600">
                        {phase?.phase === 'highway_code' ? 'Highway Code' : 
                         phase?.phase === 'parking' ? 'Parking' : 'Driving'} - 
                        {phase?.sessionsCompleted}/{phase?.sessionsPlan} sessions
                      </p>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-gray-900">Maintenance Reminders</div>
              <p className="text-sm text-gray-600">Weekly vehicle inspections (Every Thursday)</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            {maintenanceReminders.length === 0 ? (
              <p className="text-sm text-gray-500">All vehicles up to date</p>
            ) : (
              maintenanceReminders.map(vehicle => {
                const instructor = instructors.find(i => i._id === vehicle.instructorId);

                return (
                  <div key={vehicle._id} className="flex items-start justify-between py-3 px-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex-1">
                      <div className="text-gray-900">{vehicle.brand} {vehicle.model}</div>
                      <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                      {instructor && (
                        <p className="text-sm text-gray-500 mt-1">Assigned to: {instructor.name}</p>
                      )}
                      <Badge variant="outline" className="mt-2 bg-white">
                        Due: {vehicle.reminderDate}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissReminder(vehicle._id)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-gray-900">Upcoming Sessions</div>
            <p className="text-sm text-gray-600">Scheduled training sessions</p>
          </div>
          <button 
            onClick={() => onNavigate('schedule')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Candidate</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Instructor</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Phase</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Date & Time</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">No upcoming sessions</td>
                </tr>
              ) : (
                upcomingSessions.map(session => {
                  const candidateName = typeof session.candidateId === 'object' ? session.candidateId.name : candidates.find(c => c._id === session.candidateId)?.name;
                  const instructorName = typeof session.instructorId === 'object' ? session.instructorId.name : instructors.find(i => i._id === session.instructorId)?.name;
                  return (
                    <tr key={session._id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-gray-900">{candidateName || 'Unknown'}</td>
                      <td className="py-3 px-4 text-gray-700">{instructorName || 'Unknown'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {session.lessonType === 'highway_code' ? 'Highway Code' :
                           session.lessonType === 'parking' ? 'Parking' : 'Driving'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{new Date(session.date).toLocaleDateString()} at {session.time}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-50 text-green-700 hover:bg-green-100">
                          {session.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
