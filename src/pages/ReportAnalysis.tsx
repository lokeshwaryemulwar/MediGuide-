import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, User, FileText, Pill, Clock, Calendar, AlertCircle, Activity, Loader2 } from 'lucide-react';
import { ChatInterface } from '@/components/ChatInterface';
import { toast } from 'sonner';

export const ReportAnalysis = () => {
  const [addedToSchedule, setAddedToSchedule] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load report data from localStorage
    const currentReport = localStorage.getItem('currentReport');
    if (currentReport) {
      try {
        const parsedReport = JSON.parse(currentReport);
        setReportData(parsedReport);

        // If analysis is a string (legacy/fallback), try to parse it if it looks like JSON
        // otherwise wrap it in a structure
        let analysis = parsedReport.analysis;
        if (typeof analysis === 'string') {
          try {
            analysis = JSON.parse(analysis);
          } catch (e) {
            // If not JSON, treat as summary
            analysis = { summary: analysis, findings: [], medications: [] };
          }
        }
        setReportData({ ...parsedReport, analysis });

        // Auto-add medicines if found
        if (analysis.medications && analysis.medications.length > 0) {
          // Helper function to convert time labels to specific times
          const convertTimeToSpecific = (timeLabel: string): string => {
            const lowerTime = timeLabel.toLowerCase();
            if (lowerTime.includes('morning') || lowerTime.includes('breakfast')) {
              return '08:00';
            } else if (lowerTime.includes('evening') || lowerTime.includes('afternoon')) {
              return '14:00';
            } else if (lowerTime.includes('night') || lowerTime.includes('dinner') || lowerTime.includes('bedtime')) {
              return '21:00';
            }
            // If already in HH:MM format or specific time, return as is
            return timeLabel;
          };

          const medicines = analysis.medications.map((med: any, index: number) => ({
            id: `auto_${Date.now()}_${index}`,
            name: med.name,
            dosage: med.dosage,
            time: convertTimeToSpecific(med.time),
            taken: false
          }));

          const existing = localStorage.getItem('medications');
          let currentMeds = existing ? JSON.parse(existing) : [];

          // Simple check to avoid duplicates (could be improved)
          const isDuplicate = currentMeds.some((m: any) => m.name === medicines[0].name);

          if (!isDuplicate) {
            const updatedMeds = [...currentMeds, ...medicines];
            localStorage.setItem('medications', JSON.stringify(updatedMeds));
            setAddedToSchedule(true);
            setTimeout(() => {
              toast.success("Medicines automatically added to your schedule!");
            }, 1000);
          } else {
            setAddedToSchedule(true);
          }
        }
      } catch (error) {
        console.error("Error parsing report data:", error);
        toast.error("Failed to load report data");
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading analysis...</div>;
  }

  if (!reportData) {
    return <div className="min-h-screen flex items-center justify-center">No report found. Please upload a report first.</div>;
  }

  const { analysis } = reportData;
  const findings = analysis.findings || [];
  const medications = analysis.medications || [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Report Analysis" showBack />

      <div className="p-4 space-y-6">
        {/* Understanding Section */}
        <Card className="glass-card animate-fade-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-xl">Report Summary</CardTitle>
            <CardDescription className="text-base leading-relaxed mt-2 text-foreground/80">
              {analysis.summary || "No summary available."}
            </CardDescription>
          </CardHeader>
          {analysis.patientDetails && (analysis.patientDetails.name || analysis.patientDetails.age) && (
            <CardContent className="pt-0 pb-4">
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                {analysis.patientDetails.name && (
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    <User size={14} />
                    {analysis.patientDetails.name}
                  </div>
                )}
                {analysis.patientDetails.age && (
                  <div className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    <span>Age: {analysis.patientDetails.age}</span>
                  </div>
                )}
                {analysis.patientDetails.gender && (
                  <div className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    <span>{analysis.patientDetails.gender}</span>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Key Findings */}
        {findings.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Key Findings
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {findings.map((finding: any, index: number) => (
                <Card key={index} className="glass-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-full ${finding.status === 'good' ? 'bg-green-500/10 text-green-500' : finding.status === 'warning' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {finding.status === 'good' ? <CheckCircle size={16} /> : finding.status === 'warning' ? <AlertCircle size={16} /> : <Activity size={16} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{finding.label}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{finding.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Prescribed Medications */}
        {medications.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Prescribed Medications
            </h3>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {medications.map((med: any, index: number) => (
                    <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground text-lg">{med.name}</div>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
                          <span className="flex items-center gap-1"><Clock size={14} /> {med.time}</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> {med.duration}</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium self-start sm:self-center whitespace-nowrap">
                        {med.dosage}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-muted/30 border-t border-border/50">
                  {addedToSchedule ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Automatically added to your Medicine Schedule</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Syncing with schedule...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Chat Assistant */}
        <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
          <ChatInterface context={`Report Summary: ${analysis.summary}\nFindings: ${JSON.stringify(findings)}\nMedications: ${JSON.stringify(medications)}`} />
        </div>
      </div>
    </div>
  );
};
