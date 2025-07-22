import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Edit, Trash2, Plus, Briefcase, FileText, Users, Phone, Mail, Search, Filter, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Employee, InsertEmployee } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

// Formulir validasi untuk karyawan baru
const employeeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus memiliki minimal 2 karakter.",
  }),
  position: z.string().min(2, {
    message: "Jabatan harus diisi.",
  }),
  email: z.string().email({
    message: "Email harus valid.",
  }).nullable().optional(),
  phone: z.string().min(6, {
    message: "Nomor telepon harus valid."
  }).nullable().optional(),
  joiningDate: z.date({
    required_error: "Tanggal bergabung harus diisi.",
    invalid_type_error: "Format tanggal tidak valid.",
  }).default(() => new Date()), // Defaultnya tanggal hari ini
  isActive: z.boolean().default(true),
});

export default function HrdEmployeeManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("employees");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Query untuk mendapatkan data karyawan
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Form untuk menambah dan mengedit karyawan
  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      position: "",
      email: null,
      phone: null,
      joiningDate: new Date(),
      isActive: true,
    },
  });

  // Reset form dan isi form jika ada karyawan yang diedit
  const resetForm = () => {
    form.reset({
      name: "",
      position: "",
      email: null,
      phone: null,
      joiningDate: new Date(),
      isActive: true,
    });
  };

  // Mengisi form dengan data karyawan yang akan diedit
  const populateForm = (employee: Employee) => {
    form.reset({
      name: employee.name,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate) : new Date(),
      isActive: employee.isActive === null ? true : employee.isActive,
    });
  };

  // Mutation untuk menambah karyawan baru
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof employeeFormSchema>) => {
      const res = await apiRequest("POST", "/api/employees", data);
      return await res.json();
    },
    onSuccess: () => {
      setShowNewEmployeeModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Berhasil",
        description: "Karyawan berhasil ditambahkan",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan karyawan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk mengedit karyawan
  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: { id: number; employee: z.infer<typeof employeeFormSchema> }) => {
      const res = await apiRequest("PUT", `/api/employees/${data.id}`, data.employee);
      return await res.json();
    },
    onSuccess: () => {
      setShowNewEmployeeModal(false);
      setEmployeeToEdit(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Berhasil",
        description: "Data karyawan berhasil diperbarui",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui data karyawan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk menghapus karyawan
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/employees/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      setEmployeeToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Berhasil",
        description: "Karyawan berhasil dihapus",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus karyawan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler untuk submit form
  const onSubmit = (data: z.infer<typeof employeeFormSchema>) => {
    if (employeeToEdit) {
      updateEmployeeMutation.mutate({ id: employeeToEdit.id, employee: data });
    } else {
      addEmployeeMutation.mutate(data);
    }
  };

  // Membuka modal untuk menambah karyawan baru
  const handleAddEmployee = () => {
    resetForm();
    setEmployeeToEdit(null);
    setShowNewEmployeeModal(true);
  };

  // Membuka modal untuk mengedit karyawan
  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    populateForm(employee);
    setShowNewEmployeeModal(true);
  };

  // Mengkonfirmasi penghapusan karyawan
  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
  };

  // Filter employees based on search and status
  const filteredEmployees = Array.isArray(employees) ? employees.filter((employee: Employee) => {
    const matchesSearch = search === "" || 
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.position.toLowerCase().includes(search.toLowerCase()) ||
      (employee.email && employee.email.toLowerCase().includes(search.toLowerCase())) ||
      (employee.phone && employee.phone.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && employee.isActive) ||
      (filterStatus === "inactive" && !employee.isActive);
    
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="HRD Management" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Manajemen Karyawan" 
            subtitle="Kelola data dan performa karyawan"
            actions={[
              { 
                label: 'Tambah Karyawan', 
                icon: 'plus', 
                onClick: handleAddEmployee, 
                primary: true 
              }
            ]}
          />

          <Tabs defaultValue="employees" className="mt-6" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Data Karyawan</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Absensi</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Evaluasi Kinerja</span>
              </TabsTrigger>
              <TabsTrigger value="payroll" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Penggajian</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-xl">Data Karyawan</CardTitle>
                    
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari karyawan..."
                          className="pl-8"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-40">
                          <div className="flex items-center">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Tidak Aktif</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddEmployee}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Karyawan
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Belum ada data karyawan</h3>
                      <p className="text-muted-foreground mt-1">Tambahkan data karyawan untuk mulai menggunakan fitur HRD</p>
                      <Button 
                        className="mt-4"
                        onClick={handleAddEmployee}
                      >
                        Tambah Karyawan
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEmployees.map((employee: Employee) => (
                        <Card key={employee.id} className="overflow-hidden border-l-4 border-l-primary">
                          <CardContent className="p-0">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{employee.name}</h3>
                                  <p className="text-muted-foreground">{employee.position}</p>
                                </div>
                                <Badge variant={employee.isActive ? "default" : "destructive"} className={employee.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                                  {employee.isActive ? 'Aktif' : 'Tidak Aktif'}
                                </Badge>
                              </div>
                              
                              <div className="mt-4 space-y-2 text-sm">
                                {employee.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-muted-foreground" />
                                    <span>{employee.email}</span>
                                  </div>
                                )}
                                {employee.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-muted-foreground" />
                                    <span>{employee.phone}</span>
                                  </div>
                                )}
                                {employee.joiningDate && (
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>Bergabung: {format(new Date(employee.joiningDate), "dd/MM/yyyy")}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            <div className="flex p-3">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </Button>
                              <Separator orientation="vertical" className="h-6 mx-1" />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteEmployee(employee)}
                              >
                                <Trash2 size={16} className="mr-1" />
                                Hapus
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-10 border rounded-lg">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Absensi Karyawan</h3>
                    <p className="text-muted-foreground mt-1">Catat dan kelola absensi karyawan harian</p>
                    <Button 
                      className="mt-4"
                      onClick={() => window.location.href = '/hrd-attendance'}
                    >
                      Catat Absensi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-10 border rounded-lg">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Evaluasi Kinerja</h3>
                    <p className="text-muted-foreground mt-1">Buat dan kelola evaluasi kinerja karyawan</p>
                    <Button className="mt-4">Buat Evaluasi</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-10 border rounded-lg">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Penggajian</h3>
                    <p className="text-muted-foreground mt-1">Kelola data penggajian karyawan</p>
                    <Link href="/hrd-payroll">
                      <Button className="mt-4">Kelola Penggajian</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Form modal untuk Tambah/Edit Karyawan */}
      <Dialog open={showNewEmployeeModal} onOpenChange={setShowNewEmployeeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{employeeToEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</DialogTitle>
            <DialogDescription>
              {employeeToEdit 
                ? 'Perbarui informasi karyawan dalam sistem' 
                : 'Masukkan informasi karyawan baru ke dalam sistem'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan jabatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="email@contoh.com" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="08xxxx" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Bergabung</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date || new Date());
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                      <div className="space-y-1 leading-none">
                        <FormLabel>Status Aktif</FormLabel>
                        <FormDescription>
                          Apakah karyawan ini aktif bekerja?
                        </FormDescription>
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
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={addEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                >
                  {(addEmployeeMutation.isPending || updateEmployeeMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {employeeToEdit ? 'Perbarui' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alert dialog untuk konfirmasi hapus karyawan */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Konfirmasi Hapus Karyawan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus karyawan <strong>{employeeToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => employeeToDelete && deleteEmployeeMutation.mutate(employeeToDelete.id)}
              disabled={deleteEmployeeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployeeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}