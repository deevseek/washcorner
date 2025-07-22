"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Roles;
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
const textarea_1 = require("@/components/ui/textarea");
const table_1 = require("@/components/ui/table");
const checkbox_1 = require("@/components/ui/checkbox");
const use_toast_1 = require("@/hooks/use-toast");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const lucide_react_1 = require("lucide-react");
// Schema untuk form role baru
const roleFormSchema = zod_2.z.object({
    name: zod_2.z.string().min(3, 'Nama role minimal 3 karakter'),
    description: zod_2.z.string().min(5, 'Deskripsi minimal 5 karakter'),
});
function Roles() {
    const [isAddDialogOpen, setIsAddDialogOpen] = (0, react_1.useState)(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = (0, react_1.useState)(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, react_1.useState)(false);
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = (0, react_1.useState)(false);
    const [selectedRole, setSelectedRole] = (0, react_1.useState)(null);
    const [selectedPermissions, setSelectedPermissions] = (0, react_1.useState)([]);
    // Form untuk tambah/edit role
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(roleFormSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });
    // Fetch daftar role
    const { data: roles, isLoading } = (0, react_query_1.useQuery)({
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
    // Fetch daftar permission
    const { data: permissions, isLoading: isLoadingPermissions } = (0, react_query_1.useQuery)({
        queryKey: ['/api/permissions'],
        queryFn: async () => {
            const res = await fetch('/api/permissions', {
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Gagal mengambil data permission');
            }
            return res.json();
        },
    });
    // Fetch permission untuk role tertentu saat dialog permission dibuka
    const { data: rolePermissions, isLoading: isLoadingRolePermissions, refetch: refetchRolePermissions } = (0, react_query_1.useQuery)({
        queryKey: [`/api/role-permissions/${selectedRole?.id}`],
        queryFn: async () => {
            if (!selectedRole)
                return [];
            const res = await fetch(`/api/role-permissions/${selectedRole.id}`, {
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Gagal mengambil data permission role');
            }
            return res.json();
        },
        enabled: !!selectedRole,
    });
    // Mutation untuk tambah role
    const addRoleMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/roles', data);
            return res.json();
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
            setIsAddDialogOpen(false);
            form.reset();
            (0, use_toast_1.toast)({
                title: 'Role baru berhasil ditambahkan',
                description: 'Role telah ditambahkan ke sistem',
            });
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal menambahkan role',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk update role
    const updateRoleMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('PUT', `/api/roles/${selectedRole.id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
            setIsEditDialogOpen(false);
            form.reset();
            (0, use_toast_1.toast)({
                title: 'Role berhasil diperbarui',
                description: 'Data role telah diperbarui',
            });
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal memperbarui role',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk delete role
    const deleteRoleMutation = (0, react_query_1.useMutation)({
        mutationFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('DELETE', `/api/roles/${selectedRole.id}`);
            return res;
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
            setIsDeleteDialogOpen(false);
            (0, use_toast_1.toast)({
                title: 'Role berhasil dihapus',
                description: 'Role telah dihapus dari sistem',
            });
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal menghapus role',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk assign permission ke role
    const assignPermissionMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/role-permissions', data);
            return res.json();
        },
        onSuccess: () => {
            refetchRolePermissions();
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal menetapkan permission',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk remove permission dari role
    const removePermissionMutation = (0, react_query_1.useMutation)({
        mutationFn: async (rolePermissionId) => {
            const res = await (0, queryClient_1.apiRequest)('DELETE', `/api/role-permissions/${rolePermissionId}`);
            return res;
        },
        onSuccess: () => {
            refetchRolePermissions();
        },
        onError: (error) => {
            (0, use_toast_1.toast)({
                title: 'Gagal menghapus permission',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    const handleAddRole = (data) => {
        addRoleMutation.mutate(data);
    };
    const handleUpdateRole = (data) => {
        updateRoleMutation.mutate(data);
    };
    const handleDeleteRole = () => {
        deleteRoleMutation.mutate();
    };
    const openEditDialog = (role) => {
        setSelectedRole(role);
        form.reset({
            name: role.name,
            description: role.description,
        });
        setIsEditDialogOpen(true);
    };
    const openDeleteDialog = (role) => {
        setSelectedRole(role);
        setIsDeleteDialogOpen(true);
    };
    const openPermissionDialog = (role) => {
        setSelectedRole(role);
        setIsPermissionDialogOpen(true);
    };
    // Helper untuk memeriksa apakah permission sudah ditetapkan ke role
    const isPermissionAssigned = (permissionId) => {
        if (!rolePermissions)
            return false;
        return rolePermissions.some((p) => p.id === permissionId);
    };
    // Handler untuk toggle permission
    const togglePermission = (permissionId) => {
        const rolePermission = rolePermissions?.find((p) => p.id === permissionId);
        if (rolePermission) {
            // Remove permission dari role
            const rolePermissionMapping = rolePermission.rolePermissions?.[0];
            if (rolePermissionMapping?.id) {
                removePermissionMutation.mutate(rolePermissionMapping.id);
            }
        }
        else {
            // Assign permission ke role
            assignPermissionMutation.mutate({
                roleId: selectedRole.id,
                permissionId: permissionId,
            });
        }
    };
    // Group permission by module untuk UI yang lebih baik
    const groupedPermissions = permissions?.reduce((acc, permission) => {
        const module = permission.module;
        if (!acc[module]) {
            acc[module] = [];
        }
        acc[module].push(permission);
        return acc;
    }, {});
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Manajemen Peran"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Manajemen Peran" subtitle="Kelola peran dan hak akses di sistem" actions={[
            <button_1.Button key="add-role" onClick={() => {
                    form.reset();
                    setIsAddDialogOpen(true);
                }} className="flex items-center">
                <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                Tambah Peran
              </button_1.Button>
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200">
              <card_1.CardTitle className="text-xl font-semibold">Daftar Peran</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="p-6">
              {isLoading ? (<div className="flex items-center justify-center p-8">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Nama Peran</table_1.TableHead>
                      <table_1.TableHead>Deskripsi</table_1.TableHead>
                      <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {roles && roles.length > 0 ? (roles.map((role) => (<table_1.TableRow key={role.id}>
                          <table_1.TableCell className="font-medium">
                            <div className="flex items-center">
                              <lucide_react_1.ShieldCheck className="h-4 w-4 mr-2 text-blue-500"/>
                              {role.name}
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>{role.description}</table_1.TableCell>
                          <table_1.TableCell className="text-right space-x-2">
                            <button_1.Button variant="outline" size="sm" onClick={() => openPermissionDialog(role)}>
                              Permisi
                            </button_1.Button>
                            <button_1.Button variant="outline" size="icon" onClick={() => openEditDialog(role)}>
                              <lucide_react_1.Edit className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="outline" size="icon" className="text-red-600" onClick={() => openDeleteDialog(role)} disabled={['admin', 'manager', 'kasir'].includes(role.name)}>
                              <lucide_react_1.Trash2 className="h-4 w-4"/>
                            </button_1.Button>
                          </table_1.TableCell>
                        </table_1.TableRow>))) : (<table_1.TableRow>
                        <table_1.TableCell colSpan={3} className="text-center py-4">
                          Tidak ada data peran
                        </table_1.TableCell>
                      </table_1.TableRow>)}
                  </table_1.TableBody>
                </table_1.Table>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      {/* Dialog tambah peran */}
      <dialog_1.Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Tambah Peran Baru</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleAddRole)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="name">Nama Peran</label_1.Label>
              <input_1.Input id="name" {...form.register('name')}/>
              {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="description">Deskripsi</label_1.Label>
              <textarea_1.Textarea id="description" {...form.register('description')} placeholder="Jelaskan kegunaan peran ini"/>
              {form.formState.errors.description && (<p className="text-sm text-red-500">{form.formState.errors.description.message}</p>)}
            </div>
            
            <dialog_1.DialogFooter className="mt-6">
              <button_1.Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </button_1.Button>
              <button_1.Button type="submit" disabled={addRoleMutation.isPending}>
                {addRoleMutation.isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Simpan
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Dialog edit peran */}
      <dialog_1.Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Edit Peran</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleUpdateRole)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="name">Nama Peran</label_1.Label>
              <input_1.Input id="name" {...form.register('name')} disabled={['admin', 'manager', 'kasir'].includes(selectedRole?.name)}/>
              {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="description">Deskripsi</label_1.Label>
              <textarea_1.Textarea id="description" {...form.register('description')} placeholder="Jelaskan kegunaan peran ini"/>
              {form.formState.errors.description && (<p className="text-sm text-red-500">{form.formState.errors.description.message}</p>)}
            </div>
            
            <dialog_1.DialogFooter className="mt-6">
              <button_1.Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </button_1.Button>
              <button_1.Button type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
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
            <dialog_1.DialogTitle>Hapus Peran</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <div className="py-4">
            <p>Apakah Anda yakin ingin menghapus peran <strong>{selectedRole?.name}</strong>?</p>
            <p className="text-red-500 text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          
          <dialog_1.DialogFooter>
            <button_1.Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </button_1.Button>
            <button_1.Button type="button" variant="destructive" onClick={handleDeleteRole} disabled={deleteRoleMutation.isPending}>
              {deleteRoleMutation.isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Hapus
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Dialog permission */}
      <dialog_1.Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Kelola Hak Akses untuk Peran: {selectedRole?.name}</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {isLoadingRolePermissions || isLoadingPermissions ? (<div className="flex items-center justify-center p-8">
                <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
              </div>) : (<div className="space-y-6">
                {groupedPermissions && Object.entries(groupedPermissions).map(([module, modulePermissions]) => (<div key={module} className="space-y-2">
                    <h3 className="text-lg font-semibold capitalize">{module}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {modulePermissions.map((permission) => (<div key={permission.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                          <checkbox_1.Checkbox id={`permission-${permission.id}`} checked={isPermissionAssigned(permission.id)} onCheckedChange={() => togglePermission(permission.id)}/>
                          <label_1.Label htmlFor={`permission-${permission.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">{permission.description}</div>
                          </label_1.Label>
                        </div>))}
                    </div>
                  </div>))}
              </div>)}
          </div>
          
          <dialog_1.DialogFooter>
            <button_1.Button type="button" onClick={() => setIsPermissionDialogOpen(false)}>
              Selesai
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
