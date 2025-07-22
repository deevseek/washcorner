import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, generateInvoiceNumber } from '@/lib/utils';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Car, 
  Bike, 
  User, 
  UserPlus 
} from 'lucide-react';

// Skema item transaksi
const transactionItemSchema = z.object({
  serviceId: z.number(),
  price: z.number().min(0),
  quantity: z.number().int().min(1, 'Jumlah harus minimal 1'),
  discount: z.number().default(0),
});

// Form schema untuk validasi
const transactionSchema = z.object({
  customerId: z.number(),
  employeeId: z.number().optional(),
  total: z.number().min(0),
  paymentMethod: z.string().default('cash'),
  status: z.string().default('pending'),
  notes: z.string().optional(),
  date: z.date().optional().default(() => new Date()),
  items: z.array(transactionItemSchema).min(1, 'Pilih minimal 1 layanan'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onClose: () => void;
  editId?: number;
}

export function TransactionForm({ onClose, editId }: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<string>('car');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();

  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch services berdasarkan jenis kendaraan
  const { data: services = [], isLoading: isLoadingServices } = useQuery<any[]>({
    queryKey: ['/api/services', activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/services?vehicleType=${activeTab}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });
  
  // Inisialisasi form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customerId: 0,
      total: 0,
      paymentMethod: 'cash',
      status: 'pending',
      notes: '',
      date: new Date(),
      items: [
        { serviceId: 0, price: 0, quantity: 1, discount: 0 }
      ],
    },
    mode: "onChange", // Validasi saat perubahan untuk UX yang lebih baik
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  // Get direct ref to queryClient
  const queryClient = useQueryClient();
  
  // Mutation untuk membuat transaksi baru
  const createTransaction = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      try {
        // Validasi data sebelum dikirim ke server
        if (!data.customerId || data.customerId === 0) {
          throw new Error('Silakan pilih pelanggan terlebih dahulu');
        }
        
        // Pastikan setiap item memiliki serviceId yang valid
        const invalidItems = data.items.filter(item => !item.serviceId || item.serviceId === 0);
        if (invalidItems.length > 0) {
          throw new Error('Silakan pilih layanan untuk semua item');
        }
        
        // Pastikan data memiliki setidaknya satu item
        if (!data.items || data.items.length === 0) {
          throw new Error('Transaksi harus memiliki minimal satu item layanan');
        }
        
        // Siapkan data transaksi yang akan dikirim ke server dalam format yang benar
        const transaction = {
          customerId: data.customerId,
          employeeId: null, // buat null untuk menghindari error validasi
          total: Number(data.total) || 0,
          paymentMethod: data.paymentMethod || 'cash',
          status: data.status || 'pending',
          notes: data.notes || ''
        };
        
        // Siapkan item transaksi dengan hanya field yang diperlukan
        const items = data.items.map(item => ({
          serviceId: Number(item.serviceId),
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          discount: Number(item.discount) || 0
        }));
        
        console.log('Mengirim data transaksi:', { transaction, items });
        
        // Gunakan format payload yang sederhana dan sesuai harapan server
        const res = await apiRequest('POST', '/api/transactions', { 
          transaction,
          items 
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Gagal membuat transaksi');
        }
        
        const responseData = await res.json();
        console.log('Response:', responseData);
        return responseData;
      } catch (err) {
        console.error('Error creating transaction:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('Transaction created successfully:', data);
      
      // Update transaction list tanpa reload
      queryClient.setQueryData(['/api/transactions'], (oldData: any) => {
        if (!oldData) return [data.transaction];
        
        console.log('Old transactions data:', oldData);
        const newData = [...oldData, data.transaction];
        console.log('New transactions data:', newData);
        return newData;
      });
      
      // Invalidate queries untuk memastikan data tersinkronisasi
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: 'Transaksi berhasil dibuat',
        description: 'Data transaksi telah disimpan',
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error('Error in transaction creation:', error);
      toast({
        title: 'Gagal membuat transaksi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Hitung total setiap kali item berubah
  useEffect(() => {
    const values = form.getValues();
    
    // Hitung subtotal (harga * kuantitas) untuk semua item
    const subtotal = values.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    // Hitung total diskon untuk semua item
    const totalDiscount = values.items.reduce((sum, item) => 
      sum + (item.discount || 0), 0);
    
    // Total = subtotal - diskon (minimal 0)
    const finalTotal = Math.max(0, subtotal - totalDiscount);
    
    console.log('Perhitungan total:', { subtotal, totalDiscount, finalTotal });
    form.setValue('total', finalTotal);
  }, [form.watch('items')]);
  
  // Handle pemilihan layanan 
  const handleServiceSelect = (serviceId: number, index: number) => {
    // ID 0 berarti tidak ada layanan yang dipilih
    if (serviceId === 0) return;
    
    const selectedService = services?.find((s: any) => s.id === serviceId);
    if (selectedService) {
      form.setValue(`items.${index}.price`, selectedService.price);
      form.setValue(`items.${index}.serviceId`, serviceId);
      
      // Recalculate total setelah update item
      calculateTotal();
    }
  };

  // Fungsi untuk menghitung total
  const calculateTotal = () => {
    const values = form.getValues();
    
    // Hitung subtotal (harga * kuantitas) untuk semua item
    const subtotal = values.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    // Hitung total diskon untuk semua item
    const totalDiscount = values.items.reduce((sum, item) => 
      sum + (item.discount || 0), 0);
    
    // Total = subtotal - diskon (minimal 0)
    const finalTotal = Math.max(0, subtotal - totalDiscount);
    
    form.setValue('total', finalTotal);
  };

  // Handle pemilihan pelanggan
  const handleCustomerSelect = (customerId: number) => {
    const customer = customers?.find((c: any) => c.id === customerId);
    setSelectedCustomer(customer);
    form.setValue('customerId', customerId);
    
    // Jika pelanggan memiliki jenis kendaraan, sesuaikan tab
    if (customer?.vehicleType) {
      setActiveTab(customer.vehicleType);
    }
  };

  // Handle submit form
  const onSubmit = (data: TransactionFormValues) => {
    if (createTransaction.isPending) return;
    createTransaction.mutate(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-secondary">Transaksi Baru</h2>
        <div className="text-sm text-gray-500">
          No: <span className="font-medium">{generateInvoiceNumber()}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader className="px-4 py-3 border-b border-neutral-200">
              <CardTitle className="text-base font-medium">Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-2">
                      <Select
                        value={field.value ? field.value.toString() : "0"}
                        onValueChange={(value) => handleCustomerSelect(parseInt(value, 10))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pelanggan" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCustomers ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                              <span>Memuat...</span>
                            </div>
                          ) : (
                            customers?.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                                {customer.licensePlate ? ` - ${customer.licensePlate}` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => {
                          toast({
                            title: "Informasi",
                            description: "Silakan tambah pelanggan baru di menu Pelanggan terlebih dahulu",
                          });
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span>Pelanggan Baru</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCustomer && (
                <div className="mt-4 bg-muted/50 p-3 rounded-md">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedCustomer.name}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedCustomer.phone && (
                          <div>Telepon: {selectedCustomer.phone}</div>
                        )}
                        {selectedCustomer.vehicleType && (
                          <div className="flex items-center mt-1">
                            {selectedCustomer.vehicleType === 'car' ? (
                              <Car className="h-4 w-4 mr-1" />
                            ) : (
                              <Bike className="h-4 w-4 mr-1" />
                            )}
                            <span>
                              {selectedCustomer.vehicleBrand} {selectedCustomer.vehicleModel}
                              {selectedCustomer.licensePlate ? ` (${selectedCustomer.licensePlate})` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card>
            <CardHeader className="px-4 py-3 border-b border-neutral-200">
              <CardTitle className="text-base font-medium">Pilih Layanan</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="car">Mobil</TabsTrigger>
                  <TabsTrigger value="motorcycle">Motor</TabsTrigger>
                </TabsList>
              </Tabs>

              {fields.map((field, index) => (
                <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Layanan #{index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 h-8 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.serviceId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paket Layanan</FormLabel>
                          <Select
                            value={field.value ? field.value.toString() : "0"}
                            onValueChange={(value) => 
                              handleServiceSelect(parseInt(value, 10), index)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih paket layanan" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingServices ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                                  <span>Memuat...</span>
                                </div>
                              ) : services?.length === 0 ? (
                                <div className="p-2 text-center text-gray-500">
                                  Tidak ada layanan untuk jenis kendaraan ini
                                </div>
                              ) : (
                                services?.map((service: any) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} - {formatCurrency(service.price)}
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
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jumlah</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(isNaN(value) ? 1 : value);
                                  // Hitung ulang total setelah perubahan
                                  setTimeout(calculateTotal, 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diskon</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(isNaN(value) ? 0 : value);
                                  // Hitung ulang total setelah perubahan
                                  setTimeout(calculateTotal, 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga</FormLabel>
                          <FormControl>
                            <Input 
                              readOnly
                              value={formatCurrency(field.value)} 
                              onChange={(e) => {}} // Dummy onChange karena readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  append({ serviceId: 0, price: 0, quantity: 1, discount: 0 });
                }}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Layanan
              </Button>
            </CardContent>
          </Card>

          {/* Payment and Notes */}
          <Card>
            <CardHeader className="px-4 py-3 border-b border-neutral-200">
              <CardTitle className="text-base font-medium">Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pembayaran</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Tunai</SelectItem>
                          <SelectItem value="debit">Kartu Debit</SelectItem>
                          <SelectItem value="credit">Kartu Kredit</SelectItem>
                          <SelectItem value="transfer">Transfer Bank</SelectItem>
                          <SelectItem value="ewallet">E-Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="in_progress">Dalam Proses</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="cancelled">Dibatalkan</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder="Tambahkan catatan jika diperlukan"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {formatCurrency(form.watch('items').reduce(
                      (sum, item) => sum + (item.price * item.quantity), 0
                    ))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Diskon</span>
                  <span>
                    {formatCurrency(form.watch('items').reduce(
                      (sum, item) => sum + (item.discount || 0), 0
                    ))}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(form.watch('total'))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={createTransaction.isPending || !form.formState.isValid}
            >
              {createTransaction.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
