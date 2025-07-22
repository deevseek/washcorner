import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PageHeader } from "@/components/layout/page-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, ShieldCheck, Edit, Trash2, Check } from "lucide-react";

// Schema untuk form role baru
const roleFormSchema = z.object({
  name: z.string().min(3, "Nama role minimal 3 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export default function Roles() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Form untuk tambah/edit role
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch daftar role
  const { data: roles, isLoading } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Gagal mengambil data role");
      }
      return res.json();
    },
  });

  // Fetch daftar permission
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["/api/permissions"],
    queryFn: async () => {
      const res = await fetch("/api/permissions", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Gagal mengambil data permission");
      }
      return res.json();
    },
  });

  // Fetch permission untuk role tertentu saat dialog permission dibuka
  const {
    data: rolePermissions,
    isLoading: isLoadingRolePermissions,
    refetch: refetchRolePermissions,
  } = useQuery({
    queryKey: [`/api/role-permissions/${selectedRole?.id}`],
    queryFn: async () => {
      if (!selectedRole) return [];

      const res = await fetch(`/api/role-permissions/${selectedRole.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Gagal mengambil data permission role");
      }
      return res.json();
    },
    enabled: !!selectedRole,
  });

  // Mutation untuk tambah role
  const addRoleMutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      const res = await apiRequest("POST", "/api/roles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Role baru berhasil ditambahkan",
        description: "Role telah ditambahkan ke sistem",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menambahkan role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk update role
  const updateRoleMutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      const res = await apiRequest(
        "PUT",
        `/api/roles/${selectedRole.id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsEditDialogOpen(false);
      form.reset();
      toast({
        title: "Role berhasil diperbarui",
        description: "Data role telah diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk delete role
  const deleteRoleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/roles/${selectedRole.id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Role berhasil dihapus",
        description: "Role telah dihapus dari sistem",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk assign permission ke role
  const assignPermissionMutation = useMutation({
    mutationFn: async (data: { roleId: number; permissionId: number }) => {
      const res = await apiRequest("POST", "/api/role-permissions", data);
      return res.json();
    },
    onSuccess: () => {
      refetchRolePermissions();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menetapkan permission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk remove permission dari role
  const removePermissionMutation = useMutation({
    mutationFn: async (rolePermissionId: number) => {
      const res = await apiRequest(
        "DELETE",
        `/api/role-permissions/${rolePermissionId}`
      );
      return res;
    },
    onSuccess: () => {
      refetchRolePermissions();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus permission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddRole = (data: RoleFormValues) => {
    addRoleMutation.mutate(data);
  };

  const handleUpdateRole = (data: RoleFormValues) => {
    updateRoleMutation.mutate(data);
  };

  const handleDeleteRole = () => {
    deleteRoleMutation.mutate();
  };

  const openEditDialog = (role: any) => {
    setSelectedRole(role);
    form.reset({
      name: role.name,
      description: role.description,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (role: any) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const openPermissionDialog = (role: any) => {
    setSelectedRole(role);
    setIsPermissionDialogOpen(true);
  };

  // Helper untuk memeriksa apakah permission sudah ditetapkan ke role
  const isPermissionAssigned = (permissionId: number) => {
    if (!rolePermissions) return false;
    return rolePermissions.some((p: any) => p.id === permissionId);
  };

  // Handler untuk toggle permission
  const togglePermission = (permissionId: number) => {
    const rolePermission = rolePermissions?.find(
      (p: any) => p.id === permissionId
    );

    if (rolePermission) {
      // Remove permission dari role
      const rolePermissionMapping = rolePermission.rolePermissions?.[0];
      if (rolePermissionMapping?.id) {
        removePermissionMutation.mutate(rolePermissionMapping.id);
      }
    } else {
      // Assign permission ke role
      assignPermissionMutation.mutate({
        roleId: selectedRole.id,
        permissionId: permissionId,
      });
    }
  };

  // Group permission by module untuk UI yang lebih baik
  const groupedPermissions = permissions?.reduce(
    (acc: any, permission: any) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <TopNav title="Manajemen Peran" />

        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Manajemen Peran"
            subtitle="Kelola peran dan hak akses di sistem"
            actions={[
              <Button
                key="add-role"
                onClick={() => {
                  form.reset();
                  setIsAddDialogOpen(true);
                }}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Peran
              </Button>,
            ]}
          />

          <Card className="mt-6">
            <CardHeader className="px-6 py-4 border-b border-neutral-200">
              <CardTitle className="text-xl font-semibold">
                Daftar Peran
              </CardTitle>
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
                      <TableHead>Nama Peran</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles && roles.length > 0 ? (
                      roles.map((role: any) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                              {role.name}
                            </div>
                          </TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPermissionDialog(role)}
                            >
                              Permisi
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600"
                              onClick={() => openDeleteDialog(role)}
                              disabled={["admin", "manager", "kasir"].includes(
                                role.name
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Tidak ada data peran
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

      {/* Dialog tambah peran */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Peran Baru</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleAddRole)}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nama Peran</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Jelaskan kegunaan peran ini"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={addRoleMutation.isPending}>
                {addRoleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog edit peran */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Peran</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleUpdateRole)}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nama Peran</Label>
              <Input
                id="name"
                {...form.register("name")}
                disabled={["admin", "manager", "kasir"].includes(
                  selectedRole?.name
                )}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Jelaskan kegunaan peran ini"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
            <DialogTitle>Hapus Peran</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>
              Apakah Anda yakin ingin menghapus peran{" "}
              <strong>{selectedRole?.name}</strong>?
            </p>
            <p className="text-red-500 text-sm mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
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
              onClick={handleDeleteRole}
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog permission */}
      <Dialog
        open={isPermissionDialogOpen}
        onOpenChange={setIsPermissionDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Kelola Hak Akses untuk Peran: {selectedRole?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {isLoadingRolePermissions || isLoadingPermissions ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {groupedPermissions &&
                  Object.entries(groupedPermissions).map(
                    ([module, modulePermissions]: [string, any]) => (
                      <div key={module} className="space-y-2">
                        <h3 className="text-lg font-semibold capitalize">
                          {module}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {modulePermissions.map((permission: any) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                            >
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={isPermissionAssigned(permission.id)}
                                onCheckedChange={() =>
                                  togglePermission(permission.id)
                                }
                              />
                              <Label
                                htmlFor={`permission-${permission.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-medium">
                                  {permission.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {permission.description}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsPermissionDialogOpen(false)}
            >
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
