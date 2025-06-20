
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react';

interface Appointment {
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  phoneNumber: string;
  timeSlot: string;
  date: string;
}

export const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    setAppointments(savedAppointments);
  }, []);

  if (appointments.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No appointments booked yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Appointment History</h3>
      {appointments.map((appointment, index) => (
        <Card key={index} className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{appointment.hospitalName}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.timeSlot}</span>
                <Badge variant="secondary" className="ml-auto">Confirmed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
