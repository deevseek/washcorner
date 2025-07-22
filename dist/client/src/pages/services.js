"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Services;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const queryClient_1 = require("@/lib/queryClient");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const tabs_1 = require("@/components/ui/tabs");
const dialog_1 = require("@/components/ui/dialog");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const switch_1 = require("@/components/ui/switch");
const select_1 = require("@/components/ui/select");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const react_hook_form_1 = require("react-hook-form");
const use_toast_1 = require("@/hooks/use-toast");
// Validation schema for service form
const serviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Nama layanan minimal 3 karakter"),
    vehicleType: zod_1.z.string().min(1, "Jenis kendaraan harus dipilih"),
    price: zod_1.z.coerce.number().min(1, "Harga harus lebih dari 0"),
    duration: zod_1.z.coerce.number().min(1, "Durasi harus lebih dari 0 menit"),
    description: zod_1.z.string().optional(),
    warranty: zod_1.z.coerce.number().min(0, "Garansi tidak boleh negatif"),
    isPopular: zod_1.z.boolean().default(false),
    isActive: zod_1.z.boolean().default(true),
    imageUrl: zod_1.z.string().optional(),
});
function Services() {
    const [activeTab, setActiveTab] = (0, react_1.useState)('all');
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const { data: services = [], isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/services'],
    });
    // Filter services based on vehicle type
    const filteredServices = activeTab === 'all'
        ? services
        : services.filter((service) => service.vehicleType === activeTab);
    // Service form
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(serviceSchema),
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
    const createServiceMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await (0, queryClient_1.apiRequest)("POST", "/api/services", data);
            return await res.json();
        },
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/services'] });
            toast({
                title: "Layanan berhasil ditambahkan",
                description: "Paket layanan baru telah ditambahkan",
            });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error) => {
            toast({
                title: "Gagal menambahkan layanan",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    // Handle form submission
    function onSubmit(data) {
        createServiceMutation.mutate(data);
    }
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Paket Layanan"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Paket Layanan" subtitle="Kelola paket layanan cuci kendaraan" actions={[
            {
                label: 'Tambah Layanan',
                icon: 'plus-circle',
                onClick: () => setIsDialogOpen(true),
                primary: true
            }
        ]}/>
          
          {/* Add Service Dialog */}
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogContent className="sm:max-w-[500px]" aria-describedby="service-dialog-description">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Tambah Paket Layanan Baru</dialog_1.DialogTitle>
                <dialog_1.DialogDescription id="service-dialog-description">
                  Tambahkan paket layanan cuci kendaraan baru ke katalog Anda.
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <form_1.Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="name" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Nama Layanan</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Cuci Mobil Standar" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="vehicleType" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Jenis Kendaraan</form_1.FormLabel>
                          <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Pilih jenis kendaraan"/>
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="car">Mobil</select_1.SelectItem>
                              <select_1.SelectItem value="motorcycle">Motor</select_1.SelectItem>
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="price" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Harga (Rp)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" placeholder="50000" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="duration" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Durasi (menit)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" placeholder="30" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <form_1.FormField control={form.control} name="description" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Deskripsi</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea placeholder="Deskripsi lengkap tentang layanan ini" className="resize-none" {...field}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="warranty" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Garansi (hari)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="number" placeholder="0" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="imageUrl" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>URL Gambar</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="https://contoh.com/gambar.jpg" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="isPopular" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <form_1.FormLabel>Paling Laris</form_1.FormLabel>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="isActive" render={({ field }) => (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <form_1.FormLabel>Aktif</form_1.FormLabel>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>)}/>
                  </div>
                  
                  <dialog_1.DialogFooter>
                    <button_1.Button type="submit" disabled={createServiceMutation.isPending}>
                      {createServiceMutation.isPending && (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                      Simpan
                    </button_1.Button>
                  </dialog_1.DialogFooter>
                </form>
              </form_1.Form>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
          
          <card_1.Card className="mt-6">
            <card_1.CardContent className="p-6">
              <tabs_1.Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <tabs_1.TabsList>
                  <tabs_1.TabsTrigger value="all">Semua</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="car">Mobil</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="motorcycle">Motor</tabs_1.TabsTrigger>
                </tabs_1.TabsList>
              </tabs_1.Tabs>
              
              {isLoading ? (<div className="flex justify-center py-10">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices?.map((service) => (<div key={service.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-36 bg-gray-100 relative">
                        {service.imageUrl ? (<img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center bg-gray-100">
                            {service.vehicleType === 'car' ? (<lucide_react_1.Car className="w-12 h-12 text-gray-400"/>) : (<lucide_react_1.Bike className="w-12 h-12 text-gray-400"/>)}
                          </div>)}
                        
                        {service.isPopular && (<div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                            Paling Laris
                          </div>)}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <span className="text-primary font-bold">{(0, utils_1.formatCurrency)(service.price)}</span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3">
                          {service.description || 'Tidak ada deskripsi'}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded">
                            {service.duration} menit
                          </span>
                          
                          {service.warranty > 0 && (<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Garansi {service.warranty} hari
                            </span>)}
                          
                          <span className={`${service.vehicleType === 'car' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'} text-xs px-2 py-1 rounded`}>
                            {service.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button_1.Button variant="outline" size="sm" className="flex-1">
                            <lucide_react_1.PenSquare className="w-4 h-4 mr-2"/>
                            Edit
                          </button_1.Button>
                          
                          <button_1.Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50">
                            <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/>
                            Hapus
                          </button_1.Button>
                        </div>
                      </div>
                    </div>))}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
