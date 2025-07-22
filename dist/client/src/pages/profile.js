"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const react_hook_form_1 = require("react-hook-form");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const separator_1 = require("@/components/ui/separator");
const form_1 = require("@/components/ui/form");
const use_toast_1 = require("@/hooks/use-toast");
const queryClient_1 = require("@/lib/queryClient");
const use_auth_1 = require("@/hooks/use-auth");
const avatar_1 = require("@/components/ui/avatar");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
// Schema untuk form profil
const profileFormSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username minimal 3 karakter'),
    name: zod_1.z.string().min(2, 'Nama minimal 2 karakter'),
    email: zod_1.z.string().email('Format email tidak valid').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
// Schema untuk form ubah password
const passwordChangeSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6, 'Password minimal 6 karakter'),
    newPassword: zod_1.z.string().min(6, 'Password baru minimal 6 karakter'),
    confirmPassword: zod_1.z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});
// Fungsi untuk mendapatkan inisial dari nama
function getInitials(name = '') {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
function ProfilePage() {
    const { toast } = (0, use_toast_1.useToast)();
    const { user } = (0, use_auth_1.useAuth)();
    const [activeTab, setActiveTab] = (0, react_1.useState)('profile');
    const [lastLoginTime, setLastLoginTime] = (0, react_1.useState)('-');
    // Form untuk profil
    const profileForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(profileFormSchema),
        defaultValues: {
            username: user?.username || '',
            name: user?.name || '',
            email: '',
            phone: '',
        },
        mode: 'onChange'
    });
    // Form untuk ubah password
    const passwordForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        mode: 'onChange'
    });
    // Efek untuk mengisi form setiap kali data user berubah
    (0, react_1.useEffect)(() => {
        if (user) {
            // Set tanggal login terakhir (contoh)
            setLastLoginTime((0, date_fns_1.format)(new Date(), 'dd MMMM yyyy, HH:mm', { locale: locale_1.id }));
            // Isi form dengan data user
            profileForm.reset({
                username: user.username,
                name: user.name,
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user, profileForm]);
    // Query untuk mendapatkan data lengkap profil
    const { data: profileData, isLoading: isLoadingProfile } = (0, react_query_1.useQuery)({
        queryKey: ['/api/profile'],
        queryFn: async () => {
            try {
                const res = await (0, queryClient_1.apiRequest)('GET', '/api/profile');
                return res.json();
            }
            catch (error) {
                console.error('Error fetching profile:', error);
                // Default data jika tidak berhasil
                return null;
            }
        },
        enabled: !!user, // Hanya dijalankan jika user sudah login
    });
    // Mutation untuk update profil
    const updateProfile = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('PUT', '/api/profile', data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Profil berhasil diperbarui',
                description: 'Data profil Anda telah berhasil disimpan',
            });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        },
        onError: (error) => {
            toast({
                title: 'Gagal memperbarui profil',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk ubah password
    const changePassword = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Password berhasil diubah',
                description: 'Password Anda telah berhasil diperbarui',
            });
            passwordForm.reset({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        },
        onError: (error) => {
            toast({
                title: 'Gagal mengubah password',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Handler untuk submit form profil
    const onSubmitProfile = (data) => {
        updateProfile.mutate(data);
    };
    // Handler untuk submit form password
    const onSubmitPasswordChange = (data) => {
        changePassword.mutate(data);
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Profil Pengguna"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Profil Pengguna" subtitle="Lihat dan kelola informasi profil Anda" actions={[]}/>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Profil Card - Kolom Kiri */}
            <card_1.Card className="lg:col-span-1">
              <card_1.CardContent className="p-6 flex flex-col items-center">
                <div className="mb-4 mt-4 flex flex-col items-center">
                  <avatar_1.Avatar className="h-24 w-24 mb-4">
                    <avatar_1.AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {user ? getInitials(user.name) : 'U'}
                    </avatar_1.AvatarFallback>
                  </avatar_1.Avatar>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.username}</p>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mt-2">
                    {user?.role === 'admin' ? 'Administrator' :
            user?.role === 'manager' ? 'Manager' :
                user?.role === 'kasir' ? 'Kasir' : 'Pengguna'}
                  </div>
                </div>
                
                <separator_1.Separator className="my-4"/>
                
                <div className="w-full space-y-4">
                  <div className="flex items-center">
                    <lucide_react_1.User className="text-gray-400 w-5 h-5 mr-3"/>
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{user?.username}</p>
                    </div>
                  </div>
                  
                  {profileData?.email && (<div className="flex items-center">
                      <lucide_react_1.Mail className="text-gray-400 w-5 h-5 mr-3"/>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profileData.email}</p>
                      </div>
                    </div>)}
                  
                  {profileData?.phone && (<div className="flex items-center">
                      <lucide_react_1.Phone className="text-gray-400 w-5 h-5 mr-3"/>
                      <div>
                        <p className="text-sm text-muted-foreground">Telepon</p>
                        <p className="font-medium">{profileData.phone}</p>
                      </div>
                    </div>)}
                  
                  <div className="flex items-center">
                    <lucide_react_1.Calendar className="text-gray-400 w-5 h-5 mr-3"/>
                    <div>
                      <p className="text-sm text-muted-foreground">Login Terakhir</p>
                      <p className="font-medium">{lastLoginTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <lucide_react_1.Shield className="text-gray-400 w-5 h-5 mr-3"/>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            {/* Tab Content - Kolom Kanan */}
            <div className="lg:col-span-2">
              <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
                <tabs_1.TabsList className="grid w-full grid-cols-2">
                  <tabs_1.TabsTrigger value="profile" className="flex items-center">
                    <lucide_react_1.User className="mr-2 h-4 w-4"/>
                    <span>Edit Profil</span>
                  </tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="security" className="flex items-center">
                    <lucide_react_1.Key className="mr-2 h-4 w-4"/>
                    <span>Keamanan</span>
                  </tabs_1.TabsTrigger>
                </tabs_1.TabsList>
                
                <div className="mt-6">
                  {/* Tab Profil */}
                  <tabs_1.TabsContent value="profile">
                    <card_1.Card>
                      <card_1.CardHeader className="px-6 py-4">
                        <card_1.CardTitle>Edit Informasi Profil</card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        <form_1.Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                            <alert_1.Alert className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
                              <alert_1.AlertTitle className="text-blue-700 font-medium">Informasi Profil</alert_1.AlertTitle>
                              <alert_1.AlertDescription>
                                Perbarui informasi profil Anda di bawah ini. Email dan nomor telepon akan digunakan untuk komunikasi.
                              </alert_1.AlertDescription>
                            </alert_1.Alert>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <form_1.FormField control={profileForm.control} name="username" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Username</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input placeholder="Username" {...field} disabled={true} className="bg-gray-50"/>
                                    </form_1.FormControl>
                                    <form_1.FormDescription>
                                      Username tidak dapat diubah
                                    </form_1.FormDescription>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>)}/>
                              
                              <form_1.FormField control={profileForm.control} name="name" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Nama Lengkap</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input placeholder="Nama lengkap" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>)}/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <form_1.FormField control={profileForm.control} name="email" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Email</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input type="email" placeholder="email@example.com" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>)}/>
                              
                              <form_1.FormField control={profileForm.control} name="phone" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Nomor Telepon</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input placeholder="08xxxxxxxxxx" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>)}/>
                            </div>
                            
                            <div className="flex justify-end">
                              <button_1.Button type="submit" className="flex items-center" disabled={updateProfile.isPending || !profileForm.formState.isDirty}>
                                {updateProfile.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Save className="mr-2 h-4 w-4"/>)}
                                Simpan Perubahan
                              </button_1.Button>
                            </div>
                          </form>
                        </form_1.Form>
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>
                  
                  {/* Tab Keamanan */}
                  <tabs_1.TabsContent value="security">
                    <card_1.Card>
                      <card_1.CardHeader className="px-6 py-4">
                        <card_1.CardTitle>Keamanan Akun</card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        <form_1.Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-6">
                            <alert_1.Alert className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
                              <alert_1.AlertTitle className="text-blue-700 font-medium">Ubah Password</alert_1.AlertTitle>
                              <alert_1.AlertDescription>
                                Pastikan password baru Anda cukup kuat dan berbeda dari password sebelumnya.
                              </alert_1.AlertDescription>
                            </alert_1.Alert>
                            
                            <form_1.FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<form_1.FormItem>
                                  <form_1.FormLabel>Password Saat Ini</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input type="password" placeholder="Masukkan password saat ini" {...field}/>
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>)}/>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <form_1.FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Password Baru</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input type="password" placeholder="Masukkan password baru" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>)}/>
                              
                              <form_1.FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Konfirmasi Password</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <input_1.Input type="password" placeholder="Konfirmasi password baru" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                  </form_1.FormItem>)}/>
                            </div>
                            
                            <div className="flex justify-end">
                              <button_1.Button type="submit" className="flex items-center" disabled={changePassword.isPending || !passwordForm.formState.isDirty}>
                                {changePassword.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Key className="mr-2 h-4 w-4"/>)}
                                Ubah Password
                              </button_1.Button>
                            </div>
                          </form>
                        </form_1.Form>
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>
                </div>
              </tabs_1.Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
