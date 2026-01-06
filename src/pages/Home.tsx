
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Pill, MapPin, Activity, Bell, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [notifications] = useState(3);

  const quickActions = [
    {
      icon: FileText,
      title: 'Upload Report',
      description: 'Upload and analyze medical reports',
      path: '/reports/upload',
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Find nearby hospitals',
      path: '/appointments',
      color: 'bg-green-500/10 text-green-400',
    },
    {
      icon: Pill,
      title: 'Medications',
      description: 'Manage your medicine schedule',
      path: '/medication',
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: MapPin,
      title: 'Find Pharmacy',
      description: 'Locate nearby pharmacies',
      path: '/pharmacies',
      color: 'bg-orange-500/10 text-orange-400',
    },
  ];

  const recentActivity = [
    { type: 'report', title: 'Blood Test Results', time: '2 hours ago', status: 'analyzed' },
    { type: 'medication', title: 'Amoxicillin reminder', time: '4 hours ago', status: 'taken' },
    { type: 'appointment', title: 'Dr. Smith appointment', time: '1 day ago', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Healthcare Assistant"
      />

      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="glass-card rounded-xl p-6 animate-fade-up">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full medical-gradient flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome back!</h2>
              <p className="text-muted-foreground">Your health companion is here to help</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.path} to={action.path}>
                <Card className="glass-card hover:bg-card/70 transition-all duration-200 hover:scale-105 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-4">
                    <div className={`inline-flex p-3 rounded-lg ${action.color} mb-3`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Health Stats */}
        <Card className="glass-card animate-fade-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Today's Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Medications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">1</div>
                <div className="text-sm text-muted-foreground">Appointments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">2</div>
                <div className="text-sm text-muted-foreground">Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card animate-fade-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
