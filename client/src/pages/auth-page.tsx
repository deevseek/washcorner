import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Droplets, Car, User } from "lucide-react";
import { useLocation } from "wouter";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username diperlukan"),
  password: z.string().min(1, "Password diperlukan"),
});

type LoginValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username harus minimal 3 karakter"),
  password: z.string().min(6, "Password harus minimal 6 karakter"),
  name: z.string().min(2, "Nama diperlukan"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().default("staff"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "staff",
    },
  });

  // Handle login form submission
  function onLoginSubmit(data: LoginValues) {
    loginMutation.mutate(data);
  }

  // Handle register form submission
  function onRegisterSubmit(data: RegisterValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 overflow-hidden rounded-3xl shadow-2xl">
        {/* Logo section */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-800 p-6 md:p-10 flex flex-col">
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-md">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-white">Wash Corner</h1>
          </div>
          
          <div className="flex-grow flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              POS Cuci Kendaraan<br />Modern
            </h2>
            <p className="text-blue-100 mb-6">
              Solusi lengkap untuk bisnis jasa cuci mobil dan motor
            </p>
            
            <div className="hidden md:block space-y-4 mt-8">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <p className="text-white font-medium">Manajemen transaksi yang mudah</p>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-white font-medium">Pelacakan data pelanggan</p>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-white font-medium">Laporan dan analitik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form section */}
        <div className="md:col-span-3 bg-white p-6 md:p-10">
          {!showRegister ? (
            // Login Form
            <div className="h-full flex flex-col">
              <div className="text-center md:text-left mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
                <p className="text-gray-500 mt-1">Login untuk melanjutkan ke dashboard</p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5 flex-grow">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              <User className="h-5 w-5" />
                            </span>
                            <Input 
                              placeholder="Masukkan username" 
                              className="pl-10 py-6 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 9V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <Input
                              type="password"
                              placeholder="Masukkan password"
                              className="pl-10 py-6 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl transition-colors duration-200"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : null}
                    Masuk
                  </Button>
                </form>
              </Form>

              <div className="mt-8 text-center md:text-left">
                <p className="text-gray-600">
                  Belum punya akun?{" "}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Daftar akun baru
                  </button>
                </p>
              </div>
            </div>
          ) : (
            // Register Form
            <div className="h-full flex flex-col">
              <div className="text-center md:text-left mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h2>
                <p className="text-gray-500 mt-1">Daftar untuk menggunakan Wash Corner</p>
              </div>
              
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4 flex-grow"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Buat username" 
                              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Masukkan nama lengkap" 
                              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="mail@example.com"
                              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">No. Telepon</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="08123456789" 
                              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Minimal 6 karakter"
                            className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl transition-colors duration-200"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : null}
                    Daftar Sekarang
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center md:text-left">
                <p className="text-gray-600">
                  Sudah punya akun?{" "}
                  <button
                    onClick={() => setShowRegister(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
