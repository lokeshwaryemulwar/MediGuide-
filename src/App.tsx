
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

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">Loading...</div>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return <Auth onLogin={login} />;
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
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
