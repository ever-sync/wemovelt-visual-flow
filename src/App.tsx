import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Treinos from "./pages/Treinos";
import Habitos from "./pages/Habitos";
import Frequencia from "./pages/Frequencia";
import Comunidade from "./pages/Comunidade";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import WhatsAppButton from "./components/WhatsAppButton";

const AppContent = () => {
  const location = useLocation();
  const showWhatsApp = location.pathname !== "/";

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/treinos" element={
          <ProtectedRoute>
            <Treinos />
          </ProtectedRoute>
        } />
        <Route path="/habitos" element={
          <ProtectedRoute>
            <Habitos />
          </ProtectedRoute>
        } />
        <Route path="/frequencia" element={
          <ProtectedRoute>
            <Frequencia />
          </ProtectedRoute>
        } />
        <Route path="/comunidade" element={
          <ProtectedRoute>
            <Comunidade />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showWhatsApp && <WhatsAppButton />}
    </>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes default
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
