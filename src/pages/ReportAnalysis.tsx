
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, MessageCircle, Share } from 'lucide-react';

export const ReportAnalysis = () => {
  const findings = [
    { label: 'Blood Pressure', value: 'Normal', status: 'good' },
    { label: 'Cholesterol Levels', value: 'Slightly Elevated', status: 'warning' },
    { label: 'Glucose Levels', value: 'Within Range', status: 'good' },
  ];

  const chartData = [
    { month: 'Jan', value: 180 },
    { month: 'Feb', value: 190 },
    { month: 'Mar', value: 170 },
    { month: 'Apr', value: 200 },
    { month: 'May', value: 220 },
    { month: 'Jun', value: 210 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Report Analysis" showBack />

      <div className="p-4 space-y-6">
        {/* Understanding Section */}
        <Card className="glass-card animate-fade-up">
          <CardHeader>
            <CardTitle className="text-foreground">Understanding Your Report</CardTitle>
            <CardDescription>
              This section breaks down your medical report into easy-to-understand terms, highlighting 
              key findings and potential implications for your health. We'll use visuals to help you 
              grasp the information more effectively.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Key Findings */}
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Key Findings</h3>
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      finding.status === 'good' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{finding.label}</h4>
                      <p className="text-muted-foreground">{finding.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Visual Analysis */}
        <Card className="glass-card animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Visual Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Cholesterol Levels Over Time</h4>
                <div className="text-3xl font-bold text-foreground mb-2">210 mg/dL</div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-muted-foreground">Last 6 Months</span>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">+5%</Badge>
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="h-40 relative bg-card/30 rounded-lg p-4">
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(210, 100%, 56%)" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="hsl(210, 100%, 56%)" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Chart Line */}
                  <path
                    d="M 30 80 Q 80 60 130 90 Q 180 40 230 20 Q 260 30 270 25"
                    stroke="hsl(210, 100%, 56%)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse-soft"
                  />
                  
                  {/* Fill Area */}
                  <path
                    d="M 30 80 Q 80 60 130 90 Q 180 40 230 20 Q 260 30 270 25 L 270 100 L 30 100 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                  {chartData.map((item) => (
                    <span key={item.month}>{item.month}</span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                The chart above shows your cholesterol levels over the past six months. While your current 
                level is slightly elevated, monitoring this trend can help you and your doctor make informed 
                decisions about your health.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button className="w-full medical-gradient text-white font-semibold py-4 animate-fade-up" 
                style={{ animationDelay: '300ms' }}>
          <MessageCircle className="h-5 w-5 mr-2" />
          Discuss with Doctor
        </Button>
      </div>
    </div>
  );
};
