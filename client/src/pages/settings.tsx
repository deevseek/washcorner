import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building, 
  Printer, 
  Bell, 
  UserCog, 
  KeyRound, 
  Loader2 
} from 'lucide-react';

// Form schema for business settings
const businessSettingsSchema = z.object({
  businessName: z.string().min(1, 'Nama bisnis harus diisi'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  logo: z.string().optional(),
  receiptFooter: z.string().optional(),
});

// Form schema for notification settings
const notificationSettingsSchema = z.object({
  lowStockNotification: z.boolean().default(true),
  lowStockThreshold: z.number().min(1, 'Nilai minimum 1').or(z.string().transform(val => parseInt(val) || 0)),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  dailyReportEmail: z.boolean().default(false),
});

// Form schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi tidak cocok',
  path: ['confirmPassword'],
});

export default function Settings() {
  const [activeTab, setActiveTab] = useState('business');
  const { toast } = useToast();

  // Initialize forms for each settings section
  const businessForm = useForm<z.infer<typeof businessSettingsSchema>>({
    resolver: zodResolver(businessSettingsSchema),
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

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      lowStockNotification: true,
      lowStockThreshold: 5,
      emailNotifications: false,
      smsNotifications: false,
      dailyReportEmail: false,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Mutation for saving business settings
  const saveBusinessSettings = useMutation({
    mutationFn: async (data: z.infer<typeof businessSettingsSchema>) => {
      // This would call the API to save settings in a real implementation
      // For now, we'll just simulate a successful save
      return new Promise<void>(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: 'Pengaturan bisnis disimpan',
        description: 'Pengaturan bisnis telah berhasil diperbarui',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menyimpan pengaturan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for saving notification settings
  const saveNotificationSettings = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSettingsSchema>) => {
      // This would call the API to save notification settings
      return new Promise<void>(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: 'Pengaturan notifikasi disimpan',
        description: 'Pengaturan notifikasi telah berhasil diperbarui',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menyimpan pengaturan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for changing password
  const changePassword = useMutation({
    mutationFn: async (data: z.infer<typeof passwordChangeSchema>) => {
      // This would call the API to change password
      return new Promise<void>(resolve => setTimeout(resolve, 1000));
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
    onError: (error: Error) => {
      toast({
        title: 'Gagal mengubah password',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onSubmitBusinessSettings = (data: z.infer<typeof businessSettingsSchema>) => {
    saveBusinessSettings.mutate(data);
  };

  const onSubmitNotificationSettings = (data: z.infer<typeof notificationSettingsSchema>) => {
    saveNotificationSettings.mutate(data);
  };

  const onSubmitPasswordChange = (data: z.infer<typeof passwordChangeSchema>) => {
    changePassword.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Pengaturan Sistem" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Pengaturan Sistem" 
            subtitle="Konfigurasi sistem Wash Corner POS" 
            actions={[]} 
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="business" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <span>Bisnis</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifikasi</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Akun</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              {/* Business Settings */}
              <TabsContent value="business">
                <Card>
                  <CardHeader className="px-6 py-4 border-b border-neutral-200">
                    <CardTitle className="text-xl font-semibold">Pengaturan Bisnis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Form {...businessForm}>
                      <form onSubmit={businessForm.handleSubmit(onSubmitBusinessSettings)} className="space-y-6">
                        <FormField
                          control={businessForm.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Bisnis</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nama bisnis" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={businessForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alamat</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Masukkan alamat bisnis" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={businessForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nomor Telepon</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan nomor telepon" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={businessForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Bisnis</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email"
                                    placeholder="Masukkan email bisnis" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={businessForm.control}
                          name="taxNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NPWP</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan NPWP (opsional)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Pengaturan Nota</h3>
                          
                          <FormField
                            control={businessForm.control}
                            name="receiptFooter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teks Footer Nota</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Teks yang akan muncul di bagian bawah nota"
                                    className="min-h-[100px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={saveBusinessSettings.isPending}
                            className="flex items-center"
                          >
                            {saveBusinessSettings.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Simpan Pengaturan
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader className="px-6 py-4 border-b border-neutral-200">
                    <CardTitle className="text-xl font-semibold">Pengaturan Notifikasi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onSubmitNotificationSettings)} className="space-y-6">
                        <h3 className="text-lg font-medium mb-2">Peringatan Stok</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="lowStockNotification"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Peringatan Stok Rendah</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Tampilkan peringatan ketika stok mencapai batas minimal
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="lowStockThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batas Minimal Stok</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator />
                        
                        <h3 className="text-lg font-medium mb-2">Metode Notifikasi</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifikasi</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Kirim notifikasi via email
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="smsNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">SMS Notifikasi</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Kirim notifikasi via SMS
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="dailyReportEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Laporan Harian</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Kirim laporan harian via email
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={saveNotificationSettings.isPending}
                            className="flex items-center"
                          >
                            {saveNotificationSettings.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Simpan Pengaturan
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Account Settings */}
              <TabsContent value="account">
                <Card>
                  <CardHeader className="px-6 py-4 border-b border-neutral-200">
                    <CardTitle className="text-xl font-semibold">Pengaturan Akun</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-6">
                        <h3 className="text-lg font-medium mb-2">Ubah Password</h3>
                        
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password Saat Ini</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Masukkan password saat ini" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password Baru</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Masukkan password baru" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Konfirmasi Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Konfirmasi password baru" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={changePassword.isPending}
                            className="flex items-center"
                          >
                            {changePassword.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <KeyRound className="mr-2 h-4 w-4" />
                            )}
                            Ubah Password
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
