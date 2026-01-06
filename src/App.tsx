
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
import { Reports } from "./pages/Reports";
import { ReportUpload } from "./pages/ReportUpload";
import { ReportAnalysis } from "./pages/ReportAnalysis";
import { Appointments } from "./pages/Appointments";
import { Medication } from "./pages/Medication";
import { Pharmacies } from "./pages/Pharmacies";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ReminderSystem } from "./components/ReminderSystem";
import { NotificationProvider } from "./contexts/NotificationContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24">
          {/* Simple rotation spinner */}
          <svg className="animate-spin" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="60 200"
              className="text-primary opacity-75"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="40 150"
              className="text-blue-400 opacity-50"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
          </svg>
        </div>
        <p className="mt-8 text-lg font-medium text-foreground animate-pulse">Loading MediGuide...</p>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/upload" element={<ReportUpload />} />
          <Route path="/reports/analysis" element={<ReportAnalysis />} />
          <Route path="/reports/:id" element={<ReportAnalysis />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medication" element={<Medication />} />
          <Route path="/pharmacies" element={<Pharmacies />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <NotificationProvider>
          <AuthProvider>
            <ReminderSystem />
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
