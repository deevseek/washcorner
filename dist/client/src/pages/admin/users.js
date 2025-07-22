"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Users;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const queryClient_1 = require("@/lib/queryClient");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const dialog_1 = require("@/components/ui/dialog");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const table_1 = require("@/components/ui/table");
const use_toast_1 = require("@/hooks/use-toast");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const lucide_react_1 = require("lucide-react");
// Schema untuk form pengguna baru
const userFormSchema = zod_2.z.object({
    username: zod_2.z.string().min(3, 'Username minimal 3 karakter'),
    name: zod_2.z.string().min(2, 'Nama minimal 2 karakter'),
    password: zod_2.z.string().min(6, 'Password minimal 6 karakter'),
    role: zod_2.z.string().min(1, 'Role harus dipilih'),
    email: zod_2.z.string().email('Format email tidak valid').optional().or(zod_2.z.literal('')),
    phone: zod_2.z.string().optional(),
});
function Users() {
    const [isAddDialogOpen, setIsAddDialogOpen] = (0, react_1.useState)(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = (0, react_1.useState)(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, react_1.useState)(false);
    const [selectedUser, setSelectedUser] = (0, react_1.useState)(null);
    // Form untuk tambah/edit user
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(userFormSchema),
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
    const { data: users, isLoading } = (0, react_query_1.useQuery)({
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
    const { data: roles, isLoading: isLoadingRoles } = (0, react_query_1.useQuery)({
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
    const addUserMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/register', data);
            return res.json();
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            setIsAddDialogOpen(false);
            form.reset();
            (0, use_toast_1.toast)({
                title: 'Pengguna baru berhasil ditambahkan',
                description: 'Pengguna dapat langsung mengakses sistem sesuai role',
            });
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal menambahkan pengguna',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk update user
    const updateUserMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('PUT', `/api/users/${selectedUser.id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            setIsEditDialogOpen(false);
            form.reset();
            (0, use_toast_1.toast)({
                title: 'Pengguna berhasil diperbarui',
                description: 'Data pengguna telah diperbarui',
            });
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal memperbarui pengguna',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk delete user
    const deleteUserMutation = (0, react_query_1.useMutation)({
        mutationFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('DELETE', `/api/users/${selectedUser.id}`);
            return res;
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            setIsDeleteDialogOpen(false);
            (0, use_toast_1.toast)({
                title: 'Pengguna berhasil dihapus',
                description: 'Pengguna telah dihapus dari sistem',
            });
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal menghapus pengguna',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    const handleAddUser = (data) => {
        addUserMutation.mutate(data);
    };
    const handleUpdateUser = (data) => {
        updateUserMutation.mutate(data);
    };
    const handleDeleteUser = () => {
        deleteUserMutation.mutate();
    };
    const openEditDialog = (user) => {
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
    const openDeleteDialog = (user) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Manajemen Pengguna"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Manajemen Pengguna" subtitle="Kelola akses pengguna ke sistem" actions={[
            <button_1.Button key="add-user" onClick={() => {
                    form.reset();
                    setIsAddDialogOpen(true);
                }} className="flex items-center">
                <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                Tambah Pengguna
              </button_1.Button>
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200">
              <card_1.CardTitle className="text-xl font-semibold">Daftar Pengguna</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="p-6">
              {isLoading ? (<div className="flex items-center justify-center p-8">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Username</table_1.TableHead>
                      <table_1.TableHead>Nama</table_1.TableHead>
                      <table_1.TableHead>Role</table_1.TableHead>
                      <table_1.TableHead>Email</table_1.TableHead>
                      <table_1.TableHead>Telepon</table_1.TableHead>
                      <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {users && users.length > 0 ? (users.map((user) => (<table_1.TableRow key={user.id}>
                          <table_1.TableCell className="font-medium">{user.username}</table_1.TableCell>
                          <table_1.TableCell>{user.name}</table_1.TableCell>
                          <table_1.TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : user.role === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'}`}>
                              {user.role}
                            </span>
                          </table_1.TableCell>
                          <table_1.TableCell>{user.email || '-'}</table_1.TableCell>
                          <table_1.TableCell>{user.phone || '-'}</table_1.TableCell>
                          <table_1.TableCell className="text-right space-x-2">
                            <button_1.Button variant="outline" size="icon" onClick={() => openEditDialog(user)}>
                              <lucide_react_1.Edit className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="outline" size="icon" className="text-red-600" onClick={() => openDeleteDialog(user)}>
                              <lucide_react_1.Trash2 className="h-4 w-4"/>
                            </button_1.Button>
                          </table_1.TableCell>
                        </table_1.TableRow>))) : (<table_1.TableRow>
                        <table_1.TableCell colSpan={6} className="text-center py-4">
                          Tidak ada data pengguna
                        </table_1.TableCell>
                      </table_1.TableRow>)}
                  </table_1.TableBody>
                </table_1.Table>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      {/* Dialog tambah pengguna */}
      <dialog_1.Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Tambah Pengguna Baru</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="username">Username</label_1.Label>
                <input_1.Input id="username" {...form.register('username')}/>
                {form.formState.errors.username && (<p className="text-sm text-red-500">{form.formState.errors.username.message}</p>)}
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="role">Role</label_1.Label>
                <select_1.Select onValueChange={(value) => form.setValue('role', value)}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Pilih role"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {isLoadingRoles ? (<div className="flex items-center justify-center p-2">
                        <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                      </div>) : (roles && roles.map((role) => (<select_1.SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </select_1.SelectItem>)))}
                  </select_1.SelectContent>
                </select_1.Select>
                {form.formState.errors.role && (<p className="text-sm text-red-500">{form.formState.errors.role.message}</p>)}
              </div>
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="name">Nama Lengkap</label_1.Label>
              <input_1.Input id="name" {...form.register('name')}/>
              {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="password">Password</label_1.Label>
              <input_1.Input id="password" type="password" {...form.register('password')}/>
              {form.formState.errors.password && (<p className="text-sm text-red-500">{form.formState.errors.password.message}</p>)}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="email">Email (Opsional)</label_1.Label>
                <input_1.Input id="email" type="email" {...form.register('email')}/>
                {form.formState.errors.email && (<p className="text-sm text-red-500">{form.formState.errors.email.message}</p>)}
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="phone">Telepon (Opsional)</label_1.Label>
                <input_1.Input id="phone" {...form.register('phone')}/>
              </div>
            </div>
            
            <dialog_1.DialogFooter className="mt-6">
              <button_1.Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </button_1.Button>
              <button_1.Button type="submit" disabled={addUserMutation.isPending}>
                {addUserMutation.isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Simpan
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Dialog edit pengguna */}
      <dialog_1.Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Edit Pengguna</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="username">Username</label_1.Label>
                <input_1.Input id="username" {...form.register('username')} disabled/>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="role">Role</label_1.Label>
                <select_1.Select defaultValue={form.getValues('role')} onValueChange={(value) => form.setValue('role', value)}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Pilih role"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {isLoadingRoles ? (<div className="flex items-center justify-center p-2">
                        <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                      </div>) : (roles && roles.map((role) => (<select_1.SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </select_1.SelectItem>)))}
                  </select_1.SelectContent>
                </select_1.Select>
                {form.formState.errors.role && (<p className="text-sm text-red-500">{form.formState.errors.role.message}</p>)}
              </div>
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="name">Nama Lengkap</label_1.Label>
              <input_1.Input id="name" {...form.register('name')}/>
              {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="password">Password Baru (kosongkan jika tidak diubah)</label_1.Label>
              <input_1.Input id="password" type="password" {...form.register('password')}/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="email">Email (Opsional)</label_1.Label>
                <input_1.Input id="email" type="email" {...form.register('email')}/>
                {form.formState.errors.email && (<p className="text-sm text-red-500">{form.formState.errors.email.message}</p>)}
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="phone">Telepon (Opsional)</label_1.Label>
                <input_1.Input id="phone" {...form.register('phone')}/>
              </div>
            </div>
            
            <dialog_1.DialogFooter className="mt-6">
              <button_1.Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </button_1.Button>
              <button_1.Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Perbarui
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Dialog konfirmasi hapus */}
      <dialog_1.Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Hapus Pengguna</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <div className="py-4">
            <p>Apakah Anda yakin ingin menghapus pengguna <strong>{selectedUser?.name}</strong>?</p>
            <p className="text-red-500 text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          
          <dialog_1.DialogFooter>
            <button_1.Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </button_1.Button>
            <button_1.Button type="button" variant="destructive" onClick={handleDeleteUser} disabled={deleteUserMutation.isPending}>
              {deleteUserMutation.isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Hapus
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
