"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionForm = TransactionForm;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const queryClient_1 = require("@/lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
const utils_1 = require("@/lib/utils");
const form_1 = require("@/components/ui/form");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const select_1 = require("@/components/ui/select");
const tabs_1 = require("@/components/ui/tabs");
const textarea_1 = require("@/components/ui/textarea");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
// Skema item transaksi
const transactionItemSchema = zod_2.z.object({
    serviceId: zod_2.z.number(),
    price: zod_2.z.number().min(0),
    quantity: zod_2.z.number().int().min(1, 'Jumlah harus minimal 1'),
    discount: zod_2.z.number().default(0),
});
// Form schema untuk validasi
const transactionSchema = zod_2.z.object({
    customerId: zod_2.z.number(),
    employeeId: zod_2.z.number().optional(),
    total: zod_2.z.number().min(0),
    paymentMethod: zod_2.z.string().default('cash'),
    status: zod_2.z.string().default('pending'),
    notes: zod_2.z.string().optional(),
    date: zod_2.z.date().optional().default(() => new Date()),
    items: zod_2.z.array(transactionItemSchema).min(1, 'Pilih minimal 1 layanan'),
});
function TransactionForm({ onClose, editId }) {
    const [activeTab, setActiveTab] = (0, react_1.useState)('car');
    const [selectedCustomer, setSelectedCustomer] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    // Fetch customers
    const { data: customers = [], isLoading: isLoadingCustomers } = (0, react_query_1.useQuery)({
        queryKey: ['/api/customers'],
    });
    // Fetch services berdasarkan jenis kendaraan
    const { data: services = [], isLoading: isLoadingServices } = (0, react_query_1.useQuery)({
        queryKey: ['/api/services', activeTab],
        queryFn: async () => {
            const response = await fetch(`/api/services?vehicleType=${activeTab}`);
            if (!response.ok)
                throw new Error('Failed to fetch services');
            return response.json();
        },
    });
    // Inisialisasi form
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(transactionSchema),
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
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: 'items',
    });
    // Get direct ref to queryClient
    const queryClient = (0, react_query_1.useQueryClient)();
    // Mutation untuk membuat transaksi baru
    const createTransaction = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
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
                const res = await (0, queryClient_1.apiRequest)('POST', '/api/transactions', {
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
            }
            catch (err) {
                console.error('Error creating transaction:', err);
                throw err;
            }
        },
        onSuccess: (data) => {
            console.log('Transaction created successfully:', data);
            // Update transaction list tanpa reload
            queryClient.setQueryData(['/api/transactions'], (oldData) => {
                if (!oldData)
                    return [data.transaction];
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
        onError: (error) => {
            console.error('Error in transaction creation:', error);
            toast({
                title: 'Gagal membuat transaksi',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Hitung total setiap kali item berubah
    (0, react_1.useEffect)(() => {
        const values = form.getValues();
        // Hitung subtotal (harga * kuantitas) untuk semua item
        const subtotal = values.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Hitung total diskon untuk semua item
        const totalDiscount = values.items.reduce((sum, item) => sum + (item.discount || 0), 0);
        // Total = subtotal - diskon (minimal 0)
        const finalTotal = Math.max(0, subtotal - totalDiscount);
        console.log('Perhitungan total:', { subtotal, totalDiscount, finalTotal });
        form.setValue('total', finalTotal);
    }, [form.watch('items')]);
    // Handle pemilihan layanan 
    const handleServiceSelect = (serviceId, index) => {
        // ID 0 berarti tidak ada layanan yang dipilih
        if (serviceId === 0)
            return;
        const selectedService = services?.find((s) => s.id === serviceId);
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
        const subtotal = values.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Hitung total diskon untuk semua item
        const totalDiscount = values.items.reduce((sum, item) => sum + (item.discount || 0), 0);
        // Total = subtotal - diskon (minimal 0)
        const finalTotal = Math.max(0, subtotal - totalDiscount);
        form.setValue('total', finalTotal);
    };
    // Handle pemilihan pelanggan
    const handleCustomerSelect = (customerId) => {
        const customer = customers?.find((c) => c.id === customerId);
        setSelectedCustomer(customer);
        form.setValue('customerId', customerId);
        // Jika pelanggan memiliki jenis kendaraan, sesuaikan tab
        if (customer?.vehicleType) {
            setActiveTab(customer.vehicleType);
        }
    };
    // Handle submit form
    const onSubmit = (data) => {
        if (createTransaction.isPending)
            return;
        createTransaction.mutate(data);
    };
    return (<div className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-secondary">Transaksi Baru</h2>
        <div className="text-sm text-gray-500">
          No: <span className="font-medium">{(0, utils_1.generateInvoiceNumber)()}</span>
        </div>
      </div>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <card_1.Card>
            <card_1.CardHeader className="px-4 py-3 border-b border-neutral-200">
              <card_1.CardTitle className="text-base font-medium">Informasi Pelanggan</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="p-4">
              <form_1.FormField control={form.control} name="customerId" render={({ field }) => (<form_1.FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-2">
                      <select_1.Select value={field.value ? field.value.toString() : "0"} onValueChange={(value) => handleCustomerSelect(parseInt(value, 10))}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Pilih pelanggan"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {isLoadingCustomers ? (<div className="flex items-center justify-center p-2">
                              <lucide_react_1.Loader2 className="h-4 w-4 animate-spin text-primary mr-2"/>
                              <span>Memuat...</span>
                            </div>) : (customers?.map((customer) => (<select_1.SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                                {customer.licensePlate ? ` - ${customer.licensePlate}` : ''}
                              </select_1.SelectItem>)))}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <button_1.Button variant="outline" type="button" onClick={() => {
                toast({
                    title: "Informasi",
                    description: "Silakan tambah pelanggan baru di menu Pelanggan terlebih dahulu",
                });
            }}>
                        <lucide_react_1.UserPlus className="h-4 w-4 mr-2"/>
                        <span>Pelanggan Baru</span>
                      </button_1.Button>
                    </div>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>

              {selectedCustomer && (<div className="mt-4 bg-muted/50 p-3 rounded-md">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <lucide_react_1.User className="h-5 w-5 text-primary"/>
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedCustomer.name}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedCustomer.phone && (<div>Telepon: {selectedCustomer.phone}</div>)}
                        {selectedCustomer.vehicleType && (<div className="flex items-center mt-1">
                            {selectedCustomer.vehicleType === 'car' ? (<lucide_react_1.Car className="h-4 w-4 mr-1"/>) : (<lucide_react_1.Bike className="h-4 w-4 mr-1"/>)}
                            <span>
                              {selectedCustomer.vehicleBrand} {selectedCustomer.vehicleModel}
                              {selectedCustomer.licensePlate ? ` (${selectedCustomer.licensePlate})` : ''}
                            </span>
                          </div>)}
                      </div>
                    </div>
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>

          {/* Service Selection */}
          <card_1.Card>
            <card_1.CardHeader className="px-4 py-3 border-b border-neutral-200">
              <card_1.CardTitle className="text-base font-medium">Pilih Layanan</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="p-4">
              <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <tabs_1.TabsList className="grid w-full grid-cols-2">
                  <tabs_1.TabsTrigger value="car">Mobil</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="motorcycle">Motor</tabs_1.TabsTrigger>
                </tabs_1.TabsList>
              </tabs_1.Tabs>

              {fields.map((field, index) => (<div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Layanan #{index + 1}</h4>
                    {index > 0 && (<button_1.Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 h-8 px-2">
                        <lucide_react_1.Trash2 className="h-4 w-4"/>
                      </button_1.Button>)}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <form_1.FormField control={form.control} name={`items.${index}.serviceId`} render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Paket Layanan</form_1.FormLabel>
                          <select_1.Select value={field.value ? field.value.toString() : "0"} onValueChange={(value) => handleServiceSelect(parseInt(value, 10), index)}>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Pilih paket layanan"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              {isLoadingServices ? (<div className="flex items-center justify-center p-2">
                                  <lucide_react_1.Loader2 className="h-4 w-4 animate-spin text-primary mr-2"/>
                                  <span>Memuat...</span>
                                </div>) : services?.length === 0 ? (<div className="p-2 text-center text-gray-500">
                                  Tidak ada layanan untuk jenis kendaraan ini
                                </div>) : (services?.map((service) => (<select_1.SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} - {(0, utils_1.formatCurrency)(service.price)}
                                  </select_1.SelectItem>)))}
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>

                    <div className="grid grid-cols-2 gap-4">
                      <form_1.FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel>Jumlah</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="number" min="1" {...field} onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(isNaN(value) ? 1 : value);
                    // Hitung ulang total setelah perubahan
                    setTimeout(calculateTotal, 0);
                }}/>
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>)}/>

                      <form_1.FormField control={form.control} name={`items.${index}.discount`} render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel>Diskon</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="number" min="0" {...field} onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                    // Hitung ulang total setelah perubahan
                    setTimeout(calculateTotal, 0);
                }}/>
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>)}/>
                    </div>

                    <form_1.FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Harga</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input readOnly value={(0, utils_1.formatCurrency)(field.value)} onChange={(e) => { }} // Dummy onChange karena readOnly
            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                </div>))}

              <button_1.Button type="button" variant="outline" onClick={() => {
            append({ serviceId: 0, price: 0, quantity: 1, discount: 0 });
        }} className="w-full mt-2">
                <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                Tambah Layanan
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Payment and Notes */}
          <card_1.Card>
            <card_1.CardHeader className="px-4 py-3 border-b border-neutral-200">
              <card_1.CardTitle className="text-base font-medium">Pembayaran</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <form_1.FormField control={form.control} name="paymentMethod" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Metode Pembayaran</form_1.FormLabel>
                      <select_1.Select value={field.value} onValueChange={field.onChange}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Pilih metode pembayaran"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="cash">Tunai</select_1.SelectItem>
                          <select_1.SelectItem value="debit">Kartu Debit</select_1.SelectItem>
                          <select_1.SelectItem value="credit">Kartu Kredit</select_1.SelectItem>
                          <select_1.SelectItem value="transfer">Transfer Bank</select_1.SelectItem>
                          <select_1.SelectItem value="ewallet">E-Wallet</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>

                <form_1.FormField control={form.control} name="status" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Status</form_1.FormLabel>
                      <select_1.Select value={field.value} onValueChange={field.onChange}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Pilih status"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="pending">Menunggu</select_1.SelectItem>
                          <select_1.SelectItem value="in_progress">Dalam Proses</select_1.SelectItem>
                          <select_1.SelectItem value="completed">Selesai</select_1.SelectItem>
                          <select_1.SelectItem value="cancelled">Dibatalkan</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </div>

              <form_1.FormField control={form.control} name="notes" render={({ field }) => (<form_1.FormItem>
                    <form_1.FormLabel>Catatan</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea placeholder="Tambahkan catatan jika diperlukan" className="resize-none" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
            </card_1.CardContent>
          </card_1.Card>

          {/* Summary */}
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {(0, utils_1.formatCurrency)(form.watch('items').reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Diskon</span>
                  <span>
                    {(0, utils_1.formatCurrency)(form.watch('items').reduce((sum, item) => sum + (item.discount || 0), 0))}
                  </span>
                </div>
                <separator_1.Separator className="my-2"/>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {(0, utils_1.formatCurrency)(form.watch('total'))}
                  </span>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <div className="flex justify-end space-x-2">
            <button_1.Button variant="outline" type="button" onClick={onClose}>
              Batal
            </button_1.Button>
            <button_1.Button type="submit" disabled={createTransaction.isPending || !form.formState.isValid}>
              {createTransaction.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
              Simpan Transaksi
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>);
}
