import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, set, addDays, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Loader2, CheckCircle2, XCircle, Clock, Plus, Calendar as CalendarIcon, AlertCircle, Edit, Trash2, CalendarPlus, ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Attendance, Employee, InsertAttendance } from '@shared/schema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Form validation schema untuk absensi
const attendanceFormSchema = z.object({
  employeeId: z.number({
    required_error: "Karyawan harus dipilih",
  }),
  date: z.date({
    required_error: "Tanggal harus dipilih",
    invalid_type_error: "Format tanggal tidak valid",
  }).default(() => new Date()),
  status: z.string({
    required_error: "Status kehadiran harus dipilih",
  }).default("present"),
  checkIn: z.date({
    invalid_type_error: "Format waktu tidak valid",
  }).default(() => {
    const now = new Date();
    return set(now, { hours: 8, minutes: 0, seconds: 0 });
  }),
  checkOut: z.date({
    invalid_type_error: "Format waktu tidak valid",
  }).nullable().optional(),
  notes: z.string().optional().nullable(),
});

// Untuk status absensi
const attendanceStatusOptions = [
  { value: "present", label: "Hadir" },
  { value: "absent", label: "Tidak Hadir" },
  { value: "late", label: "Terlambat" },
];

export default function HrdAttendance() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState<Attendance | null>(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState<Attendance | null>(null);
  const [, navigate] = useLocation();
  
  // Cek status autentikasi
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery<any>({
    queryKey: ['/api/user'],
    retry: 1
  });

  // Redirect ke halaman auth jika error
  useEffect(() => {
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
  const { data: attendances = [], isLoading: isLoadingAttendances, refetch: refetchAttendances } = useQuery<Attendance[]>({
    queryKey: ['/api/hrd/attendances', date ? format(date, 'yyyy-MM-dd') : null],
    enabled: !!date,
  });

  // Query untuk mendapatkan daftar karyawan untuk dropdown
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Form untuk tambah/edit data absensi
  const form = useForm<z.infer<typeof attendanceFormSchema>>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: 0,
      date: date,
      status: "present",
      checkIn: set(new Date(), { hours: 8, minutes: 0, seconds: 0 }),
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
      checkIn: set(new Date(), { hours: 8, minutes: 0, seconds: 0 }),
      checkOut: null,
      notes: null,
    });
  };

  // Antarmuka untuk attendance dengan properti tambahan
  interface AttendanceWithEmployee extends Attendance {
    employeeName?: string;
    employeePosition?: string;
  }

  // Mengisi form dengan data absensi yang akan diedit
  const populateForm = (attendance: AttendanceWithEmployee) => {
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
  const addAttendanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof attendanceFormSchema>) => {
      const res = await apiRequest("POST", "/api/hrd/attendances", data);
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
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan data absensi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk mengedit data absensi
  const updateAttendanceMutation = useMutation({
    mutationFn: async (data: { id: number; attendance: z.infer<typeof attendanceFormSchema> }) => {
      const res = await apiRequest("PUT", `/api/hrd/attendances/${data.id}`, data.attendance);
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
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui data absensi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk menghapus data absensi
  const deleteAttendanceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/hrd/attendances/${id}`);
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
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus data absensi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler untuk submit form
  const onSubmit = (data: z.infer<typeof attendanceFormSchema>) => {
    if (attendanceToEdit) {
      updateAttendanceMutation.mutate({ id: attendanceToEdit.id, attendance: data });
    } else {
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
  const handleEditAttendance = (attendance: Attendance) => {
    setAttendanceToEdit(attendance);
    populateForm(attendance);
    setShowAttendanceModal(true);
  };

  // Mengkonfirmasi penghapusan absensi
  const handleDeleteAttendance = (attendance: Attendance) => {
    setAttendanceToDelete(attendance);
  };

  // Statistik absensi
  const typedAttendances = attendances as Attendance[];
  const presentCount = typedAttendances.filter((a) => a.status === 'present').length;
  const absentCount = typedAttendances.filter((a) => a.status === 'absent').length;
  const lateCount = typedAttendances.filter((a) => a.status === 'late').length;
  
  // Status color mapping
  const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
  };

  const statusIcons: Record<string, JSX.Element> = {
    present: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    absent: <XCircle className="h-5 w-5 text-red-600" />,
    late: <Clock className="h-5 w-5 text-yellow-600" />,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="HRD Management" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Absensi Karyawan" 
            subtitle="Catat dan kelola absensi karyawan harian"
            actions={[
              { 
                label: 'Catat Absensi', 
                icon: 'plus', 
                onClick: handleAddAttendance, 
                primary: true 
              }
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">Filter Tanggal</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => {
                          const today = new Date();
                          setDate(today);
                        }}
                      >
                        Hari Ini
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <Button 
                          className="h-8 flex-1"
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const prevDay = date ? new Date(date.getTime() - 86400000) : new Date(new Date().getTime() - 86400000);
                            setDate(prevDay);
                          }}
                        >
                          <span className="sr-only">Hari Sebelumnya</span>
                          ← Sebelumnya
                        </Button>
                        <Button 
                          className="h-8 flex-1"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const nextDay = date ? new Date(date.getTime() + 86400000) : new Date(new Date().getTime() + 86400000);
                            setDate(nextDay);
                          }}
                        >
                          Selanjutnya →
                          <span className="sr-only">Hari Berikutnya</span>
                        </Button>
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'dd MMMM yyyy', { locale: id }) : 'Pilih tanggal'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                              setDate(date);
                              // Tutup popover setelah pilihan tanggal
                              const closeEvent = new Event('mousedown', { bubbles: true });
                              document.dispatchEvent(closeEvent);
                            }}
                            locale={id}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Jumlah Hari Ini</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
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
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">
                      {date ? format(date, 'EEEE, dd MMM yyyy', { locale: id }) : 'Hari Ini'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4">
                    <p className="text-sm text-muted-foreground">Catat absensi untuk tanggal yang dipilih</p>
                    <Button 
                      className="w-full" 
                      variant="default" 
                      onClick={handleAddAttendance}
                    >
                      Catat Absensi
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-base font-medium">
                    Absensi Tanggal: {date ? format(date, 'dd MMMM yyyy', { locale: id }) : 'Hari Ini'}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Filter Tanggal</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => {
                            if (date) setDate(date);
                            // Tutup popover setelah pilihan tanggal
                            const closeEvent = new Event('mousedown', { bubbles: true });
                            document.dispatchEvent(closeEvent);
                          }}
                          locale={id}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Button size="sm" variant="default" onClick={handleAddAttendance}>
                      <Plus className="h-4 w-4 mr-1" />
                      Catat Absensi
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  {isLoadingAttendances ? (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : typedAttendances.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Belum ada data absensi</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Belum ada data absensi untuk tanggal {date ? format(date, 'dd MMMM yyyy', { locale: id }) : 'yang dipilih'}
                      </p>
                      <Button className="mt-4" onClick={handleAddAttendance}>Catat Absensi</Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Karyawan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Jam Masuk</TableHead>
                            <TableHead>Jam Keluar</TableHead>
                            <TableHead>Catatan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typedAttendances.map((attendance) => {
                            // Cast attendance to AttendanceWithEmployee
                            const attendanceData = attendance as AttendanceWithEmployee;
                            return (
                              <TableRow key={attendance.id}>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <div className="font-medium">{attendanceData.employeeName || `Karyawan ID: ${attendance.employeeId}`}</div>
                                    <div className="text-xs text-muted-foreground">{attendanceData.employeePosition || 'Posisi tidak tersedia'}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="w-5 h-5 mr-2 rounded-full flex items-center justify-center">
                                      {attendance.status === 'present' ? (
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                      ) : attendance.status === 'absent' ? (
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                      )}
                                    </div>
                                    <span>{attendance.status === 'present' ? 'Hadir' : attendance.status === 'absent' ? 'Tidak Hadir' : 'Terlambat'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {attendance.checkIn ? format(new Date(attendance.checkIn), 'HH:mm') : '-'}
                                </TableCell>
                                <TableCell>
                                  {attendance.checkOut ? format(new Date(attendance.checkOut), 'HH:mm') : '-'}
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[120px] truncate">
                                    {attendance.notes || <span className="text-xs text-muted-foreground">-</span>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end">
                                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEditAttendance(attendance)}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Form modal untuk Tambah/Edit Absensi */}
      <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {attendanceToEdit ? 'Edit Data Absensi' : 'Catat Absensi Baru'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Karyawan</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isLoadingEmployees}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih karyawan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(employees as Employee[]).map((employee) => (
                          <SelectItem 
                            key={employee.id} 
                            value={employee.id.toString()}
                          >
                            {employee.name} - {employee.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal</FormLabel>
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
                                format(field.value, "PPP", { locale: id })
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
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={id}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Kehadiran</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status kehadiran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {attendanceStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Masuk</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value ? format(new Date(field.value), 'HH:mm') : '08:00'}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = form.getValues('date') || new Date();
                              const checkInDate = new Date(newDate);
                              checkInDate.setHours(parseInt(hours), parseInt(minutes), 0);
                              field.onChange(checkInDate);
                            } else {
                              field.onChange(set(new Date(), { hours: 8, minutes: 0, seconds: 0 }));
                            }
                          }}
                          disabled={form.watch('status') === 'absent'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Keluar</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value ? format(new Date(field.value), 'HH:mm') : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = form.getValues('date') || new Date();
                              const checkOutDate = new Date(newDate);
                              checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0);
                              field.onChange(checkOutDate);
                            } else {
                              field.onChange(null);
                            }
                          }}
                          disabled={form.watch('status') === 'absent'}
                        />
                      </FormControl>
                      <FormDescription>
                        Kosongkan jika karyawan belum keluar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan (opsional)"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={addAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                >
                  {(addAttendanceMutation.isPending || updateAttendanceMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {attendanceToEdit ? 'Perbarui' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alert dialog untuk konfirmasi hapus absensi */}
      <AlertDialog open={!!attendanceToDelete} onOpenChange={(open) => !open && setAttendanceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Konfirmasi Hapus Data Absensi
            </AlertDialogTitle>
            <AlertDialogDescription>
              {attendanceToDelete && (
                <div className="py-2">
                  Apakah Anda yakin ingin menghapus data absensi untuk karyawan <strong>
                  {(attendanceToDelete as any).employeeName || `ID: ${attendanceToDelete.employeeId}`}
                  </strong> pada tanggal <strong>
                  {attendanceToDelete.date ? format(new Date(attendanceToDelete.date), 'dd MMMM yyyy', { locale: id }) : '-'}
                  </strong>? Tindakan ini tidak dapat dibatalkan.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => attendanceToDelete && deleteAttendanceMutation.mutate(attendanceToDelete.id)}
              disabled={deleteAttendanceMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAttendanceMutation.isPending && (
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