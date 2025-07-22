import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Search, Download, Ban, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Payroll, Employee, PositionSalary, InsertPayroll } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form schema untuk payroll
const payrollFormSchema = z.object({
  employeeId: z.number({
    required_error: "Silakan pilih karyawan",
  }),
  periodStart: z.string({
    required_error: "Tanggal mulai periode diperlukan",
  }),
  periodEnd: z.string({
    required_error: "Tanggal akhir periode diperlukan",
  }),
  paymentType: z.enum(['daily', 'monthly'], {
    required_error: "Silakan pilih tipe penggajian",
  }),
  dailyRate: z.number().optional(),
  monthlySalary: z.number().optional(),
  allowance: z.number().default(35000),
  bonus: z.number().default(0).optional(),
  deduction: z.number().default(0).optional(),
  paymentMethod: z.enum(['cash', 'transfer'], {
    required_error: "Silakan pilih metode pembayaran",
  }),
  notes: z.string().optional(),
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

type PayrollFormValues = z.infer<typeof payrollFormSchema>;

export default function HrdPayroll() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: payrolls, isLoading: isLoadingPayrolls } = useQuery<Payroll[]>({
    queryKey: ['/api/hrd/payrolls'],
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });
  
  // Fetch position salaries
  const { data: positionSalaries, isLoading: isLoadingPositionSalaries } = useQuery<PositionSalary[]>({
    queryKey: ['/api/hrd/position-salaries'],
  });

  // Form
  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollFormSchema),
    defaultValues: {
      bonus: 0,
      deduction: 0,
      allowance: 35000,
      paymentType: 'monthly',
      paymentMethod: 'transfer',
    },
  });

  // Mutations
  const createPayrollMutation = useMutation({
    mutationFn: async (data: PayrollFormValues) => {
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
      const response = await apiRequest('POST', '/api/hrd/payrolls', payload);
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
    onError: (error: Error) => {
      toast({
        title: 'Gagal',
        description: `Gagal menambahkan data penggajian: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePayrollStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/hrd/payrolls/${id}`, { status });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Status penggajian berhasil diperbarui',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hrd/payrolls'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal',
        description: `Gagal memperbarui status penggajian: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deletePayrollMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/hrd/payrolls/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Data penggajian berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hrd/payrolls'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal',
        description: `Gagal menghapus data penggajian: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const onSubmit = (data: PayrollFormValues) => {
    createPayrollMutation.mutate(data);
  };

  const handleApprovePayroll = (id: number) => {
    updatePayrollStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleRejectPayroll = (id: number) => {
    updatePayrollStatusMutation.mutate({ id, status: 'rejected' });
  };

  const handleDeletePayroll = (id: number) => {
    deletePayrollMutation.mutate(id);
  };

  // Filter payrolls based on search term
  const filteredPayrolls = payrolls?.filter(payroll => {
    const employee = employees?.find(e => e.id === payroll.employeeId);
    const status = payroll.status || 'pending';
    const paymentMethod = payroll.paymentMethod || 'transfer';
    const paymentType = payroll.paymentType || 'monthly';
    
    return (
      employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payroll.notes && payroll.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }) || [];

  // Helper function to get employee name
  const getEmployeeName = (id: number) => {
    const employee = employees?.find(e => e.id === id);
    return employee ? employee.name : 'Karyawan tidak ditemukan';
  };

  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Menunggu</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'paid':
        return <Badge variant="default">Dibayar</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="HRD Management" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Manajemen Penggajian" 
            subtitle="Kelola data penggajian karyawan"
            actions={[
              { 
                label: 'Tambah Penggajian', 
                icon: 'plus', 
                onClick: () => setIsAddDialogOpen(true), 
                primary: true 
              }
            ]} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Penggajian</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingPayrolls ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    formatCurrency(
                      payrolls?.reduce((sum, payroll) => sum + payroll.totalAmount, 0) || 0
                    )
                  )}
                </p>
                <p className="text-muted-foreground text-sm">Total seluruh periode</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Gaji Belum Diproses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingPayrolls ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    payrolls?.filter(p => p.status === 'pending').length || 0
                  )}
                </p>
                <p className="text-muted-foreground text-sm">Menunggu persetujuan</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Gaji Disetujui</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingPayrolls ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    payrolls?.filter(p => p.status === 'approved' || p.status === 'paid').length || 0
                  )}
                </p>
                <p className="text-muted-foreground text-sm">Siap untuk dibayarkan</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Daftar Penggajian</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Cari penggajian..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPayrolls ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredPayrolls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data penggajian
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Gaji Pokok</TableHead>
                      <TableHead className="text-right">Tunjangan</TableHead>
                      <TableHead className="text-right">Bonus</TableHead>
                      <TableHead className="text-right">Potongan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.map((payroll) => {
                      // Tampilkan tunjangan langsung dari data (bukan menghitung ulang)
                      const allowance = payroll.allowance || 35000; // Default 35000 jika tidak ada
                      const paymentType = payroll.paymentType || 'monthly';
                      const status = payroll.status || 'pending';
                      
                      return (
                        <TableRow key={payroll.id}>
                          <TableCell className="font-medium">{getEmployeeName(payroll.employeeId)}</TableCell>
                          <TableCell>
                            {format(new Date(payroll.periodStart), 'dd MMM', { locale: id })} - {format(new Date(payroll.periodEnd), 'dd MMM yyyy', { locale: id })}
                          </TableCell>
                          <TableCell>
                            {paymentType === 'monthly' ? 'Bulanan' : 'Harian'}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(payroll.baseSalary)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(allowance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payroll.bonus || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payroll.deduction || 0)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(payroll.totalAmount)}</TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Setujui" 
                                    onClick={() => handleApprovePayroll(payroll.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Tolak"
                                    onClick={() => handleRejectPayroll(payroll.id)}
                                  >
                                    <Ban className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Data Penggajian</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus data penggajian ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePayroll(payroll.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Add Payroll Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Penggajian Baru</DialogTitle>
                <DialogDescription>
                  Buat data penggajian baru untuk karyawan. Sistem akan menghitung total gaji berdasarkan tipe penggajian dan posisi karyawan.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Karyawan</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih karyawan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingEmployees ? (
                              <div className="flex justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              employees?.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.name} - {employee.position}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="periodStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Mulai</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="periodEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Akhir</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe Penggajian</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset dailyRate when switching payment type
                            if (value === 'daily') {
                              const employeeId = form.getValues('employeeId');
                              if (employeeId) {
                                const employee = employees?.find(e => e.id === employeeId);
                                if (employee) {
                                  const positionSalary = positionSalaries?.find(
                                    ps => ps.position === employee.position
                                  );
                                  if (positionSalary) {
                                    form.setValue('dailyRate', positionSalary.dailyRate);
                                  }
                                }
                              }
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe penggajian" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Bulanan</SelectItem>
                            <SelectItem value="daily">Harian</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Gaji bulanan menggunakan nominal tetap, gaji harian berdasarkan kehadiran
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('paymentType') === 'daily' ? (
                    <FormField
                      control={form.control}
                      name="dailyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarif Harian (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Tarif gaji harian yang akan dikalikan dengan jumlah hari kerja
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="monthlySalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gaji Bulanan (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Nilai gaji bulanan tetap (tanpa perhitungan hari kerja)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tunjangan (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value === '' ? 35000 : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            <div className="text-sm">
                              <p className="font-medium">Nilai default tunjangan adalah Rp 35.000, terdiri dari:</p>
                              <ul className="list-disc pl-5 mt-1">
                                <li>Tunjangan Makan: Rp 20.000</li>
                                <li>Tunjangan Transport: Rp 15.000</li>
                              </ul>
                              <p className="mt-1">Tunjangan ini berlaku untuk semua tipe penggajian (bulanan/harian).</p>
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonus (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potongan (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metode Pembayaran</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih metode pembayaran" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Tunai</SelectItem>
                            <SelectItem value="transfer">Transfer Bank</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createPayrollMutation.isPending}
                    >
                      {createPayrollMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}