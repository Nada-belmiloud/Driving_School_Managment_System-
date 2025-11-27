'use client';

import { useState } from 'react';
import { Users, GraduationCap, Car, CreditCard, AlertTriangle, Calendar, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { mockCandidates, mockInstructors, mockVehicles, mockSessions } from '../../lib/mockData';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

// Helper function to get the most recent Thursday
function getMostRecentThursday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // 4 is Thursday (Sunday = 0, Monday = 1, ..., Thursday = 4)
  const daysToSubtract = dayOfWeek >= 4 ? dayOfWeek - 4 : dayOfWeek + 3;
  const thursday = new Date(today);
  thursday.setDate(today.getDate() - daysToSubtract);
  thursday.setHours(0, 0, 0, 0);
  return thursday;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);
  const totalCandidates = mockCandidates.length;
  const activeCandidates = mockCandidates.filter(c => c.status === 'active').length;
  const totalInstructors = mockInstructors.length;
  const totalVehicles = mockVehicles.length;
  
  const pendingPayments = mockCandidates.filter(c => c.paidAmount < c.totalFee).length;
  const totalPending = mockCandidates.reduce((sum, c) => sum + (c.totalFee - c.paidAmount), 0);
  
  const upcomingExams = mockCandidates.filter(c => {
    const currentPhase = c.phases.find(p => p.status === 'in_progress');
    return currentPhase && currentPhase.sessionsCompleted >= currentPhase.sessionsPlan * 0.8;
  });
  
  // Get weekly maintenance reminders (each Thursday)
  const mostRecentThursday = getMostRecentThursday();
  const thursdayDateStr = mostRecentThursday.toISOString().split('T')[0];
  
  const maintenanceReminders = mockVehicles
    .filter(vehicle => {
      // Check if vehicle has been dismissed
      if (dismissedReminders.includes(vehicle.id)) {
        return false;
      }
      
      // Check if there's a log for this Thursday or later
      const hasRecentLog = vehicle.maintenanceLogs.some(log => {
        const logDate = new Date(log.date);
        return logDate >= mostRecentThursday;
      });
      
      return !hasRecentLog;
    })
    .map(vehicle => ({
      ...vehicle,
      reminderDate: thursdayDateStr
    }));
  
  const upcomingSessions = mockSessions.filter(s => s.status === 'scheduled').slice(0, 5);
  
  const handleDismissReminder = (vehicleId: string) => {
    setDismissedReminders([...dismissedReminders, vehicleId]);
  };

  const stats = [
    {
      title: 'Total Candidates',
      value: totalCandidates,
      subtitle: `${activeCandidates} active`,
      icon: Users,
      color: 'blue',
      onClick: () => onNavigate('candidates')
    },
    {
      title: 'Instructors',
      value: totalInstructors,
      subtitle: 'All active',
      icon: GraduationCap,
      color: 'green',
      onClick: () => onNavigate('instructors')
    },
    {
      title: 'Vehicles',
      value: totalVehicles,
      subtitle: `${maintenanceReminders.length} maintenance due`,
      icon: Car,
      color: 'purple',
      onClick: () => onNavigate('vehicles')
    },
    {
      title: 'Pending Payments',
      value: `${totalPending.toLocaleString()} DZD`,
      subtitle: `${pendingPayments} candidates`,
      icon: CreditCard,
      color: 'orange',
      onClick: () => onNavigate('payments')
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Ahmed Benali</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
                const phase = candidate.phases.find(p => p.status === 'in_progress');
                return (
                  <div key={candidate.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
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
                const instructor = mockInstructors.find(i => i.id === vehicle.instructorId);
                
                return (
                  <div key={vehicle.id} className="flex items-start justify-between py-3 px-4 bg-orange-50 border border-orange-200 rounded-lg">
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
                      onClick={() => handleDismissReminder(vehicle.id)}
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
              {upcomingSessions.map(session => {
                const candidate = mockCandidates.find(c => c.id === session.candidateId);
                const instructor = mockInstructors.find(i => i.id === session.instructorId);
                return (
                  <tr key={session.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-gray-900">{candidate?.name}</td>
                    <td className="py-3 px-4 text-gray-700">{instructor?.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {session.phase === 'highway_code' ? 'Highway Code' :
                         session.phase === 'parking' ? 'Parking' : 'Driving'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{session.date} at {session.time}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-100">
                        {session.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
