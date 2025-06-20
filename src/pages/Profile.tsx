
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { AppointmentHistory } from '@/components/AppointmentHistory';

export const Profile = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showAppointments, setShowAppointments] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (showAppointments) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="My Appointments" showBack />
        <div className="p-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAppointments(false)}
            className="mb-4"
          >
            Back to Profile
          </Button>
          <AppointmentHistory />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Profile" />

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card className="glass-card animate-fade-up">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full medical-gradient flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    Verified
                  </Badge>
                  <Badge variant="secondary">Premium</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle Button */}
        <Button 
          variant="outline" 
          className="w-full animate-fade-up" 
          style={{ animationDelay: '100ms' }}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Switch to Dark Mode
            </>
          )}
        </Button>

        {/* Appointments Button */}
        <Button 
          variant="outline" 
          className="w-full animate-fade-up" 
          style={{ animationDelay: '200ms' }}
          onClick={() => setShowAppointments(true)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          My Appointments
        </Button>
      </div>
    </div>
  );
};
