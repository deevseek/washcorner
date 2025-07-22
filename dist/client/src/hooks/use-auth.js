"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthContext = void 0;
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const queryClient_1 = require("../lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
const wouter_1 = require("wouter");
exports.AuthContext = (0, react_1.createContext)(null);
function AuthProvider({ children }) {
    const { toast } = (0, use_toast_1.useToast)();
    const [, navigate] = (0, wouter_1.useLocation)();
    // Use fixed cacheKey to prevent excessive refetching
    const cacheKey = 'auth-cache-v1';
    const { data: user, error, isLoading: isUserLoading, } = (0, react_query_1.useQuery)({
        queryKey: ["/api/user", cacheKey],
        queryFn: (0, queryClient_1.getQueryFn)({ on401: "returnNull" }),
        staleTime: 30000, // 30 seconds
        refetchInterval: false,
        refetchOnWindowFocus: false,
    });
    // Fetch user permissions if user is logged in
    const { data: permissionsData, isLoading: isPermissionsLoading, } = (0, react_query_1.useQuery)({
        queryKey: ["/api/current-user-permissions", cacheKey],
        queryFn: (0, queryClient_1.getQueryFn)({ on401: "returnNull" }),
        enabled: !!user, // Only fetch if user is logged in
        staleTime: 30000, // 30 seconds
        refetchInterval: false,
        refetchOnWindowFocus: false,
    });
    const isLoading = isUserLoading || isPermissionsLoading;
    const permissions = permissionsData?.permissions || [];
    // Helper functions for RBAC
    const hasPermission = (permissionName) => {
        if (!user)
            return false;
        return permissions.some(p => p.name === permissionName);
    };
    const hasRole = (role) => {
        if (!user)
            return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(user.role);
    };
    const loginMutation = (0, react_query_1.useMutation)({
        mutationFn: async (credentials) => {
            try {
                console.log("Attempting login with:", credentials.username);
                const res = await (0, queryClient_1.apiRequest)("POST", "/api/login", credentials);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Login gagal");
                }
                return await res.json();
            }
            catch (error) {
                console.error("Login error:", error);
                throw error;
            }
        },
        onSuccess: (user) => {
            console.log("Login success, setting user data");
            queryClient_1.queryClient.setQueryData(["/api/user", cacheKey], user);
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/current-user-permissions'] });
            // Force refresh semua data setelah login
            queryClient_1.queryClient.invalidateQueries();
            // Tampilkan toast
            toast({
                title: "Login berhasil",
                description: `Selamat datang, ${user.name}!`,
            });
            // Gunakan window.location untuk hard reload yang konsisten
            window.location.href = "/";
        },
        onError: (error) => {
            console.error("Login error in mutation:", error);
            toast({
                title: "Login gagal",
                description: error.message || "Terjadi kesalahan saat login",
                variant: "destructive",
            });
        },
    });
    const registerMutation = (0, react_query_1.useMutation)({
        mutationFn: async (credentials) => {
            try {
                console.log("Attempting registration with:", credentials.username);
                const res = await (0, queryClient_1.apiRequest)("POST", "/api/register", credentials);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Registrasi gagal");
                }
                return await res.json();
            }
            catch (error) {
                console.error("Registration error:", error);
                throw error;
            }
        },
        onSuccess: (user) => {
            console.log("Registration success, setting user data");
            queryClient_1.queryClient.setQueryData(["/api/user", cacheKey], user);
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/current-user-permissions'] });
            // Tampilkan toast
            toast({
                title: "Registrasi berhasil",
                description: "Akun Anda telah dibuat",
            });
            // Gunakan window.location untuk hard reload
            window.location.href = "/";
        },
        onError: (error) => {
            console.error("Registration error in mutation:", error);
            toast({
                title: "Registrasi gagal",
                description: error.message || "Terjadi kesalahan saat mendaftar",
                variant: "destructive",
            });
        },
    });
    const logoutMutation = (0, react_query_1.useMutation)({
        mutationFn: async () => {
            try {
                console.log("Attempting logout");
                const res = await (0, queryClient_1.apiRequest)("POST", "/api/logout");
                if (!res.ok) {
                    throw new Error("Logout gagal");
                }
                return;
            }
            catch (error) {
                console.error("Logout error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log("Logout success, clearing user data");
            queryClient_1.queryClient.setQueryData(["/api/user", cacheKey], null);
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/current-user-permissions'] });
            // Tampilkan toast
            toast({
                title: "Logout berhasil",
                description: "Anda telah keluar dari sistem",
            });
            // Gunakan window.location untuk hard reload
            window.location.href = "/auth";
        },
        onError: (error) => {
            console.error("Logout error in mutation:", error);
            toast({
                title: "Logout gagal",
                description: error.message || "Terjadi kesalahan saat logout",
                variant: "destructive",
            });
        },
    });
    return (<exports.AuthContext.Provider value={{
            user: user ?? null,
            isLoading,
            error,
            permissions,
            hasPermission,
            hasRole,
            loginMutation,
            logoutMutation,
            registerMutation,
        }}>
      {children}
    </exports.AuthContext.Provider>);
}
function useAuth() {
    const context = (0, react_1.useContext)(exports.AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
