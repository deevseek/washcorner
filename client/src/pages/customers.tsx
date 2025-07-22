import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/customer-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import {
  Loader2,
  Search,
  CarFront,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer } from "@shared/schema";

export default function Customers() {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Gagal memuat data pelanggan");
      const data = await res.json();

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        vehicleType: item.vehicleType,
        vehicleBrand: item.vehicleBrand,
        vehicleModel: item.vehicleModel,
        licensePlate: item.licensePlate,
        createdAt: item.createdAt,
      }));
    },
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer: any) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.licensePlate &&
        customer.licensePlate
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))
  );

  // Handle customer edit
  const handleEditCustomer = (id: number) => {
    setEditingCustomer(id);
    setShowCustomerForm(true);
  };

  // Reset form state when dialog closes
  const handleCloseForm = () => {
    setEditingCustomer(null);
    setShowCustomerForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <TopNav title="Pelanggan" />

        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Pelanggan"
            subtitle="Kelola data pelanggan Anda"
            actions={[
              {
                label: "Pelanggan Baru",
                icon: "user-plus",
                onClick: () => setShowCustomerForm(true),
                primary: true,
              },
            ]}
          />

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Cari berdasarkan nama, plat nomor, atau telepon"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setShowCustomerForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Kendaraan</TableHead>
                        <TableHead>Tanggal Daftar</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers?.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-gray-500"
                          >
                            Tidak ada pelanggan yang ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers?.map((customer: any) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-primary">
                                  {getInitials(customer.name)}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {customer.name}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    ID: {customer.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p>{customer.phone || "-"}</p>
                              <p className="text-gray-500 text-xs">
                                {customer.email || "-"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CarFront className="w-4 h-4 mr-2 text-gray-500" />
                                <div>
                                  <p>
                                    {customer.vehicleType === "car"
                                      ? "Mobil"
                                      : customer.vehicleType === "motorcycle"
                                      ? "Motor"
                                      : "-"}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {customer.licensePlate
                                      ? customer.licensePlate
                                      : "-"}
                                    {customer.vehicleBrand &&
                                    customer.vehicleModel
                                      ? ` | ${customer.vehicleBrand} ${customer.vehicleModel}`
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(customer.createdAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditCustomer(customer.id)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Form Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={handleCloseForm}>
        <DialogContent
          className="max-w-md"
          aria-describedby="customer-form-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
            </DialogTitle>
            <DialogDescription id="customer-form-description">
              {editingCustomer
                ? "Edit data pelanggan yang sudah ada"
                : "Tambahkan data pelanggan baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customerId={editingCustomer}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
