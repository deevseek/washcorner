import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredPermission?: string;
  requiredRole?: string | string[];
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini.
          </p>
        </div>
      </Route>
    );
  }

  // Check required role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki peran yang diperlukan untuk mengakses halaman ini.
          </p>
        </div>
      </Route>
    );
  }

  // User is authenticated and has required permissions/roles
  return <Route path={path} component={Component} />;
}
