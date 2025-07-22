"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HrdPayroll;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const queryClient_1 = require("@/lib/queryClient");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const table_1 = require("@/components/ui/table");
const select_1 = require("@/components/ui/select");
const dialog_1 = require("@/components/ui/dialog");
const alert_dialog_1 = require("@/components/ui/alert-dialog");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const badge_1 = require("@/components/ui/badge");
const zod_1 = require("@hookform/resolvers/zod");
const react_hook_form_1 = require("react-hook-form");
const zod_2 = require("zod");
const form_1 = require("@/components/ui/form");
// Form schema untuk payroll
const payrollFormSchema = zod_2.z.object({
    employeeId: zod_2.z.number({
        required_error: "Silakan pilih karyawan",
    }),
    periodStart: zod_2.z.string({
        required_error: "Tanggal mulai periode diperlukan",
    }),
    periodEnd: zod_2.z.string({
        required_error: "Tanggal akhir periode diperlukan",
    }),
    paymentType: zod_2.z.enum(['daily', 'monthly'], {
        required_error: "Silakan pilih tipe penggajian",
    }),
    dailyRate: zod_2.z.number().optional(),
    monthlySalary: zod_2.z.number().optional(),
    allowance: zod_2.z.number().default(35000),
    bonus: zod_2.z.number().default(0).optional(),
    deduction: zod_2.z.number().default(0).optional(),
    paymentMethod: zod_2.z.enum(['cash', 'transfer'], {
        required_error: "Silakan pilih metode pembayaran",
    }),
    notes: zod_2.z.string().optional(),
}).refine((data) => {
    // Validasi bahwa dailyRate diisi untuk paymentType 'daily'
    if (data.paymentType === 'daily' && !data.dailyRate) {
        return false;
    }
    // Validasi bahwa monthlySalary diisi untuk paymentType 'monthly'
    if (data.paymentType === 'monthly' && !data.monthlySalary) {
        return false;
    }
    return true;
}, {
    message: "Nilai gaji harus diisi sesuai dengan tipe penggajian",
    path: ["dailyRate", "monthlySalary"],
});
function HrdPayroll() {
    const { toast } = (0, use_toast_1.useToast)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [isAddDialogOpen, setIsAddDialogOpen] = (0, react_1.useState)(false);
    const [selectedPayroll, setSelectedPayroll] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    // Fetch data
    const { data: payrolls, isLoading: isLoadingPayrolls } = (0, react_query_1.useQuery)({
        queryKey: ['/api/hrd/payrolls'],
    });
    const { data: employees, isLoading: isLoadingEmployees } = (0, react_query_1.useQuery)({
        queryKey: ['/api/employees'],
    });
    // Fetch position salaries
    const { data: positionSalaries, isLoading: isLoadingPositionSalaries } = (0, react_query_1.useQuery)({
        queryKey: ['/api/hrd/position-salaries'],
    });
    // Form
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(payrollFormSchema),
        defaultValues: {
            bonus: 0,
            deduction: 0,
            allowance: 35000,
            paymentType: 'monthly',
            paymentMethod: 'transfer',
        },
    });
    // Mutations
    const createPayrollMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            // Convert string dates to ISO format
            const payload = {
                ...data,
                periodStart: new Date(data.periodStart).toISOString(),
                periodEnd: new Date(data.periodEnd).toISOString(),
                bonus: data.bonus || 0,
                deduction: data.deduction || 0,
                allowance: data.allowance || 35000,
                // Pastikan dailyRate atau monthlySalary dimasukkan sesuai dengan tipe penggajian
                dailyRate: data.paymentType === 'daily' ? data.dailyRate : undefined,
                monthlySalary: data.paymentType === 'monthly' ? data.monthlySalary : undefined,
            };
            console.log("Sending payload to server:", payload);
            const response = await (0, queryClient_1.apiRequest)('POST', '/api/hrd/payrolls', payload);
            return await response.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Data penggajian berhasil ditambahkan',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/hrd/payrolls'] });
            setIsAddDialogOpen(false);
            form.reset();
        },
        onError: (error) => {
            toast({
                title: 'Gagal',
                description: `Gagal menambahkan data penggajian: ${error.message}`,
                variant: 'destructive',
            });
        },
    });
    const updatePayrollStatusMutation = (0, react_query_1.useMutation)({
        mutationFn: async ({ id, status }) => {
            const response = await (0, queryClient_1.apiRequest)('PUT', `/api/hrd/payrolls/${id}`, { status });
            return await response.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Status penggajian berhasil diperbarui',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/hrd/payrolls'] });
        },
        onError: (error) => {
            toast({
                title: 'Gagal',
                description: `Gagal memperbarui status penggajian: ${error.message}`,
                variant: 'destructive',
            });
        },
    });
    const deletePayrollMutation = (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            await (0, queryClient_1.apiRequest)('DELETE', `/api/hrd/payrolls/${id}`);
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Data penggajian berhasil dihapus',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/hrd/payrolls'] });
        },
        onError: (error) => {
            toast({
                title: 'Gagal',
                description: `Gagal menghapus data penggajian: ${error.message}`,
                variant: 'destructive',
            });
        },
    });
    // Handlers
    const onSubmit = (data) => {
        createPayrollMutation.mutate(data);
    };
    const handleApprovePayroll = (id) => {
        updatePayrollStatusMutation.mutate({ id, status: 'approved' });
    };
    const handleRejectPayroll = (id) => {
        updatePayrollStatusMutation.mutate({ id, status: 'rejected' });
    };
    const handleDeletePayroll = (id) => {
        deletePayrollMutation.mutate(id);
    };
    // Filter payrolls based on search term
    const filteredPayrolls = payrolls?.filter(payroll => {
        const employee = employees?.find(e => e.id === payroll.employeeId);
        const status = payroll.status || 'pending';
        const paymentMethod = payroll.paymentMethod || 'transfer';
        const paymentType = payroll.paymentType || 'monthly';
        return (employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
            paymentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payroll.notes && payroll.notes.toLowerCase().includes(searchTerm.toLowerCase())));
    }) || [];
    // Helper function to get employee name
    const getEmployeeName = (id) => {
        const employee = employees?.find(e => e.id === id);
        return employee ? employee.name : 'Karyawan tidak ditemukan';
    };
    // Helper function for status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <badge_1.Badge variant="outline">Menunggu</badge_1.Badge>;
            case 'approved':
                return <badge_1.Badge variant="default" className="bg-green-500 hover:bg-green-600">Disetujui</badge_1.Badge>;
            case 'rejected':
                return <badge_1.Badge variant="destructive">Ditolak</badge_1.Badge>;
            case 'paid':
                return <badge_1.Badge variant="default">Dibayar</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
        }
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="HRD Management"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Manajemen Penggajian" subtitle="Kelola data penggajian karyawan" actions={[
            {
                label: 'Tambah Penggajian',
                icon: 'plus',
                onClick: () => setIsAddDialogOpen(true),
                primary: true
            }
        ]}/>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg">Total Penggajian</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingPayrolls ? (<lucide_react_1.Loader2 className="h-6 w-6 animate-spin"/>) : ((0, utils_1.formatCurrency)(payrolls?.reduce((sum, payroll) => sum + payroll.totalAmount, 0) || 0))}
                </p>
                <p className="text-muted-foreground text-sm">Total seluruh periode</p>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg">Gaji Belum Diproses</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingPayrolls ? (<lucide_react_1.Loader2 className="h-6 w-6 animate-spin"/>) : (payrolls?.filter(p => p.status === 'pending').length || 0)}
                </p>
                <p className="text-muted-foreground text-sm">Menunggu persetujuan</p>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg">Gaji Disetujui</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingPayrolls ? (<lucide_react_1.Loader2 className="h-6 w-6 animate-spin"/>) : (payrolls?.filter(p => p.status === 'approved' || p.status === 'paid').length || 0)}
                </p>
                <p className="text-muted-foreground text-sm">Siap untuk dibayarkan</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>
          
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <card_1.CardTitle>Daftar Penggajian</card_1.CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <input_1.Input type="search" placeholder="Cari penggajian..." className="pl-8 w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                  </div>
                  <button_1.Button variant="outline" size="icon">
                    <lucide_react_1.Download className="h-4 w-4"/>
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingPayrolls ? (<div className="flex justify-center py-8">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : filteredPayrolls.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                  Belum ada data penggajian
                </div>) : (<table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Karyawan</table_1.TableHead>
                      <table_1.TableHead>Periode</table_1.TableHead>
                      <table_1.TableHead>Tipe</table_1.TableHead>
                      <table_1.TableHead className="text-right">Gaji Pokok</table_1.TableHead>
                      <table_1.TableHead className="text-right">Tunjangan</table_1.TableHead>
                      <table_1.TableHead className="text-right">Bonus</table_1.TableHead>
                      <table_1.TableHead className="text-right">Potongan</table_1.TableHead>
                      <table_1.TableHead className="text-right">Total</table_1.TableHead>
                      <table_1.TableHead>Status</table_1.TableHead>
                      <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {filteredPayrolls.map((payroll) => {
                // Tampilkan tunjangan langsung dari data (bukan menghitung ulang)
                const allowance = payroll.allowance || 35000; // Default 35000 jika tidak ada
                const paymentType = payroll.paymentType || 'monthly';
                const status = payroll.status || 'pending';
                return (<table_1.TableRow key={payroll.id}>
                          <table_1.TableCell className="font-medium">{getEmployeeName(payroll.employeeId)}</table_1.TableCell>
                          <table_1.TableCell>
                            {(0, date_fns_1.format)(new Date(payroll.periodStart), 'dd MMM', { locale: locale_1.id })} - {(0, date_fns_1.format)(new Date(payroll.periodEnd), 'dd MMM yyyy', { locale: locale_1.id })}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {paymentType === 'monthly' ? 'Bulanan' : 'Harian'}
                          </table_1.TableCell>
                          <table_1.TableCell className="text-right">{(0, utils_1.formatCurrency)(payroll.baseSalary)}</table_1.TableCell>
                          <table_1.TableCell className="text-right">{(0, utils_1.formatCurrency)(allowance)}</table_1.TableCell>
                          <table_1.TableCell className="text-right">{(0, utils_1.formatCurrency)(payroll.bonus || 0)}</table_1.TableCell>
                          <table_1.TableCell className="text-right">{(0, utils_1.formatCurrency)(payroll.deduction || 0)}</table_1.TableCell>
                          <table_1.TableCell className="text-right font-bold">{(0, utils_1.formatCurrency)(payroll.totalAmount)}</table_1.TableCell>
                          <table_1.TableCell>{getStatusBadge(status)}</table_1.TableCell>
                          <table_1.TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {status === 'pending' && (<>
                                  <button_1.Button variant="ghost" size="icon" title="Setujui" onClick={() => handleApprovePayroll(payroll.id)}>
                                    <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-500"/>
                                  </button_1.Button>
                                  <button_1.Button variant="ghost" size="icon" title="Tolak" onClick={() => handleRejectPayroll(payroll.id)}>
                                    <lucide_react_1.Ban className="h-4 w-4 text-red-500"/>
                                  </button_1.Button>
                                </>)}
                              <alert_dialog_1.AlertDialog>
                                <alert_dialog_1.AlertDialogTrigger asChild>
                                  <button_1.Button variant="ghost" size="icon">
                                    <lucide_react_1.Trash2 className="h-4 w-4 text-destructive"/>
                                  </button_1.Button>
                                </alert_dialog_1.AlertDialogTrigger>
                                <alert_dialog_1.AlertDialogContent>
                                  <alert_dialog_1.AlertDialogHeader>
                                    <alert_dialog_1.AlertDialogTitle>Hapus Data Penggajian</alert_dialog_1.AlertDialogTitle>
                                    <alert_dialog_1.AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus data penggajian ini? Tindakan ini tidak dapat dibatalkan.
                                    </alert_dialog_1.AlertDialogDescription>
                                  </alert_dialog_1.AlertDialogHeader>
                                  <alert_dialog_1.AlertDialogFooter>
                                    <alert_dialog_1.AlertDialogCancel>Batal</alert_dialog_1.AlertDialogCancel>
                                    <alert_dialog_1.AlertDialogAction onClick={() => handleDeletePayroll(payroll.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Hapus
                                    </alert_dialog_1.AlertDialogAction>
                                  </alert_dialog_1.AlertDialogFooter>
                                </alert_dialog_1.AlertDialogContent>
                              </alert_dialog_1.AlertDialog>
                            </div>
                          </table_1.TableCell>
                        </table_1.TableRow>);
            })}
                  </table_1.TableBody>
                </table_1.Table>)}
            </card_1.CardContent>
          </card_1.Card>
          
          {/* Add Payroll Dialog */}
          <dialog_1.Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <dialog_1.DialogContent className="sm:max-w-[600px]">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Tambah Penggajian Baru</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Buat data penggajian baru untuk karyawan. Sistem akan menghitung total gaji berdasarkan tipe penggajian dan posisi karyawan.
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <form_1.Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <form_1.FormField control={form.control} name="employeeId" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Karyawan</form_1.FormLabel>
                        <select_1.Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Pilih karyawan"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {isLoadingEmployees ? (<div className="flex justify-center p-2">
                                <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                              </div>) : (employees?.map((employee) => (<select_1.SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.name} - {employee.position}
                                </select_1.SelectItem>)))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="periodStart" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Tanggal Mulai</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="date" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    
                    <form_1.FormField control={form.control} name="periodEnd" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Tanggal Akhir</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="date" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <form_1.FormField control={form.control} name="paymentType" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Tipe Penggajian</form_1.FormLabel>
                        <select_1.Select onValueChange={(value) => {
                field.onChange(value);
                // Reset dailyRate when switching payment type
                if (value === 'daily') {
                    const employeeId = form.getValues('employeeId');
                    if (employeeId) {
                        const employee = employees?.find(e => e.id === employeeId);
                        if (employee) {
                            const positionSalary = positionSalaries?.find(ps => ps.position === employee.position);
                            if (positionSalary) {
                                form.setValue('dailyRate', positionSalary.dailyRate);
                            }
                        }
                    }
                }
            }} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Pilih tipe penggajian"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="monthly">Bulanan</select_1.SelectItem>
                            <select_1.SelectItem value="daily">Harian</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormDescription>
                          Gaji bulanan menggunakan nominal tetap, gaji harian berdasarkan kehadiran
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  {form.watch('paymentType') === 'daily' ? (<form_1.FormField control={form.control} name="dailyRate" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Tarif Harian (Rp)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Tarif gaji harian yang akan dikalikan dengan jumlah hari kerja
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>) : (<form_1.FormField control={form.control} name="monthlySalary" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Gaji Bulanan (Rp)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Nilai gaji bulanan tetap (tanpa perhitungan hari kerja)
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>)}
                  
                  <div className="grid grid-cols-1 gap-4">
                    <form_1.FormField control={form.control} name="allowance" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Tunjangan (Rp)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 35000 : parseInt(e.target.value))}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            <div className="text-sm">
                              <p className="font-medium">Nilai default tunjangan adalah Rp 35.000, terdiri dari:</p>
                              <ul className="list-disc pl-5 mt-1">
                                <li>Tunjangan Makan: Rp 20.000</li>
                                <li>Tunjangan Transport: Rp 15.000</li>
                              </ul>
                              <p className="mt-1">Tunjangan ini berlaku untuk semua tipe penggajian (bulanan/harian).</p>
                            </div>
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="bonus" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Bonus (Rp)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    
                    <form_1.FormField control={form.control} name="deduction" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Potongan (Rp)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <form_1.FormField control={form.control} name="paymentMethod" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Metode Pembayaran</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Pilih metode pembayaran"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="cash">Tunai</select_1.SelectItem>
                            <select_1.SelectItem value="transfer">Transfer Bank</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <form_1.FormField control={form.control} name="notes" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Catatan</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <dialog_1.DialogFooter>
                    <button_1.Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Batal
                    </button_1.Button>
                    <button_1.Button type="submit" disabled={createPayrollMutation.isPending}>
                      {createPayrollMutation.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                      Simpan
                    </button_1.Button>
                  </dialog_1.DialogFooter>
                </form>
              </form_1.Form>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>
    </div>);
}
