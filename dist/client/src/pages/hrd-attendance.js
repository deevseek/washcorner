"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HrdAttendance;
const react_1 = __importStar(require("react"));
const wouter_1 = require("wouter");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const calendar_1 = require("@/components/ui/calendar");
const popover_1 = require("@/components/ui/popover");
const utils_1 = require("@/lib/utils");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const separator_1 = require("@/components/ui/separator");
const table_1 = require("@/components/ui/table");
const lucide_react_1 = require("lucide-react");
const dialog_1 = require("@/components/ui/dialog");
const form_1 = require("@/components/ui/form");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const queryClient_1 = require("@/lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
const alert_dialog_1 = require("@/components/ui/alert-dialog");
// Form validation schema untuk absensi
const attendanceFormSchema = zod_1.z.object({
    employeeId: zod_1.z.number({
        required_error: "Karyawan harus dipilih",
    }),
    date: zod_1.z.date({
        required_error: "Tanggal harus dipilih",
        invalid_type_error: "Format tanggal tidak valid",
    }).default(() => new Date()),
    status: zod_1.z.string({
        required_error: "Status kehadiran harus dipilih",
    }).default("present"),
    checkIn: zod_1.z.date({
        invalid_type_error: "Format waktu tidak valid",
    }).default(() => {
        const now = new Date();
        return (0, date_fns_1.set)(now, { hours: 8, minutes: 0, seconds: 0 });
    }),
    checkOut: zod_1.z.date({
        invalid_type_error: "Format waktu tidak valid",
    }).nullable().optional(),
    notes: zod_1.z.string().optional().nullable(),
});
// Untuk status absensi
const attendanceStatusOptions = [
    { value: "present", label: "Hadir" },
    { value: "absent", label: "Tidak Hadir" },
    { value: "late", label: "Terlambat" },
];
function HrdAttendance() {
    const { toast } = (0, use_toast_1.useToast)();
    const [date, setDate] = (0, react_1.useState)(new Date());
    const [showAttendanceModal, setShowAttendanceModal] = (0, react_1.useState)(false);
    const [attendanceToEdit, setAttendanceToEdit] = (0, react_1.useState)(null);
    const [attendanceToDelete, setAttendanceToDelete] = (0, react_1.useState)(null);
    const [, navigate] = (0, wouter_1.useLocation)();
    // Cek status autentikasi
    const { data: user, isLoading: isLoadingUser, error: userError } = (0, react_query_1.useQuery)({
        queryKey: ['/api/user'],
        retry: 1
    });
    // Redirect ke halaman auth jika error
    (0, react_1.useEffect)(() => {
        if (userError) {
            toast({
                title: "Sesi login habis",
                description: "Silakan login kembali untuk melanjutkan",
                variant: "destructive",
            });
            navigate('/auth');
        }
    }, [userError, toast, navigate]);
    // Query untuk data absensi berdasarkan tanggal
    const { data: attendances = [], isLoading: isLoadingAttendances, refetch: refetchAttendances } = (0, react_query_1.useQuery)({
        queryKey: ['/api/hrd/attendances', date ? (0, date_fns_1.format)(date, 'yyyy-MM-dd') : null],
        enabled: !!date,
    });
    // Query untuk mendapatkan daftar karyawan untuk dropdown
    const { data: employees = [], isLoading: isLoadingEmployees } = (0, react_query_1.useQuery)({
        queryKey: ['/api/employees'],
    });
    // Form untuk tambah/edit data absensi
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(attendanceFormSchema),
        defaultValues: {
            employeeId: 0,
            date: date,
            status: "present",
            checkIn: (0, date_fns_1.set)(new Date(), { hours: 8, minutes: 0, seconds: 0 }),
            checkOut: null,
            notes: null,
        },
    });
    // Reset form ke nilai default
    const resetForm = () => {
        form.reset({
            employeeId: 0,
            date: date,
            status: "present",
            checkIn: (0, date_fns_1.set)(new Date(), { hours: 8, minutes: 0, seconds: 0 }),
            checkOut: null,
            notes: null,
        });
    };
    // Mengisi form dengan data absensi yang akan diedit
    const populateForm = (attendance) => {
        form.reset({
            employeeId: attendance.employeeId,
            date: attendance.date ? new Date(attendance.date) : date,
            status: attendance.status || "present",
            checkIn: attendance.checkIn ? new Date(attendance.checkIn) : undefined,
            checkOut: attendance.checkOut ? new Date(attendance.checkOut) : null,
            notes: attendance.notes,
        });
    };
    // Mutation untuk menambah data absensi
    const addAttendanceMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)("POST", "/api/hrd/attendances", data);
            return await res.json();
        },
        onSuccess: () => {
            setShowAttendanceModal(false);
            resetForm();
            refetchAttendances();
            toast({
                title: "Berhasil",
                description: "Data absensi berhasil ditambahkan",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Gagal menambahkan data absensi",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Mutation untuk mengedit data absensi
    const updateAttendanceMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)("PUT", `/api/hrd/attendances/${data.id}`, data.attendance);
            return await res.json();
        },
        onSuccess: () => {
            setShowAttendanceModal(false);
            setAttendanceToEdit(null);
            resetForm();
            refetchAttendances();
            toast({
                title: "Berhasil",
                description: "Data absensi berhasil diperbarui",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Gagal memperbarui data absensi",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Mutation untuk menghapus data absensi
    const deleteAttendanceMutation = (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            const res = await (0, queryClient_1.apiRequest)("DELETE", `/api/hrd/attendances/${id}`);
            return await res.json();
        },
        onSuccess: () => {
            setAttendanceToDelete(null);
            refetchAttendances();
            toast({
                title: "Berhasil",
                description: "Data absensi berhasil dihapus",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Gagal menghapus data absensi",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Handler untuk submit form
    const onSubmit = (data) => {
        if (attendanceToEdit) {
            updateAttendanceMutation.mutate({ id: attendanceToEdit.id, attendance: data });
        }
        else {
            addAttendanceMutation.mutate(data);
        }
    };
    // Membuka modal untuk menambah absensi baru
    const handleAddAttendance = () => {
        resetForm();
        setAttendanceToEdit(null);
        setShowAttendanceModal(true);
    };
    // Membuka modal untuk mengedit absensi
    const handleEditAttendance = (attendance) => {
        setAttendanceToEdit(attendance);
        populateForm(attendance);
        setShowAttendanceModal(true);
    };
    // Mengkonfirmasi penghapusan absensi
    const handleDeleteAttendance = (attendance) => {
        setAttendanceToDelete(attendance);
    };
    // Statistik absensi
    const typedAttendances = attendances;
    const presentCount = typedAttendances.filter((a) => a.status === 'present').length;
    const absentCount = typedAttendances.filter((a) => a.status === 'absent').length;
    const lateCount = typedAttendances.filter((a) => a.status === 'late').length;
    // Status color mapping
    const statusColors = {
        present: 'bg-green-100 text-green-800',
        absent: 'bg-red-100 text-red-800',
        late: 'bg-yellow-100 text-yellow-800',
    };
    const statusIcons = {
        present: <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-600"/>,
        absent: <lucide_react_1.XCircle className="h-5 w-5 text-red-600"/>,
        late: <lucide_react_1.Clock className="h-5 w-5 text-yellow-600"/>,
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="HRD Management"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Absensi Karyawan" subtitle="Catat dan kelola absensi karyawan harian" actions={[
            {
                label: 'Catat Absensi',
                icon: 'plus',
                onClick: handleAddAttendance,
                primary: true
            }
        ]}/>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <card_1.CardTitle className="text-base font-medium">Filter Tanggal</card_1.CardTitle>
                      <button_1.Button variant="outline" size="sm" className="h-8 px-2" onClick={() => {
            const today = new Date();
            setDate(today);
        }}>
                        Hari Ini
                      </button_1.Button>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <button_1.Button className="h-8 flex-1" variant="outline" size="sm" onClick={() => {
            const prevDay = date ? new Date(date.getTime() - 86400000) : new Date(new Date().getTime() - 86400000);
            setDate(prevDay);
        }}>
                          <span className="sr-only">Hari Sebelumnya</span>
                          ← Sebelumnya
                        </button_1.Button>
                        <button_1.Button className="h-8 flex-1" variant="outline" size="sm" onClick={() => {
            const nextDay = date ? new Date(date.getTime() + 86400000) : new Date(new Date().getTime() + 86400000);
            setDate(nextDay);
        }}>
                          Selanjutnya →
                          <span className="sr-only">Hari Berikutnya</span>
                        </button_1.Button>
                      </div>
                      
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <button_1.Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                            <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
                            {date ? (0, date_fns_1.format)(date, 'dd MMMM yyyy', { locale: locale_1.id }) : 'Pilih tanggal'}
                          </button_1.Button>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar mode="single" selected={date} onSelect={(date) => {
            setDate(date);
            // Tutup popover setelah pilihan tanggal
            const closeEvent = new Event('mousedown', { bubbles: true });
            document.dispatchEvent(closeEvent);
        }} locale={locale_1.id} initialFocus/>
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
                
                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-base font-medium">Jumlah Hari Ini</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-100">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm">Hadir</span>
                        <span className="font-medium">{presentCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-100">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm">Tidak Hadir</span>
                        <span className="font-medium">{absentCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-yellow-100">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm">Terlambat</span>
                        <span className="font-medium">{lateCount}</span>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
                
                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-base font-medium">
                      {date ? (0, date_fns_1.format)(date, 'EEEE, dd MMM yyyy', { locale: locale_1.id }) : 'Hari Ini'}
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-2 p-4">
                    <p className="text-sm text-muted-foreground">Catat absensi untuk tanggal yang dipilih</p>
                    <button_1.Button className="w-full" variant="default" onClick={handleAddAttendance}>
                      Catat Absensi
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            </div>

            <div className="md:col-span-2">
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between py-4">
                  <card_1.CardTitle className="text-base font-medium">
                    Absensi Tanggal: {date ? (0, date_fns_1.format)(date, 'dd MMMM yyyy', { locale: locale_1.id }) : 'Hari Ini'}
                  </card_1.CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <popover_1.Popover>
                      <popover_1.PopoverTrigger asChild>
                        <button_1.Button size="sm" variant="outline" className="gap-1">
                          <lucide_react_1.Calendar className="h-4 w-4"/>
                          <span>Filter Tanggal</span>
                        </button_1.Button>
                      </popover_1.PopoverTrigger>
                      <popover_1.PopoverContent className="w-auto p-0" align="end">
                        <calendar_1.Calendar mode="single" selected={date} onSelect={(date) => {
            if (date)
                setDate(date);
            // Tutup popover setelah pilihan tanggal
            const closeEvent = new Event('mousedown', { bubbles: true });
            document.dispatchEvent(closeEvent);
        }} locale={locale_1.id} initialFocus/>
                      </popover_1.PopoverContent>
                    </popover_1.Popover>

                    <button_1.Button size="sm" variant="default" onClick={handleAddAttendance}>
                      <lucide_react_1.Plus className="h-4 w-4 mr-1"/>
                      Catat Absensi
                    </button_1.Button>
                  </div>
                </card_1.CardHeader>
                <separator_1.Separator />
                <card_1.CardContent className="p-0">
                  {isLoadingAttendances ? (<div className="flex justify-center items-center p-8">
                      <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>) : typedAttendances.length === 0 ? (<div className="text-center py-8">
                      <lucide_react_1.CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                      <h3 className="text-lg font-medium">Belum ada data absensi</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Belum ada data absensi untuk tanggal {date ? (0, date_fns_1.format)(date, 'dd MMMM yyyy', { locale: locale_1.id }) : 'yang dipilih'}
                      </p>
                      <button_1.Button className="mt-4" onClick={handleAddAttendance}>Catat Absensi</button_1.Button>
                    </div>) : (<div className="overflow-x-auto">
                      <table_1.Table>
                        <table_1.TableHeader>
                          <table_1.TableRow>
                            <table_1.TableHead>Karyawan</table_1.TableHead>
                            <table_1.TableHead>Status</table_1.TableHead>
                            <table_1.TableHead>Jam Masuk</table_1.TableHead>
                            <table_1.TableHead>Jam Keluar</table_1.TableHead>
                            <table_1.TableHead>Catatan</table_1.TableHead>
                            <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                          </table_1.TableRow>
                        </table_1.TableHeader>
                        <table_1.TableBody>
                          {typedAttendances.map((attendance) => {
                // Cast attendance to AttendanceWithEmployee
                const attendanceData = attendance;
                return (<table_1.TableRow key={attendance.id}>
                                <table_1.TableCell>
                                  <div className="flex flex-col">
                                    <div className="font-medium">{attendanceData.employeeName || `Karyawan ID: ${attendance.employeeId}`}</div>
                                    <div className="text-xs text-muted-foreground">{attendanceData.employeePosition || 'Posisi tidak tersedia'}</div>
                                  </div>
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <div className="flex items-center">
                                    <div className="w-5 h-5 mr-2 rounded-full flex items-center justify-center">
                                      {attendance.status === 'present' ? (<div className="w-3 h-3 rounded-full bg-green-500"/>) : attendance.status === 'absent' ? (<div className="w-3 h-3 rounded-full bg-red-500"/>) : (<div className="w-3 h-3 rounded-full bg-yellow-500"/>)}
                                    </div>
                                    <span>{attendance.status === 'present' ? 'Hadir' : attendance.status === 'absent' ? 'Tidak Hadir' : 'Terlambat'}</span>
                                  </div>
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  {attendance.checkIn ? (0, date_fns_1.format)(new Date(attendance.checkIn), 'HH:mm') : '-'}
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  {attendance.checkOut ? (0, date_fns_1.format)(new Date(attendance.checkOut), 'HH:mm') : '-'}
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <div className="max-w-[120px] truncate">
                                    {attendance.notes || <span className="text-xs text-muted-foreground">-</span>}
                                  </div>
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <div className="flex justify-end">
                                    <button_1.Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEditAttendance(attendance)}>
                                      <lucide_react_1.Edit className="h-4 w-4"/>
                                      <span className="sr-only">Edit</span>
                                    </button_1.Button>
                                  </div>
                                </table_1.TableCell>
                              </table_1.TableRow>);
            })}
                        </table_1.TableBody>
                      </table_1.Table>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </div>
        </div>
      </div>

      {/* Form modal untuk Tambah/Edit Absensi */}
      <dialog_1.Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
        <dialog_1.DialogContent className="sm:max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {attendanceToEdit ? 'Edit Data Absensi' : 'Catat Absensi Baru'}
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <form_1.FormField control={form.control} name="employeeId" render={({ field }) => (<form_1.FormItem>
                    <form_1.FormLabel>Karyawan</form_1.FormLabel>
                    <select_1.Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))} disabled={isLoadingEmployees}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Pilih karyawan"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {employees.map((employee) => (<select_1.SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name} - {employee.position}
                          </select_1.SelectItem>))}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="date" render={({ field }) => (<form_1.FormItem className="flex flex-col">
                      <form_1.FormLabel>Tanggal</form_1.FormLabel>
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <form_1.FormControl>
                            <button_1.Button variant={"outline"} className={(0, utils_1.cn)("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? ((0, date_fns_1.format)(field.value, "PPP", { locale: locale_1.id })) : (<span>Pilih tanggal</span>)}
                              <lucide_react_1.Calendar className="ml-auto h-4 w-4 opacity-50"/>
                            </button_1.Button>
                          </form_1.FormControl>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={locale_1.id} initialFocus/>
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>

                <form_1.FormField control={form.control} name="status" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Status Kehadiran</form_1.FormLabel>
                      <select_1.Select value={field.value} onValueChange={field.onChange}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Pilih status kehadiran"/>
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {attendanceStatusOptions.map((option) => (<select_1.SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </select_1.SelectItem>))}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="checkIn" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Jam Masuk</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input type="time" value={field.value ? (0, date_fns_1.format)(new Date(field.value), 'HH:mm') : '08:00'} onChange={(e) => {
                if (e.target.value) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = form.getValues('date') || new Date();
                    const checkInDate = new Date(newDate);
                    checkInDate.setHours(parseInt(hours), parseInt(minutes), 0);
                    field.onChange(checkInDate);
                }
                else {
                    field.onChange((0, date_fns_1.set)(new Date(), { hours: 8, minutes: 0, seconds: 0 }));
                }
            }} disabled={form.watch('status') === 'absent'}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>

                <form_1.FormField control={form.control} name="checkOut" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Jam Keluar</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input type="time" value={field.value ? (0, date_fns_1.format)(new Date(field.value), 'HH:mm') : ''} onChange={(e) => {
                if (e.target.value) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = form.getValues('date') || new Date();
                    const checkOutDate = new Date(newDate);
                    checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0);
                    field.onChange(checkOutDate);
                }
                else {
                    field.onChange(null);
                }
            }} disabled={form.watch('status') === 'absent'}/>
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Kosongkan jika karyawan belum keluar
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </div>

              <form_1.FormField control={form.control} name="notes" render={({ field }) => (<form_1.FormItem>
                    <form_1.FormLabel>Catatan</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea placeholder="Catatan tambahan (opsional)" className="resize-none" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
              
              <dialog_1.DialogFooter className="gap-2 sm:gap-0">
                <dialog_1.DialogClose asChild>
                  <button_1.Button type="button" variant="outline">Batal</button_1.Button>
                </dialog_1.DialogClose>
                <button_1.Button type="submit" disabled={addAttendanceMutation.isPending || updateAttendanceMutation.isPending}>
                  {(addAttendanceMutation.isPending || updateAttendanceMutation.isPending) && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  {attendanceToEdit ? 'Perbarui' : 'Simpan'}
                </button_1.Button>
              </dialog_1.DialogFooter>
            </form>
          </form_1.Form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Alert dialog untuk konfirmasi hapus absensi */}
      <alert_dialog_1.AlertDialog open={!!attendanceToDelete} onOpenChange={(open) => !open && setAttendanceToDelete(null)}>
        <alert_dialog_1.AlertDialogContent>
          <alert_dialog_1.AlertDialogHeader>
            <alert_dialog_1.AlertDialogTitle className="flex items-center gap-2">
              <lucide_react_1.AlertCircle className="h-5 w-5 text-destructive"/>
              Konfirmasi Hapus Data Absensi
            </alert_dialog_1.AlertDialogTitle>
            <alert_dialog_1.AlertDialogDescription>
              {attendanceToDelete && (<div className="py-2">
                  Apakah Anda yakin ingin menghapus data absensi untuk karyawan <strong>
                  {attendanceToDelete.employeeName || `ID: ${attendanceToDelete.employeeId}`}
                  </strong> pada tanggal <strong>
                  {attendanceToDelete.date ? (0, date_fns_1.format)(new Date(attendanceToDelete.date), 'dd MMMM yyyy', { locale: locale_1.id }) : '-'}
                  </strong>? Tindakan ini tidak dapat dibatalkan.
                </div>)}
            </alert_dialog_1.AlertDialogDescription>
          </alert_dialog_1.AlertDialogHeader>
          <alert_dialog_1.AlertDialogFooter>
            <alert_dialog_1.AlertDialogCancel>Batal</alert_dialog_1.AlertDialogCancel>
            <alert_dialog_1.AlertDialogAction onClick={() => attendanceToDelete && deleteAttendanceMutation.mutate(attendanceToDelete.id)} disabled={deleteAttendanceMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteAttendanceMutation.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
              Hapus
            </alert_dialog_1.AlertDialogAction>
          </alert_dialog_1.AlertDialogFooter>
        </alert_dialog_1.AlertDialogContent>
      </alert_dialog_1.AlertDialog>
    </div>);
}
