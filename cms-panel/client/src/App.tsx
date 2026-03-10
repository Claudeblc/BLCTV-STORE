import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import DashboardLayout from "./components/DashboardLayout";

// Super Admin pages
import SuperDashboard from "./pages/super/Dashboard";
import SuperAdmins from "./pages/super/Admins";
import SuperDevices from "./pages/super/Devices";
import SuperPlans from "./pages/super/Plans";
import SuperPayments from "./pages/super/Payments";
import SettingsPage from "./pages/super/SettingsPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Activate from "./pages/admin/Activate";
import MyDevices from "./pages/admin/MyDevices";
import PointsHistory from "./pages/admin/PointsHistory";
import SubResellers from "./pages/admin/SubResellers";
import StorePage from "./pages/StorePage";

function ProtectedRoute({ component: Component, requireSuperAdmin = false }: { component: React.ComponentType; requireSuperAdmin?: boolean }) {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (requireSuperAdmin && !isSuperAdmin) return <Redirect to="/admin/dashboard" />;

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to={isSuperAdmin ? "/super/dashboard" : "/admin/dashboard"} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={StorePage} />
      <Route path="/login" component={() => <AuthRoute component={Login} />} />
      <Route path="/change-password" component={ChangePassword} />

      {/* Super Admin */}
      <Route path="/super/dashboard" component={() => <ProtectedRoute component={SuperDashboard} requireSuperAdmin />} />
      <Route path="/super/admins" component={() => <ProtectedRoute component={SuperAdmins} requireSuperAdmin />} />
      <Route path="/super/devices" component={() => <ProtectedRoute component={SuperDevices} requireSuperAdmin />} />
      <Route path="/super/plans" component={() => <ProtectedRoute component={SuperPlans} requireSuperAdmin />} />
      <Route path="/super/payments" component={() => <ProtectedRoute component={SuperPayments} requireSuperAdmin />} />
      <Route path="/super/settings" component={() => <ProtectedRoute component={SettingsPage} requireSuperAdmin />} />

      {/* Admin */}
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/admin/activate" component={() => <ProtectedRoute component={Activate} />} />
      <Route path="/admin/devices" component={() => <ProtectedRoute component={MyDevices} />} />
      <Route path="/admin/points" component={() => <ProtectedRoute component={PointsHistory} />} />
      <Route path="/admin/sub-resellers" component={() => <ProtectedRoute component={SubResellers} />} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
