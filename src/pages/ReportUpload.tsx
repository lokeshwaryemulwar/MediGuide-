
import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, Camera, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { analyzeReport } from '@/services/gemini';

export const ReportUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'text/plain'];

    if (file && validTypes.includes(file.type)) {
      setUploading(true);

      try {
        // Analyze report with Gemini AI
        const analysis = await analyzeReport(file);

        setUploading(false);
        setUploaded(true);

        // Save report with AI analysis to localStorage
        // Extract diagnosis/symptom from analysis summary
        let reportTitle = 'Medical Report';
        if (analysis?.summary) {
          // Extract the main diagnosis from the summary (first sentence or key finding)
          const summaryText = analysis.summary;
          // Try to extract diagnosis from common patterns
          const diagnosisMatch = summaryText.match(/(?:diagnosed with|shows|indicates|reveals|suggests)\s+([^.,:]+)/i);
          if (diagnosisMatch) {
            reportTitle = diagnosisMatch[1].trim();
          } else {
            // Use first meaningful part of summary (up to first period or 50 chars)
            const firstSentence = summaryText.split(/[.!?]/)[0].trim();
            reportTitle = firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
          }
        }

        const newReport = {
          id: Date.now(),
          title: reportTitle, // Use extracted diagnosis instead of filename
          date: new Date().toISOString().split('T')[0],
          type: file.type.includes('pdf') ? 'Lab Report' : file.type.includes('image') ? 'Imaging' : 'General',
          status: 'analyzed',
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          analysis: analysis // Store AI analysis
        };

        const existingReports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');
        existingReports.unshift(newReport); // Add to beginning
        localStorage.setItem('uploadedReports', JSON.stringify(existingReports));
        localStorage.setItem('currentReport', JSON.stringify(newReport));

        toast({
          title: "Report analyzed successfully!",
          description: "Your medical report has been analyzed by AI.",
        });

        // Navigate to analysis after a short delay
        setTimeout(() => {
          navigate('/reports/analysis');
        }, 1500);
      } catch (error) {
        setUploading(false);
        toast({
          title: "Analysis failed",
          description: "Please check your API key and try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Image, or Text file.",
        variant: "destructive",
      });
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Upload Report" showBack />

      <div className="p-4 space-y-6">
        <div className="text-center animate-fade-up">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload your report</h2>
          <p className="text-muted-foreground">Upload your medical report in PDF format</p>
        </div>

        <Card
          className={`glass-card border-2 border-dashed transition-all duration-200 animate-fade-up ${dragActive ? 'border-primary bg-primary/5' : 'border-border/50'
            }`}
          style={{ animationDelay: '100ms' }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-12 text-center">
            {uploaded ? (
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Upload Complete!</h3>
                  <p className="text-muted-foreground">Your report is being analyzed...</p>
                </div>
              </div>
            ) : uploading ? (
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary animate-pulse-soft">
                  <Stethoscope className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Report...</h3>
                  <p className="text-muted-foreground">Please wait while we process your file</p>
                </div>
                <div className="w-full bg-card rounded-full h-2">
                  <div className="medical-gradient h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary">
                  <FileText className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Drop your file here</h3>
                  <p className="text-muted-foreground mb-4">or click to browse</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={onButtonClick} className="medical-gradient">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <Button onClick={onCameraClick} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">PDF, Images (JPG, PNG, WebP), or Text files, max 10MB</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,.txt,.webp"
              onChange={handleChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h4 className="font-semibold text-foreground">What we can analyze:</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              'Blood test results',
              'X-ray and imaging reports',
              'Pathology reports',
              'Prescription summaries',
              'Diagnostic reports'
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-card/30 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
