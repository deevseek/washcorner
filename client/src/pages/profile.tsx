import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Mail, Phone, Calendar, Shield, Save, Key } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema untuk form profil
const profileFormSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

// Schema untuk form ubah password
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Password minimal 6 karakter'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password baru dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

// Fungsi untuk mendapatkan inisial dari nama
function getInitials(name: string = ''): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [lastLoginTime, setLastLoginTime] = useState<string>('-');

  // Form untuk profil
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      name: user?.name || '',
      email: '',
      phone: '',
    },
    mode: 'onChange'
  });

  // Form untuk ubah password
  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange'
  });

  // Efek untuk mengisi form setiap kali data user berubah
  useEffect(() => {
    if (user) {
      // Set tanggal login terakhir (contoh)
      setLastLoginTime(format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id }));
      
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
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/profile');
        return res.json();
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Default data jika tidak berhasil
        return null;
      }
    },
    enabled: !!user, // Hanya dijalankan jika user sudah login
  });

  // Mutation untuk update profil
  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      const res = await apiRequest('PUT', '/api/profile', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Data profil Anda telah berhasil disimpan',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal memperbarui profil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation untuk ubah password
  const changePassword = useMutation({
    mutationFn: async (data: z.infer<typeof passwordChangeSchema>) => {
      const res = await apiRequest('POST', '/api/change-password', {
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
    onError: (error: Error) => {
      toast({
        title: 'Gagal mengubah password',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handler untuk submit form profil
  const onSubmitProfile = (data: z.infer<typeof profileFormSchema>) => {
    updateProfile.mutate(data);
  };

  // Handler untuk submit form password
  const onSubmitPasswordChange = (data: z.infer<typeof passwordChangeSchema>) => {
    changePassword.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Profil Pengguna" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Profil Pengguna" 
            subtitle="Lihat dan kelola informasi profil Anda" 
            actions={[]} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Profil Card - Kolom Kiri */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="mb-4 mt-4 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.username}</p>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mt-2">
                    {user?.role === 'admin' ? 'Administrator' : 
                     user?.role === 'manager' ? 'Manager' : 
                     user?.role === 'kasir' ? 'Kasir' : 'Pengguna'}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="w-full space-y-4">
                  <div className="flex items-center">
                    <User className="text-gray-400 w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{user?.username}</p>
                    </div>
                  </div>
                  
                  {profileData?.email && (
                    <div className="flex items-center">
                      <Mail className="text-gray-400 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profileData.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {profileData?.phone && (
                    <div className="flex items-center">
                      <Phone className="text-gray-400 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telepon</p>
                        <p className="font-medium">{profileData.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="text-gray-400 w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Login Terakhir</p>
                      <p className="font-medium">{lastLoginTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Shield className="text-gray-400 w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tab Content - Kolom Kanan */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profil</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    <span>Keamanan</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  {/* Tab Profil */}
                  <TabsContent value="profile">
                    <Card>
                      <CardHeader className="px-6 py-4">
                        <CardTitle>Edit Informasi Profil</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                            <Alert className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
                              <AlertTitle className="text-blue-700 font-medium">Informasi Profil</AlertTitle>
                              <AlertDescription>
                                Perbarui informasi profil Anda di bawah ini. Email dan nomor telepon akan digunakan untuk komunikasi.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Username" 
                                        {...field} 
                                        disabled={true}
                                        className="bg-gray-50"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Username tidak dapat diubah
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Nama lengkap" 
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="email"
                                        placeholder="email@example.com" 
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nomor Telepon</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="08xxxxxxxxxx" 
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
                                className="flex items-center"
                                disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                              >
                                {updateProfile.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="mr-2 h-4 w-4" />
                                )}
                                Simpan Perubahan
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Tab Keamanan */}
                  <TabsContent value="security">
                    <Card>
                      <CardHeader className="px-6 py-4">
                        <CardTitle>Keamanan Akun</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-6">
                            <Alert className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
                              <AlertTitle className="text-blue-700 font-medium">Ubah Password</AlertTitle>
                              <AlertDescription>
                                Pastikan password baru Anda cukup kuat dan berbeda dari password sebelumnya.
                              </AlertDescription>
                            </Alert>
                            
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password Saat Ini</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password"
                                      placeholder="Masukkan password saat ini" 
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Password Baru</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="password"
                                        placeholder="Masukkan password baru" 
                                        {...field}
                                      />
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
                                      <Input 
                                        type="password"
                                        placeholder="Konfirmasi password baru" 
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
                                className="flex items-center"
                                disabled={changePassword.isPending || !passwordForm.formState.isDirty}
                              >
                                {changePassword.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Key className="mr-2 h-4 w-4" />
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
      </div>
    </div>
  );
}