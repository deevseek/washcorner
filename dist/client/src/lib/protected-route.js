"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedRoute = ProtectedRoute;
const use_auth_1 = require("@/hooks/use-auth");
const lucide_react_1 = require("lucide-react");
const wouter_1 = require("wouter");
function ProtectedRoute({ path, component: Component, requiredPermission, requiredRole, }) {
    const { user, isLoading, hasPermission, hasRole } = (0, use_auth_1.useAuth)();
    if (isLoading) {
        return (<wouter_1.Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>
      </wouter_1.Route>);
    }
    // Redirect to login if not authenticated
    if (!user) {
        return (<wouter_1.Route path={path}>
        <wouter_1.Redirect to="/auth"/>
      </wouter_1.Route>);
    }
    // Check required permission if specified
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (<wouter_1.Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <lucide_react_1.ShieldAlert className="h-16 w-16 text-destructive"/>
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini.
          </p>
        </div>
      </wouter_1.Route>);
    }
    // Check required role if specified
    if (requiredRole && !hasRole(requiredRole)) {
        return (<wouter_1.Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <lucide_react_1.ShieldAlert className="h-16 w-16 text-destructive"/>
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki peran yang diperlukan untuk mengakses halaman ini.
          </p>
        </div>
      </wouter_1.Route>);
    }
    // User is authenticated and has required permissions/roles
    return <wouter_1.Route path={path} component={Component}/>;
}
