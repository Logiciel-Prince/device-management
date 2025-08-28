import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import AdminLanding from "@/pages/admin-landing";
import EmployeeLanding from "@/pages/employee-landing";
import Dashboard from "@/pages/dashboard";
import Devices from "@/pages/devices";
import Requests from "@/pages/requests";
import Users from "@/pages/users";
import Monitoring from "@/pages/monitoring";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public landing pages */}
      <Route path="/admin" component={AdminLanding} />
      <Route path="/employee" component={EmployeeLanding} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Role-based dashboards */}
          {user?.role === "admin" ? (
            <>
              <Route path="/admin/dashboard" component={Dashboard} />
              <Route path="/devices" component={Devices} />
              <Route path="/requests" component={Requests} />
              <Route path="/users" component={Users} />
              <Route path="/monitoring" component={Monitoring} />
              {/* Redirect admin to admin dashboard */}
              <Route path="/" component={() => { window.location.href = "/admin/dashboard"; return null; }} />
            </>
          ) : (
            <>
              <Route path="/employee/dashboard" component={Dashboard} />
              <Route path="/requests" component={Requests} />
              {/* Redirect employee to employee dashboard */}
              <Route path="/" component={() => { window.location.href = "/employee/dashboard"; return null; }} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
