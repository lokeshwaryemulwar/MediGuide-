import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export const Medication = () => {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '' });

  useEffect(() => {
    const saved = localStorage.getItem('medications');
    if (saved) {
      setMedications(JSON.parse(saved));
    } else {
      // Default data for demo
      const defaults = [
        { id: '1', name: 'Amoxicillin', dosage: '1 tablet', time: '08:00', taken: false },
        { id: '2', name: 'Ibuprofen', dosage: '1 tablet', time: '12:00', taken: true },
      ];
      setMedications(defaults);
      localStorage.setItem('medications', JSON.stringify(defaults));
    }
  }, []);

  const saveMedications = (meds: MedicationItem[]) => {
    setMedications(meds);
    localStorage.setItem('medications', JSON.stringify(meds));
  };

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.time) {
      toast.error('Please fill all fields');
      return;
    }

    const newItem: MedicationItem = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      time: newMed.time,
      taken: false,
    };

    saveMedications([...medications, newItem]);
    setNewMed({ name: '', dosage: '', time: '' });
    setIsAddOpen(false);
    toast.success('Medication added successfully');
  };

  const toggleTaken = (id: string) => {
    const updated = medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    );
    saveMedications(updated);

    const med = updated.find(m => m.id === id);
    if (med?.taken) {
      toast.success(`Marked ${med.name} as taken`);
    }
  };

  const deleteMedication = (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    saveMedications(updated);
    toast.success('Medication removed');
  };

  const MedicationCard = ({ medication }: { medication: MedicationItem }) => (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${medication.taken
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
          <div className="text-right flex items-center gap-2">
            <div className="flex flex-col items-end mr-2">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{medication.time}</span>
              </div>
              {medication.taken ? (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 cursor-pointer" onClick={() => toggleTaken(medication.id)}>
                  Taken
                </Badge>
              ) : (
                <Button size="sm" variant="outline" className="text-xs" onClick={() => toggleTaken(medication.id)}>
                  Mark Taken
                </Button>
              )}
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => deleteMedication(medication.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input
                    placeholder="e.g. Amoxicillin"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    placeholder="e.g. 1 tablet"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  />
                </div>
                <Button className="w-full medical-gradient" onClick={handleAddMedication}>Add Medication</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-4 space-y-6">
        {/* Today's Medications */}
        <div className="animate-fade-up">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Your Schedule</h3>
          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No medications added yet.</p>
            ) : (
              medications.map((medication, index) => (
                <div key={medication.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <MedicationCard medication={medication} />
                </div>
              ))
            )}
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
                <div className="text-2xl font-bold text-green-400">
                  {medications.length > 0 ? Math.round((medications.filter(m => m.taken).length / medications.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Adherence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{medications.filter(m => m.taken).length}</div>
                <div className="text-sm text-muted-foreground">Doses Taken</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{medications.filter(m => !m.taken).length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
