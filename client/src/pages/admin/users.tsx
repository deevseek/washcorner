import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, User, Edit, Trash2 } from 'lucide-react';

// Schema untuk form pengguna baru
const userFormSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.string().min(1, 'Role harus dipilih'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function Users() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form untuk tambah/edit user
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      name: '',
      password: '',
      role: '',
      email: '',
      phone: '',
    },
  });

  // Fetch daftar pengguna
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Gagal mengambil data pengguna');
      }
      return res.json();
    },
  });

  // Fetch daftar role
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Gagal mengambil data role');
      }
      return res.json();
    },
  });

  // Mutation untuk tambah user
  const addUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const res = await apiRequest('POST', '/api/register', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: 'Pengguna baru berhasil ditambahkan',
        description: 'Pengguna dapat langsung mengakses sistem sesuai role',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal menambahkan pengguna',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation untuk update user
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PUT', `/api/users/${selectedUser.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
      form.reset();
      toast({
        title: 'Pengguna berhasil diperbarui',
        description: 'Data pengguna telah diperbarui',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui pengguna',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation untuk delete user
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/users/${selectedUser.id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Pengguna berhasil dihapus',
        description: 'Pengguna telah dihapus dari sistem',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal menghapus pengguna',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddUser = (data: UserFormValues) => {
    addUserMutation.mutate(data);
  };

  const handleUpdateUser = (data: UserFormValues) => {
    updateUserMutation.mutate(data);
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate();
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email || '',
      phone: user.phone || '',
      password: '', // Password field kosong saat edit
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Manajemen Pengguna" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Manajemen Pengguna" 
            subtitle="Kelola akses pengguna ke sistem" 
            actions={[
              <Button 
                key="add-user"
                onClick={() => {
                  form.reset();
                  setIsAddDialogOpen(true);
                }}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Button>
            ]} 
          />
          
          <Card className="mt-6">
            <CardHeader className="px-6 py-4 border-b border-neutral-200">
              <CardTitle className="text-xl font-semibold">Daftar Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : user.role === 'manager' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Tidak ada data pengguna
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog tambah pengguna */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register('username')} />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => form.setValue('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoles ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      roles && roles.map((role: any) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon (Opsional)</Label>
                <Input id="phone" {...form.register('phone')} />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={addUserMutation.isPending}
              >
                {addUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog edit pengguna */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register('username')} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  defaultValue={form.getValues('role')}
                  onValueChange={(value) => form.setValue('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoles ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      roles && roles.map((role: any) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru (kosongkan jika tidak diubah)</Label>
              <Input id="password" type="password" {...form.register('password')} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon (Opsional)</Label>
                <Input id="phone" {...form.register('phone')} />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Perbarui
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Apakah Anda yakin ingin menghapus pengguna <strong>{selectedUser?.name}</strong>?</p>
            <p className="text-red-500 text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}