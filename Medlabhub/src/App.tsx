import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Identify from "./pages/Identify";
import Records from "./pages/Records";
import AST from "./pages/AST";
import Quiz from "./pages/Quiz";
import Database from "./pages/Database";
import Compare from "./pages/Compare";
import Flashcards from "./pages/Flashcards";
import Dashboard from "./pages/Dashboard";
import Install from "./pages/Install";
import MolecularBiology from "./pages/MolecularBiology";
import ClinicalChemistry from "./pages/ClinicalChemistry";
import Hematology from "./pages/Hematology";
import Immunology from "./pages/Immunology";
import BloodBank from "./pages/BloodBank";
import Pathology from "./pages/Pathology";
import NotFound from "./pages/NotFound";
import AITutorPage from "./pages/AITutorPage";
import Auth from "./pages/Auth";
import ImageRecognitionPage from "./pages/ImageRecognitionPage";
import ReferenceLibrary from "./pages/ReferenceLibrary";
import BioLab from "./pages/BioLab";
import Subscription from "./pages/Subscription";
import AdminDashboard from "./pages/AdminDashboard";
import LabCalculator from "./pages/LabCalculator";
import MolecularDocking from "./pages/MolecularDocking";
import LabReport from "./pages/LabReport";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
                <Route path="/database" element={<Database />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/molecular" element={<MolecularBiology />} />
                <Route path="/clinical-chemistry" element={<ClinicalChemistry />} />
                <Route path="/hematology" element={<Hematology />} />
                <Route path="/immunology" element={<Immunology />} />
                <Route path="/blood-bank" element={<BloodBank />} />
                <Route path="/pathology" element={<Pathology />} />
                <Route path="/reference-library" element={<ReferenceLibrary />} />
                <Route path="/lab-calculator" element={<LabCalculator />} />
                <Route path="/molecular-docking" element={<MolecularDocking />} />
                <Route path="/lab-report" element={<LabReport />} />
                <Route path="/biolab" element={<Navigate to="/molecular" replace />} />
                <Route path="/subscription" element={<Subscription />} />

                {/* Protected routes - require authentication */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/identify" element={<Identify />} />
                  <Route path="/records" element={<Records />} />
                  <Route path="/ast" element={<AST />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ai-tutor" element={<AITutorPage />} />
                  <Route path="/image-recognition" element={<ImageRecognitionPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
