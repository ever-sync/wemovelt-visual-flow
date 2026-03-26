import { lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthDeepLinkBridge from "./components/AuthDeepLinkBridge";
import PWAStatus from "@/components/PWAStatus";

const Welcome = lazy(() => import("./pages/Welcome"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Home = lazy(() => import("./pages/Home"));
const Treinos = lazy(() => import("./pages/Treinos"));
const Habitos = lazy(() => import("./pages/Habitos"));
const Frequencia = lazy(() => import("./pages/Frequencia"));
const Comunidade = lazy(() => import("./pages/Comunidade"));
const Admin = lazy(() => import("./pages/Admin"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Termos = lazy(() => import("./pages/Termos"));
const ExclusaoConta = lazy(() => import("./pages/ExclusaoConta"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteLoader = () => (
  <div className="app-shell flex min-h-screen items-center justify-center">
    <div className="app-panel flex h-20 w-20 items-center justify-center rounded-[2rem]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
    </div>
  </div>
);

const AppContent = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/exclusao-conta" element={<ExclusaoConta />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/treinos"
          element={
            <ProtectedRoute>
              <Treinos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habitos"
          element={
            <ProtectedRoute>
              <Habitos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/frequencia"
          element={
            <ProtectedRoute>
              <Frequencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comunidade"
          element={
            <ProtectedRoute>
              <Comunidade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: window.localStorage,
      key: "wemovelt-react-query-cache",
      throttleTime: 1000,
    }),
  );

  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24,
          buster: "wemovelt-pwa-v1",
        }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <AuthDeepLinkBridge />
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
          <PWAStatus />
        </TooltipProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
