
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, Clock, Plus } from 'lucide-react';

export const Medication = () => {
  const todayMedications = [
    { name: 'Amoxicillin', dosage: '1 tablet', time: '8:00 AM', taken: false },
    { name: 'Ibuprofen', dosage: '1 tablet', time: '12:00 PM', taken: true },
    { name: 'Paracetamol', dosage: '1 tablet', time: '6:00 PM', taken: false },
  ];

  const tomorrowMedications = [
    { name: 'Amoxicillin', dosage: '1 tablet', time: '8:00 AM', taken: false },
    { name: 'Ibuprofen', dosage: '1 tablet', time: '12:00 PM', taken: false },
    { name: 'Paracetamol', dosage: '1 tablet', time: '6:00 PM', taken: false },
  ];

  const MedicationCard = ({ medication, showDay = false }: { medication: any, showDay?: boolean }) => (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${
              medication.taken 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{medication.name}</h4>
              <p className="text-sm text-muted-foreground">{medication.dosage}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{medication.time}</span>
            </div>
            {medication.taken ? (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                Taken
              </Badge>
            ) : (
              <Button size="sm" variant="outline" className="text-xs">
                Mark Taken
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Medication Schedule" 
        showBack 
        rightAction={
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Today's Medications */}
        <div className="animate-fade-up">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Today</h3>
          <div className="space-y-3">
            {todayMedications.map((medication, index) => (
              <div key={index} style={{ animationDelay: `${index * 100}ms` }}>
                <MedicationCard medication={medication} />
              </div>
            ))}
          </div>
        </div>

        {/* Tomorrow's Medications */}
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Tomorrow</h3>
          <div className="space-y-3">
            {tomorrowMedications.map((medication, index) => (
              <div key={index} style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                <MedicationCard medication={medication} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <Card className="glass-card animate-fade-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="text-foreground">This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">85%</div>
                <div className="text-sm text-muted-foreground">Adherence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">18</div>
                <div className="text-sm text-muted-foreground">Doses Taken</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">3</div>
                <div className="text-sm text-muted-foreground">Missed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
