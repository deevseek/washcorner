import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser, Permission } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type UserPermissionsResponse = {
  user: SelectUser;
  permissions: Permission[];
};

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  permissions: Permission[];
  error: Error | null;
  hasPermission: (permissionName: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
}

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  // Use fixed cacheKey to prevent excessive refetching
  const cacheKey = 'auth-cache-v1';
  
  const {
    data: user,
    error,
    isLoading: isUserLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user", cacheKey],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 30000, // 30 seconds
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
  
  // Fetch user permissions if user is logged in
  const {
    data: permissionsData,
    isLoading: isPermissionsLoading,
  } = useQuery<UserPermissionsResponse, Error>({
    queryKey: ["/api/current-user-permissions", cacheKey],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // 30 seconds
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
  
  const isLoading = isUserLoading || isPermissionsLoading;
  const permissions = permissionsData?.permissions || [];
  
  // Helper functions for RBAC
  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    return permissions.some(p => p.name === permissionName);
  };
  
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login with:", credentials.username);
        const res = await apiRequest("POST", "/api/login", credentials);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login gagal");
        }
        return await res.json();
      } catch (error: any) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login success, setting user data");
      queryClient.setQueryData(["/api/user", cacheKey], user);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-user-permissions'] });
      
      // Force refresh semua data setelah login
      queryClient.invalidateQueries();
      
      // Tampilkan toast
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${user.name}!`,
      });
      
      // Gunakan window.location untuk hard reload yang konsisten
      window.location.href = "/";
    },
    onError: (error: Error) => {
      console.error("Login error in mutation:", error);
      toast({
        title: "Login gagal",
        description: error.message || "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        console.log("Attempting registration with:", credentials.username);
        const res = await apiRequest("POST", "/api/register", credentials);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registrasi gagal");
        }
        return await res.json();
      } catch (error: any) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Registration success, setting user data");
      queryClient.setQueryData(["/api/user", cacheKey], user);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-user-permissions'] });
      
      // Tampilkan toast
      toast({
        title: "Registrasi berhasil",
        description: "Akun Anda telah dibuat",
      });
      
      // Gunakan window.location untuk hard reload
      window.location.href = "/";
    },
    onError: (error: Error) => {
      console.error("Registration error in mutation:", error);
      toast({
        title: "Registrasi gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting logout");
        const res = await apiRequest("POST", "/api/logout");
        if (!res.ok) {
          throw new Error("Logout gagal");
        }
        return;
      } catch (error: any) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Logout success, clearing user data");
      queryClient.setQueryData(["/api/user", cacheKey], null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-user-permissions'] });
      
      // Tampilkan toast
      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari sistem",
      });
      
      // Gunakan window.location untuk hard reload
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      console.error("Logout error in mutation:", error);
      toast({
        title: "Logout gagal",
        description: error.message || "Terjadi kesalahan saat logout",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        permissions,
        hasPermission,
        hasRole,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
