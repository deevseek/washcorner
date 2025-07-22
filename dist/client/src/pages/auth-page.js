"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthPage;
const use_auth_1 = require("@/hooks/use-auth");
const react_1 = require("react");
const zod_1 = require("zod");
const react_hook_form_1 = require("react-hook-form");
const zod_2 = require("@hookform/resolvers/zod");
const button_1 = require("@/components/ui/button");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
const wouter_1 = require("wouter");
// Login form schema
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username diperlukan"),
    password: zod_1.z.string().min(1, "Password diperlukan"),
});
// Registration form schema
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username harus minimal 3 karakter"),
    password: zod_1.z.string().min(6, "Password harus minimal 6 karakter"),
    name: zod_1.z.string().min(2, "Nama diperlukan"),
    email: zod_1.z.string().email("Email tidak valid").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.string().default("staff"),
});
function AuthPage() {
    const { user, loginMutation, registerMutation } = (0, use_auth_1.useAuth)();
    const [showRegister, setShowRegister] = (0, react_1.useState)(false);
    const [, navigate] = (0, wouter_1.useLocation)();
    // Redirect if user is already logged in
    (0, react_1.useEffect)(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);
    // Login form
    const loginForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    // Register form
    const registerForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(registerSchema),
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
    function onLoginSubmit(data) {
        loginMutation.mutate(data);
    }
    // Handle register form submission
    function onRegisterSubmit(data) {
        registerMutation.mutate(data);
    }
    return (<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 overflow-hidden rounded-3xl shadow-2xl">
        {/* Logo section */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-800 p-6 md:p-10 flex flex-col">
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-md">
              <lucide_react_1.Droplets className="h-6 w-6 text-blue-600"/>
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
                  <lucide_react_1.Car className="h-5 w-5 text-white"/>
                </div>
                <p className="text-white font-medium">Manajemen transaksi yang mudah</p>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-white font-medium">Pelacakan data pelanggan</p>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

              <form_1.Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5 flex-grow">
                  <form_1.FormField control={loginForm.control} name="username" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-gray-700">Username</form_1.FormLabel>
                        <form_1.FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              <lucide_react_1.User className="h-5 w-5"/>
                            </span>
                            <input_1.Input placeholder="Masukkan username" className="pl-10 py-6 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                          </div>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <form_1.FormField control={loginForm.control} name="password" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-gray-700">Password</form_1.FormLabel>
                        <form_1.FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M17 9V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            <input_1.Input type="password" placeholder="Masukkan password" className="pl-10 py-6 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                          </div>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <button_1.Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl transition-colors duration-200" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-5 w-5 animate-spin"/>) : null}
                    Masuk
                  </button_1.Button>
                </form>
              </form_1.Form>

              <div className="mt-8 text-center md:text-left">
                <p className="text-gray-600">
                  Belum punya akun?{" "}
                  <button onClick={() => setShowRegister(true)} className="text-blue-600 hover:text-blue-800 font-medium">
                    Daftar akun baru
                  </button>
                </p>
              </div>
            </div>) : (
        // Register Form
        <div className="h-full flex flex-col">
              <div className="text-center md:text-left mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h2>
                <p className="text-gray-500 mt-1">Daftar untuk menggunakan Wash Corner</p>
              </div>
              
              <form_1.Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 flex-grow">
                  <div className="grid md:grid-cols-2 gap-4">
                    <form_1.FormField control={registerForm.control} name="username" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-gray-700">Username</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Buat username" className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    
                    <form_1.FormField control={registerForm.control} name="name" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-gray-700">Nama Lengkap</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Masukkan nama lengkap" className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <form_1.FormField control={registerForm.control} name="email" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-gray-700">Email</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="email" placeholder="mail@example.com" className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    
                    <form_1.FormField control={registerForm.control} name="phone" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-gray-700">No. Telepon</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="08123456789" className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <form_1.FormField control={registerForm.control} name="password" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-gray-700">Password</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="password" placeholder="Minimal 6 karakter" className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" {...field}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <button_1.Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl transition-colors duration-200" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-5 w-5 animate-spin"/>) : null}
                    Daftar Sekarang
                  </button_1.Button>
                </form>
              </form_1.Form>

              <div className="mt-6 text-center md:text-left">
                <p className="text-gray-600">
                  Sudah punya akun?{" "}
                  <button onClick={() => setShowRegister(false)} className="text-blue-600 hover:text-blue-800 font-medium">
                    Login
                  </button>
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
