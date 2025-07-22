"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Settings;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const switch_1 = require("@/components/ui/switch");
const separator_1 = require("@/components/ui/separator");
const use_toast_1 = require("@/hooks/use-toast");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const lucide_react_1 = require("lucide-react");
// Form schema for business settings
const businessSettingsSchema = zod_2.z.object({
    businessName: zod_2.z.string().min(1, 'Nama bisnis harus diisi'),
    address: zod_2.z.string().optional(),
    phone: zod_2.z.string().optional(),
    email: zod_2.z.string().email('Format email tidak valid').optional().or(zod_2.z.literal('')),
    taxNumber: zod_2.z.string().optional(),
    logo: zod_2.z.string().optional(),
    receiptFooter: zod_2.z.string().optional(),
});
// Form schema for notification settings
const notificationSettingsSchema = zod_2.z.object({
    lowStockNotification: zod_2.z.boolean().default(true),
    lowStockThreshold: zod_2.z.number().min(1, 'Nilai minimum 1').or(zod_2.z.string().transform(val => parseInt(val) || 0)),
    emailNotifications: zod_2.z.boolean().default(false),
    smsNotifications: zod_2.z.boolean().default(false),
    dailyReportEmail: zod_2.z.boolean().default(false),
});
// Form schema for password change
const passwordChangeSchema = zod_2.z.object({
    currentPassword: zod_2.z.string().min(1, 'Password saat ini harus diisi'),
    newPassword: zod_2.z.string().min(6, 'Password baru minimal 6 karakter'),
    confirmPassword: zod_2.z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Password baru dan konfirmasi tidak cocok',
    path: ['confirmPassword'],
});
function Settings() {
    const [activeTab, setActiveTab] = (0, react_1.useState)('business');
    const { toast } = (0, use_toast_1.useToast)();
    // Initialize forms for each settings section
    const businessForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(businessSettingsSchema),
        defaultValues: {
            businessName: 'Wash Corner',
            address: 'Jl. Cuci Kendaraan No. 123, Jakarta',
            phone: '021-12345678',
            email: 'info@washcorner.com',
            taxNumber: '12.345.678.9-101.012',
            logo: '',
            receiptFooter: 'Terima kasih telah menggunakan jasa kami.\nSilahkan datang kembali!',
        },
    });
    const notificationForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(notificationSettingsSchema),
        defaultValues: {
            lowStockNotification: true,
            lowStockThreshold: 5,
            emailNotifications: false,
            smsNotifications: false,
            dailyReportEmail: false,
        },
    });
    const passwordForm = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });
    // Mutation for saving business settings
    const saveBusinessSettings = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            // This would call the API to save settings in a real implementation
            // For now, we'll just simulate a successful save
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            toast({
                title: 'Pengaturan bisnis disimpan',
                description: 'Pengaturan bisnis telah berhasil diperbarui',
            });
        },
        onError: (error) => {
            toast({
                title: 'Gagal menyimpan pengaturan',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation for saving notification settings
    const saveNotificationSettings = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            // This would call the API to save notification settings
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            toast({
                title: 'Pengaturan notifikasi disimpan',
                description: 'Pengaturan notifikasi telah berhasil diperbarui',
            });
        },
        onError: (error) => {
            toast({
                title: 'Gagal menyimpan pengaturan',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation for changing password
    const changePassword = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            // This would call the API to change password
            return new Promise(resolve => setTimeout(resolve, 1000));
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
    // Handle form submissions
    const onSubmitBusinessSettings = (data) => {
        saveBusinessSettings.mutate(data);
    };
    const onSubmitNotificationSettings = (data) => {
        saveNotificationSettings.mutate(data);
    };
    const onSubmitPasswordChange = (data) => {
        changePassword.mutate(data);
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Pengaturan Sistem"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi sistem Wash Corner POS" actions={[]}/>
          
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <tabs_1.TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              <tabs_1.TabsTrigger value="business" className="flex items-center">
                <lucide_react_1.Building className="mr-2 h-4 w-4"/>
                <span>Bisnis</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="notifications" className="flex items-center">
                <lucide_react_1.Bell className="mr-2 h-4 w-4"/>
                <span>Notifikasi</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="account" className="flex items-center">
                <lucide_react_1.UserCog className="mr-2 h-4 w-4"/>
                <span>Akun</span>
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>
            
            <div className="mt-6">
              {/* Business Settings */}
              <tabs_1.TabsContent value="business">
                <card_1.Card>
                  <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200">
                    <card_1.CardTitle className="text-xl font-semibold">Pengaturan Bisnis</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-6">
                    <form_1.Form {...businessForm}>
                      <form onSubmit={businessForm.handleSubmit(onSubmitBusinessSettings)} className="space-y-6">
                        <form_1.FormField control={businessForm.control} name="businessName" render={({ field }) => (<form_1.FormItem>
                              <form_1.FormLabel>Nama Bisnis</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="Masukkan nama bisnis" {...field}/>
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                        
                        <form_1.FormField control={businessForm.control} name="address" render={({ field }) => (<form_1.FormItem>
                              <form_1.FormLabel>Alamat</form_1.FormLabel>
                              <form_1.FormControl>
                                <textarea_1.Textarea placeholder="Masukkan alamat bisnis" {...field}/>
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <form_1.FormField control={businessForm.control} name="phone" render={({ field }) => (<form_1.FormItem>
                                <form_1.FormLabel>Nomor Telepon</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="Masukkan nomor telepon" {...field}/>
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>)}/>
                          
                          <form_1.FormField control={businessForm.control} name="email" render={({ field }) => (<form_1.FormItem>
                                <form_1.FormLabel>Email Bisnis</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input type="email" placeholder="Masukkan email bisnis" {...field}/>
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>)}/>
                        </div>
                        
                        <form_1.FormField control={businessForm.control} name="taxNumber" render={({ field }) => (<form_1.FormItem>
                              <form_1.FormLabel>NPWP</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input placeholder="Masukkan NPWP (opsional)" {...field}/>
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                        
                        <separator_1.Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Pengaturan Nota</h3>
                          
                          <form_1.FormField control={businessForm.control} name="receiptFooter" render={({ field }) => (<form_1.FormItem>
                                <form_1.FormLabel>Teks Footer Nota</form_1.FormLabel>
                                <form_1.FormControl>
                                  <textarea_1.Textarea placeholder="Teks yang akan muncul di bagian bawah nota" className="min-h-[100px]" {...field}/>
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>)}/>
                        </div>
                        
                        <div className="flex justify-end">
                          <button_1.Button type="submit" disabled={saveBusinessSettings.isPending} className="flex items-center">
                            {saveBusinessSettings.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Save className="mr-2 h-4 w-4"/>)}
                            Simpan Pengaturan
                          </button_1.Button>
                        </div>
                      </form>
                    </form_1.Form>
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>
              
              {/* Notification Settings */}
              <tabs_1.TabsContent value="notifications">
                <card_1.Card>
                  <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200">
                    <card_1.CardTitle className="text-xl font-semibold">Pengaturan Notifikasi</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-6">
                    <form_1.Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onSubmitNotificationSettings)} className="space-y-6">
                        <h3 className="text-lg font-medium mb-2">Peringatan Stok</h3>
                        
                        <form_1.FormField control={notificationForm.control} name="lowStockNotification" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">Peringatan Stok Rendah</form_1.FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Tampilkan peringatan ketika stok mencapai batas minimal
                                </div>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                              </form_1.FormControl>
                            </form_1.FormItem>)}/>
                        
                        <form_1.FormField control={notificationForm.control} name="lowStockThreshold" render={({ field }) => (<form_1.FormItem>
                              <form_1.FormLabel>Batas Minimal Stok</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}/>
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                        
                        <separator_1.Separator />
                        
                        <h3 className="text-lg font-medium mb-2">Metode Notifikasi</h3>
                        
                        <form_1.FormField control={notificationForm.control} name="emailNotifications" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">Email Notifikasi</form_1.FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Kirim notifikasi via email
                                </div>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                              </form_1.FormControl>
                            </form_1.FormItem>)}/>
                        
                        <form_1.FormField control={notificationForm.control} name="smsNotifications" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">SMS Notifikasi</form_1.FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Kirim notifikasi via SMS
                                </div>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                              </form_1.FormControl>
                            </form_1.FormItem>)}/>
                        
                        <form_1.FormField control={notificationForm.control} name="dailyReportEmail" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">Laporan Harian</form_1.FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Kirim laporan harian via email
                                </div>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                              </form_1.FormControl>
                            </form_1.FormItem>)}/>
                        
                        <div className="flex justify-end">
                          <button_1.Button type="submit" disabled={saveNotificationSettings.isPending} className="flex items-center">
                            {saveNotificationSettings.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Save className="mr-2 h-4 w-4"/>)}
                            Simpan Pengaturan
                          </button_1.Button>
                        </div>
                      </form>
                    </form_1.Form>
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>
              
              {/* Account Settings */}
              <tabs_1.TabsContent value="account">
                <card_1.Card>
                  <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200">
                    <card_1.CardTitle className="text-xl font-semibold">Pengaturan Akun</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-6">
                    <form_1.Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-6">
                        <h3 className="text-lg font-medium mb-2">Ubah Password</h3>
                        
                        <form_1.FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<form_1.FormItem>
                              <form_1.FormLabel>Password Saat Ini</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input type="password" placeholder="Masukkan password saat ini" {...field}/>
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                        
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
                        
                        <div className="flex justify-end">
                          <button_1.Button type="submit" disabled={changePassword.isPending} className="flex items-center">
                            {changePassword.isPending ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.KeyRound className="mr-2 h-4 w-4"/>)}
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
    </div>);
}
