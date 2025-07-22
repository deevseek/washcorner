import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Customers from "@/pages/customers";
import Services from "@/pages/services";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import ServiceHistory from "@/pages/service-history";
import Settings from "@/pages/settings";
import HrdDashboard from "@/pages/hrd-dashboard";
import HrdEmployeeManagement from "@/pages/hrd-employee-management";
import HrdAttendance from "@/pages/hrd-attendance";
import HrdPayroll from "@/pages/hrd-payroll";
// Finance Management Pages
import Expenses from "@/pages/finance/expenses";
import ProfitLoss from "@/pages/finance/profit-loss";
// Admin-only management
import Users from "@/pages/admin/users";
import Roles from "@/pages/admin/roles";
import Profile from "@/pages/profile";
import NotificationSettings from "@/pages/notification-settings";
import TrackingPage from "@/pages/tracking-page";
import { AuthProvider } from "./hooks/use-auth";
import { ToastProvider } from "@/components/ui/use-toast"; // Import ToastProvider

function Router() {
  return (
    <Switch>
      {/* Dashboard accessible to all authenticated users */}
      <ProtectedRoute path="/" component={Dashboard} />

      {/* Transaction Management - accessible to all authenticated users */}
      <ProtectedRoute path="/transactions" component={Transactions} />

      {/* Customer Management */}
      <ProtectedRoute path="/customers" component={Customers} />

      {/* Service Management */}
      <ProtectedRoute path="/services" component={Services} />

      {/* Inventory Management - admin and manager only */}
      <ProtectedRoute
        path="/inventory"
        component={Inventory}
        requiredRole={["admin", "manager"]}
      />

      {/* Reports - for admin and manager only */}
      <ProtectedRoute
        path="/reports"
        component={Reports}
        requiredRole={["admin", "manager"]}
      />

      {/* Service History - admin and manager only */}
      <ProtectedRoute
        path="/service-history"
        component={ServiceHistory}
        requiredRole={["admin", "manager"]}
      />

      {/* Settings - admin and manager only */}
      <ProtectedRoute
        path="/settings"
        component={Settings}
        requiredRole={["admin", "manager"]}
      />

      {/* HRD Routes - admin and manager only */}
      <ProtectedRoute
        path="/hrd-dashboard"
        component={HrdDashboard}
        requiredRole={["admin", "manager"]}
      />

      <ProtectedRoute
        path="/hrd-employees"
        component={HrdEmployeeManagement}
        requiredRole={["admin", "manager"]}
      />

      <ProtectedRoute
        path="/hrd-attendance"
        component={HrdAttendance}
        requiredRole={["admin", "manager"]}
      />

      <ProtectedRoute
        path="/hrd-payroll"
        component={HrdPayroll}
        requiredRole={["admin", "manager"]}
      />

      {/* Finance Routes - admin and manager only */}
      <ProtectedRoute
        path="/finance/expenses"
        component={Expenses}
        requiredRole={["admin", "manager"]}
      />

      <ProtectedRoute
        path="/finance/profit-loss"
        component={ProfitLoss}
        requiredRole={["admin", "manager"]}
      />

      {/* Admin-only routes */}
      <ProtectedRoute path="/users" component={Users} requiredRole="admin" />

      <ProtectedRoute path="/roles" component={Roles} requiredRole="admin" />

      {/* Profil - accessible to all authenticated users */}
      <ProtectedRoute path="/profile" component={Profile} />

      {/* Notification Settings - admin only */}
      <ProtectedRoute
        path="/notification-settings"
        component={NotificationSettings}
        requiredRole="admin"
      />

      {/* Public Tracking Page */}
      <Route path="/tracking/:code" component={TrackingPage} />
      <Route path="/tracking" component={TrackingPage} />

      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      {/* Tempatkan ToastProvider di sini supaya toast bisa muncul di seluruh app */}
      <ToastProvider>
        <Toaster />
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}

export default App;
