
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, MapPin, Plus, Minus, Navigation, Clock, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { AppleMap } from '@/components/AppleMap';
import { useNotifications } from '@/contexts/NotificationContext';

interface Hospital {
  id: string;
  name: string;
  distance: string;
  specialties: string;
  rating: number;
  address: string;
  timeSlots: string[];
}

interface BookingData {
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  phoneNumber: string;
  timeSlot: string;
  date: string;
}

export const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    phoneNumber: '',
    timeSlot: '',
  });
  const { addNotification } = useNotifications();

  const handleHospitalsFound = (googleHospitals: any[]) => {
    const formattedHospitals: Hospital[] = googleHospitals.map(hospital => ({
      id: hospital.place_id,
      name: hospital.name,
      distance: 'Real location',
      specialties: 'General Hospital',
      rating: hospital.rating || 4.0,
      address: hospital.vicinity,
      timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
    }));
    setHospitals(formattedHospitals);
  };

  const handleBookAppointment = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = () => {
    if (!selectedHospital || !bookingData.patientName || !bookingData.phoneNumber || !bookingData.timeSlot) {
      toast.error('Please fill all required fields');
      return;
    }

    const appointment: BookingData = {
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      patientName: bookingData.patientName,
      phoneNumber: bookingData.phoneNumber,
      timeSlot: bookingData.timeSlot,
      date: new Date().toISOString().split('T')[0],
    };

    // Save to localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    existingAppointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(existingAppointments));

    // Add confirmation notification
    addNotification({
      title: 'Appointment Confirmed',
      message: `Your appointment at ${selectedHospital.name} for ${bookingData.timeSlot} has been confirmed.`,
      type: 'appointment'
    });

    toast.success(`Appointment booked at ${selectedHospital.name} for ${bookingData.timeSlot}`);
    setIsBookingOpen(false);
    setBookingData({ patientName: '', phoneNumber: '', timeSlot: '' });
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.specialties.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Nearby Hospitals" />

      <div className="p-4 space-y-6">
        {/* Search Section */}
        <div className="relative animate-fade-up">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for hospitals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 bg-card border-border text-foreground"
          />
        </div>

        {/* Google Map Section */}
        <Card className="glass-card animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="p-4 space-y-6">
            <AppleMap onHospitalsFound={handleHospitalsFound} />
          </div>
        </Card>

        {/* Hospital List */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <h4 className="font-semibold text-foreground">Nearby Hospitals ({filteredHospitals.length})</h4>
          {filteredHospitals.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Allow location access to find nearby hospitals</p>
              </CardContent>
            </Card>
          ) : (
            filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="glass-card hover:bg-card/70 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">{hospital.name}</h5>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{hospital.distance}</span>
                        <span>•</span>
                        <span>★ {hospital.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{hospital.address}</p>
                      <p className="text-sm text-muted-foreground mt-2">{hospital.specialties}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBookAppointment(hospital)}
                      className="medical-gradient"
                    >
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Booking Dialog */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Hospital</Label>
                <p className="text-sm text-muted-foreground">{selectedHospital?.name}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patientName"
                    placeholder="Enter patient name"
                    value={bookingData.patientName}
                    onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    value={bookingData.phoneNumber}
                    onChange={(e) => setBookingData({ ...bookingData, phoneNumber: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedHospital?.timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={bookingData.timeSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingData({ ...bookingData, timeSlot: slot })}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-3 w-3" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleBookingSubmit} className="w-full medical-gradient">
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
