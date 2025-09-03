import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";

// Lazy load pages to reduce initial bundle size
const Landing = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const AdminLanding = lazy(() => import("@/pages/admin-landing"));
const EmployeeLanding = lazy(() => import("@/pages/employee-landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Devices = lazy(() => import("@/pages/devices"));
const Requests = lazy(() => import("@/pages/requests"));
const Users = lazy(() => import("@/pages/users"));
const Monitoring = lazy(() => import("@/pages/monitoring"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

function Router() {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <Suspense fallback={<PageLoader />}>
            <Switch>
                {/* Public pages */}
                <Route path="/login" component={Login} />
                <Route path="/signup" component={Signup} />
                <Route path="/admin" component={AdminLanding} />
                <Route path="/employee" component={EmployeeLanding} />

                {!isAuthenticated ? (
                    <Route path="/" component={Landing} />
                ) : (
                    <>
                        {/* Role-based dashboards */}
                        {user?.role === "admin" ? (
                            <>
                                <Route
                                    path="/admin/dashboard"
                                    component={Dashboard}
                                />
                                <Route path="/devices" component={Devices} />
                                <Route path="/requests" component={Requests} />
                                <Route path="/users" component={Users} />
                                <Route path="/monitoring" component={Monitoring} />
                                {/* Redirect admin to admin dashboard */}
                                <Route
                                    path="/"
                                    component={() => {
                                        window.location.href = "/admin/dashboard";
                                        return null;
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                <Route
                                    path="/employee/dashboard"
                                    component={Dashboard}
                                />
                                <Route path="/requests" component={Requests} />
                                {/* Redirect employee to employee dashboard */}
                                <Route
                                    path="/"
                                    component={() => {
                                        window.location.href =
                                            "/employee/dashboard";
                                        return null;
                                    }}
                                />
                            </>
                        )}
                    </>
                )}
                <Route component={NotFound} />
            </Switch>
        </Suspense>
    );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
