import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/operations" component={Operations} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/progress" component={Progress} />
      <Route path="/performance" component={Performance} />
      <Route path="/safety" component={Safety} />
      <Route path="/users" component={Users} />
      <Route path="/archives" component={Archives} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <ProtectedRoutes />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
