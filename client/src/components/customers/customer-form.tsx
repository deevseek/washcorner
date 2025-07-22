import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Form schema for validation
const customerSchema = z.object({
  name: z.string().min(2, 'Nama harus diisi minimal 2 karakter'),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  vehicleType: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  licensePlate: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customerId?: number | null;
  onClose: () => void;
}

export function CustomerForm({ customerId, onClose }: CustomerFormProps) {
  const { toast } = useToast();
  const isEditing = !!customerId;
  
  // Fetch customer data if editing
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['/api/customers', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      return response.json();
    },
    enabled: isEditing,
  });
  
  // Initialize the form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
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
  useEffect(() => {
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
  const createCustomer = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      if (isEditing) {
        const res = await apiRequest('PUT', `/api/customers/${customerId}`, data);
        return await res.json();
      } else {
        const res = await apiRequest('POST', '/api/customers', data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: isEditing ? 'Pelanggan berhasil diperbarui' : 'Pelanggan berhasil ditambahkan',
        description: isEditing ? 'Data pelanggan telah diperbarui' : 'Data pelanggan baru telah disimpan',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: isEditing ? 'Gagal memperbarui pelanggan' : 'Gagal menambahkan pelanggan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: CustomerFormValues) => {
    if (createCustomer.isPending) return;
    createCustomer.mutate(data);
  };

  if (isEditing && isLoadingCustomer) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama pelanggan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor telepon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Masukkan alamat email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kendaraan</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kendaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">- Tidak Ada -</SelectItem>
                    <SelectItem value="car">Mobil</SelectItem>
                    <SelectItem value="motorcycle">Motor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('vehicleType') && form.watch('vehicleType') !== 'none' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merek Kendaraan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`Contoh: ${form.watch('vehicleType') === 'car' ? 'Toyota, Honda' : 'Yamaha, Honda'}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Kendaraan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`Contoh: ${form.watch('vehicleType') === 'car' ? 'Avanza, Civic' : 'Vario, Beat'}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plat Nomor</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: B 1234 ABC" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={createCustomer.isPending}
            >
              {createCustomer.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
