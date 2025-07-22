"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wouter_1 = require("wouter");
const toaster_1 = require("@/components/ui/toaster");
const tooltip_1 = require("@/components/ui/tooltip");
const not_found_1 = __importDefault(require("@/pages/not-found"));
const auth_page_1 = __importDefault(require("@/pages/auth-page"));
const protected_route_1 = require("./lib/protected-route");
const dashboard_1 = __importDefault(require("@/pages/dashboard"));
const transactions_1 = __importDefault(require("@/pages/transactions"));
const customers_1 = __importDefault(require("@/pages/customers"));
const services_1 = __importDefault(require("@/pages/services"));
const inventory_1 = __importDefault(require("@/pages/inventory"));
const reports_1 = __importDefault(require("@/pages/reports"));
const service_history_1 = __importDefault(require("@/pages/service-history"));
const settings_1 = __importDefault(require("@/pages/settings"));
const hrd_dashboard_1 = __importDefault(require("@/pages/hrd-dashboard"));
const hrd_employee_management_1 = __importDefault(require("@/pages/hrd-employee-management"));
const hrd_attendance_1 = __importDefault(require("@/pages/hrd-attendance"));
const hrd_payroll_1 = __importDefault(require("@/pages/hrd-payroll"));
// Finance Management Pages
const expenses_1 = __importDefault(require("@/pages/finance/expenses"));
const profit_loss_1 = __importDefault(require("@/pages/finance/profit-loss"));
// Admin-only management
const users_1 = __importDefault(require("@/pages/admin/users"));
const roles_1 = __importDefault(require("@/pages/admin/roles"));
const profile_1 = __importDefault(require("@/pages/profile"));
const notification_settings_1 = __importDefault(require("@/pages/notification-settings"));
const tracking_page_1 = __importDefault(require("@/pages/tracking-page"));
const use_auth_1 = require("./hooks/use-auth");
function Router() {
    return (<wouter_1.Switch>
      {/* Dashboard accessible to all authenticated users */}
      <protected_route_1.ProtectedRoute path="/" component={dashboard_1.default}/>
      
      {/* Transaction Management - accessible to all authenticated users */}
      <protected_route_1.ProtectedRoute path="/transactions" component={transactions_1.default}/>
      
      {/* Customer Management */}
      <protected_route_1.ProtectedRoute path="/customers" component={customers_1.default}/>
      
      {/* Service Management */}
      <protected_route_1.ProtectedRoute path="/services" component={services_1.default}/>
      
      {/* Inventory Management - admin and manager only */}
      <protected_route_1.ProtectedRoute path="/inventory" component={inventory_1.default} requiredRole={["admin", "manager"]}/>
      
      {/* Reports - for admin and manager only */}
      <protected_route_1.ProtectedRoute path="/reports" component={reports_1.default} requiredRole={["admin", "manager"]}/>
      
      {/* Service History - admin and manager only */}
      <protected_route_1.ProtectedRoute path="/service-history" component={service_history_1.default} requiredRole={["admin", "manager"]}/>
      
      {/* Settings - admin and manager only */}
      <protected_route_1.ProtectedRoute path="/settings" component={settings_1.default} requiredRole={["admin", "manager"]}/>
      
      {/* HRD Routes - admin and manager only */}
      <protected_route_1.ProtectedRoute path="/hrd-dashboard" component={hrd_dashboard_1.default} requiredRole={["admin", "manager"]}/>
      
      <protected_route_1.ProtectedRoute path="/hrd-employees" component={hrd_employee_management_1.default} requiredRole={["admin", "manager"]}/>
      
      <protected_route_1.ProtectedRoute path="/hrd-attendance" component={hrd_attendance_1.default} requiredRole={["admin", "manager"]}/>
      
      <protected_route_1.ProtectedRoute path="/hrd-payroll" component={hrd_payroll_1.default} requiredRole={["admin", "manager"]}/>
      
      {/* Finance Routes - admin and manager only */}
      <protected_route_1.ProtectedRoute path="/finance/expenses" component={expenses_1.default} requiredRole={["admin", "manager"]}/>
      
      <protected_route_1.ProtectedRoute path="/finance/profit-loss" component={profit_loss_1.default} requiredRole={["admin", "manager"]}/>
      
      {/* Admin-only routes */}
      <protected_route_1.ProtectedRoute path="/users" component={users_1.default} requiredRole="admin"/>
      
      <protected_route_1.ProtectedRoute path="/roles" component={roles_1.default} requiredRole="admin"/>
      
      {/* Profil - accessible to all authenticated users */}
      <protected_route_1.ProtectedRoute path="/profile" component={profile_1.default}/>
      
      {/* Notification Settings - admin only */}
      <protected_route_1.ProtectedRoute path="/notification-settings" component={notification_settings_1.default} requiredRole="admin"/>
      
      {/* Public Tracking Page */}
      <wouter_1.Route path="/tracking/:code" component={tracking_page_1.default}/>
      <wouter_1.Route path="/tracking" component={tracking_page_1.default}/>
      
      <wouter_1.Route path="/auth" component={auth_page_1.default}/>
      <wouter_1.Route component={not_found_1.default}/>
    </wouter_1.Switch>);
}
function App() {
    return (<tooltip_1.TooltipProvider>
      <toaster_1.Toaster />
      <use_auth_1.AuthProvider>
        <Router />
      </use_auth_1.AuthProvider>
    </tooltip_1.TooltipProvider>);
}
exports.default = App;
