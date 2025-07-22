"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerForm = CustomerForm;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const queryClient_1 = require("@/lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
// Form schema for validation
const customerSchema = zod_2.z.object({
    name: zod_2.z.string().min(2, 'Nama harus diisi minimal 2 karakter'),
    phone: zod_2.z.string().optional(),
    email: zod_2.z.string().email('Format email tidak valid').optional().or(zod_2.z.literal('')),
    vehicleType: zod_2.z.string().optional(),
    vehicleBrand: zod_2.z.string().optional(),
    vehicleModel: zod_2.z.string().optional(),
    licensePlate: zod_2.z.string().optional(),
});
function CustomerForm({ customerId, onClose }) {
    const { toast } = (0, use_toast_1.useToast)();
    const isEditing = !!customerId;
    // Fetch customer data if editing
    const { data: customer, isLoading: isLoadingCustomer } = (0, react_query_1.useQuery)({
        queryKey: ['/api/customers', customerId],
        queryFn: async () => {
            if (!customerId)
                return null;
            const response = await fetch(`/api/customers/${customerId}`);
            if (!response.ok)
                throw new Error('Failed to fetch customer');
            return response.json();
        },
        enabled: isEditing,
    });
    // Initialize the form
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(customerSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            vehicleType: 'none',
            vehicleBrand: '',
            vehicleModel: '',
            licensePlate: '',
        },
    });
    // Update form values when customer data is loaded
    (0, react_1.useEffect)(() => {
        if (customer) {
            form.reset({
                name: customer.name,
                phone: customer.phone || '',
                email: customer.email || '',
                vehicleType: customer.vehicleType || '',
                vehicleBrand: customer.vehicleBrand || '',
                vehicleModel: customer.vehicleModel || '',
                licensePlate: customer.licensePlate || '',
            });
        }
    }, [customer, form]);
    // Mutation for creating/updating customer
    const createCustomer = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            if (isEditing) {
                const res = await (0, queryClient_1.apiRequest)('PUT', `/api/customers/${customerId}`, data);
                return await res.json();
            }
            else {
                const res = await (0, queryClient_1.apiRequest)('POST', '/api/customers', data);
                return await res.json();
            }
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
            toast({
                title: isEditing ? 'Pelanggan berhasil diperbarui' : 'Pelanggan berhasil ditambahkan',
                description: isEditing ? 'Data pelanggan telah diperbarui' : 'Data pelanggan baru telah disimpan',
            });
            onClose();
        },
        onError: (error) => {
            toast({
                title: isEditing ? 'Gagal memperbarui pelanggan' : 'Gagal menambahkan pelanggan',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Handle form submission
    const onSubmit = (data) => {
        if (createCustomer.isPending)
            return;
        createCustomer.mutate(data);
    };
    if (isEditing && isLoadingCustomer) {
        return (<div className="flex justify-center items-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    return (<div>
      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <form_1.FormField control={form.control} name="name" render={({ field }) => (<form_1.FormItem>
                <form_1.FormLabel>Nama</form_1.FormLabel>
                <form_1.FormControl>
                  <input_1.Input placeholder="Masukkan nama pelanggan" {...field}/>
                </form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form_1.FormField control={form.control} name="phone" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Nomor Telepon</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="Masukkan nomor telepon" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
            
            <form_1.FormField control={form.control} name="email" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Email</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input type="email" placeholder="Masukkan alamat email" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
          </div>

          <form_1.FormField control={form.control} name="vehicleType" render={({ field }) => (<form_1.FormItem>
                <form_1.FormLabel>Jenis Kendaraan</form_1.FormLabel>
                <select_1.Select value={field.value} onValueChange={field.onChange}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Pilih jenis kendaraan"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="none">- Tidak Ada -</select_1.SelectItem>
                    <select_1.SelectItem value="car">Mobil</select_1.SelectItem>
                    <select_1.SelectItem value="motorcycle">Motor</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          {form.watch('vehicleType') && form.watch('vehicleType') !== 'none' && (<>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="vehicleBrand" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Merek Kendaraan</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder={`Contoh: ${form.watch('vehicleType') === 'car' ? 'Toyota, Honda' : 'Yamaha, Honda'}`} {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
                
                <form_1.FormField control={form.control} name="vehicleModel" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Model Kendaraan</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder={`Contoh: ${form.watch('vehicleType') === 'car' ? 'Avanza, Civic' : 'Vario, Beat'}`} {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </div>

              <form_1.FormField control={form.control} name="licensePlate" render={({ field }) => (<form_1.FormItem>
                    <form_1.FormLabel>Plat Nomor</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Contoh: B 1234 ABC" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
            </>)}

          <div className="flex justify-end space-x-2 pt-4">
            <button_1.Button variant="outline" type="button" onClick={onClose}>
              Batal
            </button_1.Button>
            <button_1.Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
              {isEditing ? 'Perbarui' : 'Simpan'}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>);
}
