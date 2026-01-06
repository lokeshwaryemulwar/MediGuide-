import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Search, Filter, TrendingUp, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const Reports = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // Load uploaded reports from localStorage only
    const uploadedReports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');

    // Set only uploaded reports (no mock data)
    const formattedReports = uploadedReports.map((report: any) => ({
      ...report,
      findings: report.status === 'analyzed' ? ['Analysis Complete', 'View full report for details'] : []
    }));

    setReports(formattedReports);
  }, []);

  const handleDeleteReport = (reportId: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to report details
    e.stopPropagation();

    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      // Remove from localStorage
      const uploadedReports = JSON.parse(localStorage.getItem('uploadedReports') || '[]');
      const updatedReports = uploadedReports.filter((report: any) => report.id !== reportId);
      localStorage.setItem('uploadedReports', JSON.stringify(updatedReports));

      // Update state
      setReports(updatedReports.map((report: any) => ({
        ...report,
        findings: report.status === 'analyzed' ? ['Analysis Complete', 'View full report for details'] : []
      })));

      toast({
        title: "Report deleted",
        description: "The report has been removed successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Medical Reports"
        showBack
        rightAction={
          <Link to="/reports/upload">
            <Button size="sm" className="medical-gradient">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Link>
        }
      />

      <div className="p-4 space-y-6">
        {/* Upload Section */}
        <Link to="/reports/upload">
          <Card className="glass-card border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 animate-fade-up">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload New Report</h3>
              <p className="text-muted-foreground">Upload your medical report in PDF format for AI analysis</p>
            </CardContent>
          </Card>
        </Link>

        {/* Search and Filter */}
        <div className="flex space-x-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm" className="px-4 py-3">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reports.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No reports uploaded yet</p>
                <p className="text-sm text-muted-foreground mt-2">Upload your first medical report to get started</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report, index) => (
              <Link key={report.id} to={`/reports/${report.id}`}>
                <Card className="glass-card hover:bg-card/70 transition-all duration-200 animate-fade-up"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">{report.title}</CardTitle>
                          <CardDescription>{report.date} • {report.type}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={report.status === 'analyzed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
                        >
                          {report.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          title="Delete report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {report.findings.length > 0 && (
                    <CardContent className="pt-0 pb-4">
                      <div className="space-y-2 pl-14">
                        <div className="flex items-center space-x-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">Key Findings:</span>
                        </div>
                        <div className="space-y-1 pl-6">
                          {report.findings.slice(0, 2).map((finding: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-2 text-sm text-muted-foreground">
                              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span>{finding}</span>
                            </div>
                          ))}
                          {report.findings.length > 2 && (
                            <div className="text-sm text-primary pl-3">+{report.findings.length - 2} more findings</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
