"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HrdEmployeeManagement;
const react_1 = require("react");
const wouter_1 = require("wouter");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const separator_1 = require("@/components/ui/separator");
const lucide_react_2 = require("lucide-react");
const dialog_1 = require("@/components/ui/dialog");
const react_hook_form_1 = require("react-hook-form");
const form_1 = require("@/components/ui/form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const date_fns_1 = require("date-fns");
const popover_1 = require("@/components/ui/popover");
const lucide_react_3 = require("lucide-react");
const calendar_1 = require("@/components/ui/calendar");
const utils_1 = require("@/lib/utils");
const alert_dialog_1 = require("@/components/ui/alert-dialog");
const queryClient_1 = require("@/lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
const switch_1 = require("@/components/ui/switch");
// Formulir validasi untuk karyawan baru
const employeeFormSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, {
        message: "Nama harus memiliki minimal 2 karakter.",
    }),
    position: zod_1.z.string().min(2, {
        message: "Jabatan harus diisi.",
    }),
    email: zod_1.z.string().email({
        message: "Email harus valid.",
    }).nullable().optional(),
    phone: zod_1.z.string().min(6, {
        message: "Nomor telepon harus valid."
    }).nullable().optional(),
    joiningDate: zod_1.z.date({
        required_error: "Tanggal bergabung harus diisi.",
        invalid_type_error: "Format tanggal tidak valid.",
    }).default(() => new Date()), // Defaultnya tanggal hari ini
    isActive: zod_1.z.boolean().default(true),
});
function HrdEmployeeManagement() {
    const { toast } = (0, use_toast_1.useToast)();
    const [activeTab, setActiveTab] = (0, react_1.useState)("employees");
    const [search, setSearch] = (0, react_1.useState)("");
    const [filterStatus, setFilterStatus] = (0, react_1.useState)("all");
    const [showNewEmployeeModal, setShowNewEmployeeModal] = (0, react_1.useState)(false);
    const [employeeToEdit, setEmployeeToEdit] = (0, react_1.useState)(null);
    const [employeeToDelete, setEmployeeToDelete] = (0, react_1.useState)(null);
    // Query untuk mendapatkan data karyawan
    const { data: employees = [], isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/employees'],
    });
    // Form untuk menambah dan mengedit karyawan
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(employeeFormSchema),
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
    const populateForm = (employee) => {
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
    const addEmployeeMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)("POST", "/api/employees", data);
            return await res.json();
        },
        onSuccess: () => {
            setShowNewEmployeeModal(false);
            resetForm();
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
            toast({
                title: "Berhasil",
                description: "Karyawan berhasil ditambahkan",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Gagal menambahkan karyawan",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Mutation untuk mengedit karyawan
    const updateEmployeeMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)("PUT", `/api/employees/${data.id}`, data.employee);
            return await res.json();
        },
        onSuccess: () => {
            setShowNewEmployeeModal(false);
            setEmployeeToEdit(null);
            resetForm();
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
            toast({
                title: "Berhasil",
                description: "Data karyawan berhasil diperbarui",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Gagal memperbarui data karyawan",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Mutation untuk menghapus karyawan
    const deleteEmployeeMutation = (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            const res = await (0, queryClient_1.apiRequest)("DELETE", `/api/employees/${id}`);
            return await res.json();
        },
        onSuccess: () => {
            setEmployeeToDelete(null);
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
            toast({
                title: "Berhasil",
                description: "Karyawan berhasil dihapus",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Gagal menghapus karyawan",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Handler untuk submit form
    const onSubmit = (data) => {
        if (employeeToEdit) {
            updateEmployeeMutation.mutate({ id: employeeToEdit.id, employee: data });
        }
        else {
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
    const handleEditEmployee = (employee) => {
        setEmployeeToEdit(employee);
        populateForm(employee);
        setShowNewEmployeeModal(true);
    };
    // Mengkonfirmasi penghapusan karyawan
    const handleDeleteEmployee = (employee) => {
        setEmployeeToDelete(employee);
    };
    // Filter employees based on search and status
    const filteredEmployees = Array.isArray(employees) ? employees.filter((employee) => {
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
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="HRD Management"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Manajemen Karyawan" subtitle="Kelola data dan performa karyawan" actions={[
            {
                label: 'Tambah Karyawan',
                icon: 'plus',
                onClick: handleAddEmployee,
                primary: true
            }
        ]}/>

          <tabs_1.Tabs defaultValue="employees" className="mt-6" onValueChange={setActiveTab}>
            <tabs_1.TabsList className="mb-4">
              <tabs_1.TabsTrigger value="employees" className="flex items-center gap-2">
                <lucide_react_1.Users className="h-4 w-4"/>
                <span>Data Karyawan</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="attendance" className="flex items-center gap-2">
                <lucide_react_3.CalendarIcon className="h-4 w-4"/>
                <span>Absensi</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="performance" className="flex items-center gap-2">
                <lucide_react_1.FileText className="h-4 w-4"/>
                <span>Evaluasi Kinerja</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="payroll" className="flex items-center gap-2">
                <lucide_react_1.Briefcase className="h-4 w-4"/>
                <span>Penggajian</span>
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="employees">
              <card_1.Card>
                <card_1.CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <card_1.CardTitle className="text-xl">Data Karyawan</card_1.CardTitle>
                    
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <input_1.Input placeholder="Cari karyawan..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)}/>
                      </div>
                      <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
                        <select_1.SelectTrigger className="w-full md:w-40">
                          <div className="flex items-center">
                            <lucide_react_1.Filter className="mr-2 h-4 w-4 text-muted-foreground"/>
                            <select_1.SelectValue placeholder="Filter"/>
                          </div>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="all">Semua Status</select_1.SelectItem>
                          <select_1.SelectItem value="active">Aktif</select_1.SelectItem>
                          <select_1.SelectItem value="inactive">Tidak Aktif</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <button_1.Button onClick={handleAddEmployee}>
                        <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                        Tambah Karyawan
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {isLoading ? (<div className="flex justify-center py-10">
                      <lucide_react_2.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>) : filteredEmployees.length === 0 ? (<div className="text-center py-10 border rounded-lg">
                      <lucide_react_1.User className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                      <h3 className="text-lg font-medium">Belum ada data karyawan</h3>
                      <p className="text-muted-foreground mt-1">Tambahkan data karyawan untuk mulai menggunakan fitur HRD</p>
                      <button_1.Button className="mt-4" onClick={handleAddEmployee}>
                        Tambah Karyawan
                      </button_1.Button>
                    </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEmployees.map((employee) => (<card_1.Card key={employee.id} className="overflow-hidden border-l-4 border-l-primary">
                          <card_1.CardContent className="p-0">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{employee.name}</h3>
                                  <p className="text-muted-foreground">{employee.position}</p>
                                </div>
                                <badge_1.Badge variant={employee.isActive ? "default" : "destructive"} className={employee.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                                  {employee.isActive ? 'Aktif' : 'Tidak Aktif'}
                                </badge_1.Badge>
                              </div>
                              
                              <div className="mt-4 space-y-2 text-sm">
                                {employee.email && (<div className="flex items-center gap-2">
                                    <lucide_react_1.Mail size={16} className="text-muted-foreground"/>
                                    <span>{employee.email}</span>
                                  </div>)}
                                {employee.phone && (<div className="flex items-center gap-2">
                                    <lucide_react_1.Phone size={16} className="text-muted-foreground"/>
                                    <span>{employee.phone}</span>
                                  </div>)}
                                {employee.joiningDate && (<div className="flex items-center gap-2">
                                    <lucide_react_3.CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                                    <span>Bergabung: {(0, date_fns_1.format)(new Date(employee.joiningDate), "dd/MM/yyyy")}</span>
                                  </div>)}
                              </div>
                            </div>

                            <separator_1.Separator />

                            <div className="flex p-3">
                              <button_1.Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEditEmployee(employee)}>
                                <lucide_react_1.Edit size={16} className="mr-1"/>
                                Edit
                              </button_1.Button>
                              <separator_1.Separator orientation="vertical" className="h-6 mx-1"/>
                              <button_1.Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleDeleteEmployee(employee)}>
                                <lucide_react_1.Trash2 size={16} className="mr-1"/>
                                Hapus
                              </button_1.Button>
                            </div>
                          </card_1.CardContent>
                        </card_1.Card>))}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="attendance" className="mt-4">
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="text-center py-10 border rounded-lg">
                    <lucide_react_3.CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="text-lg font-medium">Absensi Karyawan</h3>
                    <p className="text-muted-foreground mt-1">Catat dan kelola absensi karyawan harian</p>
                    <button_1.Button className="mt-4" onClick={() => window.location.href = '/hrd-attendance'}>
                      Catat Absensi
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="performance" className="mt-4">
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="text-center py-10 border rounded-lg">
                    <lucide_react_1.User className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="text-lg font-medium">Evaluasi Kinerja</h3>
                    <p className="text-muted-foreground mt-1">Buat dan kelola evaluasi kinerja karyawan</p>
                    <button_1.Button className="mt-4">Buat Evaluasi</button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="payroll" className="mt-4">
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="text-center py-10 border rounded-lg">
                    <lucide_react_1.User className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="text-lg font-medium">Penggajian</h3>
                    <p className="text-muted-foreground mt-1">Kelola data penggajian karyawan</p>
                    <wouter_1.Link href="/hrd-payroll">
                      <button_1.Button className="mt-4">Kelola Penggajian</button_1.Button>
                    </wouter_1.Link>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </div>
      </div>

      {/* Form modal untuk Tambah/Edit Karyawan */}
      <dialog_1.Dialog open={showNewEmployeeModal} onOpenChange={setShowNewEmployeeModal}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>{employeeToEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              {employeeToEdit
            ? 'Perbarui informasi karyawan dalam sistem'
            : 'Masukkan informasi karyawan baru ke dalam sistem'}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <form_1.FormField control={form.control} name="name" render={({ field }) => (<form_1.FormItem>
                    <form_1.FormLabel>Nama Lengkap</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Masukkan nama lengkap" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
              
              <form_1.FormField control={form.control} name="position" render={({ field }) => (<form_1.FormItem>
                    <form_1.FormLabel>Jabatan</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Masukkan jabatan" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="email" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Email</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input type="email" placeholder="email@contoh.com" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
                
                <form_1.FormField control={form.control} name="phone" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Nomor Telepon</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="08xxxx" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="joiningDate" render={({ field }) => (<form_1.FormItem className="flex flex-col">
                      <form_1.FormLabel>Tanggal Bergabung</form_1.FormLabel>
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <form_1.FormControl>
                            <button_1.Button variant={"outline"} className={(0, utils_1.cn)("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? ((0, date_fns_1.format)(new Date(field.value), "dd/MM/yyyy")) : (<span>Pilih tanggal</span>)}
                              <lucide_react_3.CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                            </button_1.Button>
                          </form_1.FormControl>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => {
                field.onChange(date || new Date());
            }} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus/>
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
                
                <form_1.FormField control={form.control} name="isActive" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                      <div className="space-y-1 leading-none">
                        <form_1.FormLabel>Status Aktif</form_1.FormLabel>
                        <form_1.FormDescription>
                          Apakah karyawan ini aktif bekerja?
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                      </form_1.FormControl>
                    </form_1.FormItem>)}/>
              </div>
              
              <dialog_1.DialogFooter className="gap-2 sm:gap-0">
                <dialog_1.DialogClose asChild>
                  <button_1.Button type="button" variant="outline">Batal</button_1.Button>
                </dialog_1.DialogClose>
                <button_1.Button type="submit" disabled={addEmployeeMutation.isPending || updateEmployeeMutation.isPending}>
                  {(addEmployeeMutation.isPending || updateEmployeeMutation.isPending) && (<lucide_react_2.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  {employeeToEdit ? 'Perbarui' : 'Simpan'}
                </button_1.Button>
              </dialog_1.DialogFooter>
            </form>
          </form_1.Form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Alert dialog untuk konfirmasi hapus karyawan */}
      <alert_dialog_1.AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <alert_dialog_1.AlertDialogContent>
          <alert_dialog_1.AlertDialogHeader>
            <alert_dialog_1.AlertDialogTitle className="flex items-center gap-2">
              <lucide_react_1.AlertCircle className="h-5 w-5 text-destructive"/>
              Konfirmasi Hapus Karyawan
            </alert_dialog_1.AlertDialogTitle>
            <alert_dialog_1.AlertDialogDescription>
              Apakah Anda yakin ingin menghapus karyawan <strong>{employeeToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </alert_dialog_1.AlertDialogDescription>
          </alert_dialog_1.AlertDialogHeader>
          <alert_dialog_1.AlertDialogFooter>
            <alert_dialog_1.AlertDialogCancel>Batal</alert_dialog_1.AlertDialogCancel>
            <alert_dialog_1.AlertDialogAction onClick={() => employeeToDelete && deleteEmployeeMutation.mutate(employeeToDelete.id)} disabled={deleteEmployeeMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteEmployeeMutation.isPending && (<lucide_react_2.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
              Hapus
            </alert_dialog_1.AlertDialogAction>
          </alert_dialog_1.AlertDialogFooter>
        </alert_dialog_1.AlertDialogContent>
      </alert_dialog_1.AlertDialog>

    </div>);
}
