
import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const ReportUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      setUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        setUploading(false);
        setUploaded(true);
        toast({
          title: "Report uploaded successfully!",
          description: "Your medical report is being analyzed.",
        });
        
        // Navigate to analysis after a short delay
        setTimeout(() => {
          navigate('/reports/analysis');
        }, 1500);
      }, 2000);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
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
          className={`glass-card border-2 border-dashed transition-all duration-200 animate-fade-up ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border/50'
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
                  <Upload className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Uploading...</h3>
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
                  <Button onClick={onButtonClick} className="medical-gradient">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">PDF files only, max 10MB</p>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
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
