import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PenSquare, Trash2, Car, Bike } from "lucide-react";
import { Service } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

// Validation schema for service form
const serviceSchema = z.object({
  name: z.string().min(3, "Nama layanan minimal 3 karakter"),
  vehicleType: z.string().min(1, "Jenis kendaraan harus dipilih"),
  price: z.coerce.number().min(1, "Harga harus lebih dari 0"),
  duration: z.coerce.number().min(1, "Durasi harus lebih dari 0 menit"),
  description: z.string().optional(),
  warranty: z.coerce.number().min(0, "Garansi tidak boleh negatif"),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function Services() {
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Gagal memuat data layanan");
      const data = await res.json();

      // Transformasi jika datanya masih pakai snake_case
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        duration: item.duration,
        vehicleType: item.vehicle_type,
        isPopular: item.is_popular,
        isActive: item.is_active,
        imageUrl: item.image_url,
        warranty: item.warranty,
      }));
    },
  });

  // Filter services based on vehicle type
  const filteredServices =
    activeTab === "all"
      ? services
      : services.filter((service) => service.vehicleType === activeTab);

  // Service form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      vehicleType: "car",
      price: 50000,
      duration: 30,
      description: "",
      warranty: 0,
      isPopular: false,
      isActive: true,
      imageUrl: "",
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      const res = await apiRequest("POST", "/api/services", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Layanan berhasil ditambahkan",
        description: "Paket layanan baru telah ditambahkan",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan layanan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: ServiceFormValues) {
    createServiceMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <TopNav title="Paket Layanan" />

        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Paket Layanan"
            subtitle="Kelola paket layanan cuci kendaraan"
            actions={[
              {
                label: "Tambah Layanan",
                icon: "plus-circle",
                onClick: () => setIsDialogOpen(true),
                primary: true,
              },
            ]}
          />

          {/* Add Service Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent
              className="sm:max-w-[500px]"
              aria-describedby="service-dialog-description"
            >
              <DialogHeader>
                <DialogTitle>Tambah Paket Layanan Baru</DialogTitle>
                <DialogDescription id="service-dialog-description">
                  Tambahkan paket layanan cuci kendaraan baru ke katalog Anda.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Layanan</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cuci Mobil Standar"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kendaraan</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis kendaraan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="car">Mobil</SelectItem>
                              <SelectItem value="motorcycle">Motor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga (Rp)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durasi (menit)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Deskripsi lengkap tentang layanan ini"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="warranty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garansi (hari)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Gambar</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://contoh.com/gambar.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isPopular"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Paling Laris</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Aktif</FormLabel>
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

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createServiceMutation.isPending}
                    >
                      {createServiceMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Card className="mt-6">
            <CardContent className="p-6">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList>
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="car">Mobil</TabsTrigger>
                  <TabsTrigger value="motorcycle">Motor</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices?.map((service) => (
                    <div
                      key={service.id}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-36 bg-gray-100 relative">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            {service.vehicleType === "car" ? (
                              <Car className="w-12 h-12 text-gray-400" />
                            ) : (
                              <Bike className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                        )}

                        {service.isPopular && (
                          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                            Paling Laris
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <span className="text-primary font-bold">
                            {formatCurrency(service.price)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">
                          {service.description || "Tidak ada deskripsi"}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded">
                            {service.duration} menit
                          </span>

                          {service.warranty > 0 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Garansi {service.warranty} hari
                            </span>
                          )}

                          <span
                            className={`${
                              service.vehicleType === "car"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                            } text-xs px-2 py-1 rounded`}
                          >
                            {service.vehicleType === "car" ? "Mobil" : "Motor"}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <PenSquare className="w-4 h-4 mr-2" />
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
