
import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Operations from "@/pages/Operations"; 
import Dashboard from "@/pages/Dashboard";
import Progress from "@/pages/Progress";
import Performance from "@/pages/Performance";
import Safety from "@/pages/Safety";
import Users from "@/pages/Users";
import Archives from "@/pages/Archives";
import Login from "@/pages/Login";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/operations" component={() => <ProtectedLayout><Operations /></ProtectedLayout>} />
      <Route path="/dashboard" component={() => <ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/progress" component={() => <ProtectedLayout><Progress /></ProtectedLayout>} />
      <Route path="/performance" component={() => <ProtectedLayout><Performance /></ProtectedLayout>} />
      <Route path="/safety" component={() => <ProtectedLayout><Safety /></ProtectedLayout>} />
      <Route path="/users" component={() => <ProtectedLayout><Users /></ProtectedLayout>} />
      <Route path="/archives" component={() => <ProtectedLayout><Archives /></ProtectedLayout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
