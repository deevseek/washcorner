"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Customers;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const customer_form_1 = require("@/components/customers/customer-form");
const table_1 = require("@/components/ui/table");
const dialog_1 = require("@/components/ui/dialog");
const input_1 = require("@/components/ui/input");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function Customers() {
    const [showCustomerForm, setShowCustomerForm] = (0, react_1.useState)(false);
    const [editingCustomer, setEditingCustomer] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const { data: customers = [], isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/customers'],
    });
    // Filter customers based on search term
    const filteredCustomers = customers.filter((customer) => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.licensePlate && customer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchTerm)));
    // Handle customer edit
    const handleEditCustomer = (id) => {
        setEditingCustomer(id);
        setShowCustomerForm(true);
    };
    // Reset form state when dialog closes
    const handleCloseForm = () => {
        setEditingCustomer(null);
        setShowCustomerForm(false);
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Pelanggan"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Pelanggan" subtitle="Kelola data pelanggan Anda" actions={[
            {
                label: 'Pelanggan Baru',
                icon: 'user-plus',
                onClick: () => setShowCustomerForm(true),
                primary: true
            }
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                  <input_1.Input placeholder="Cari berdasarkan nama, plat nomor, atau telepon" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                </div>
                <button_1.Button onClick={() => setShowCustomerForm(true)}>
                  <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                  Tambah
                </button_1.Button>
              </div>
              
              {isLoading ? (<div className="flex justify-center py-10">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<div className="overflow-x-auto">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Pelanggan</table_1.TableHead>
                        <table_1.TableHead>Kontak</table_1.TableHead>
                        <table_1.TableHead>Kendaraan</table_1.TableHead>
                        <table_1.TableHead>Tanggal Daftar</table_1.TableHead>
                        <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {filteredCustomers?.length === 0 ? (<table_1.TableRow>
                          <table_1.TableCell colSpan={5} className="text-center py-10 text-gray-500">
                            Tidak ada pelanggan yang ditemukan
                          </table_1.TableCell>
                        </table_1.TableRow>) : (filteredCustomers?.map((customer) => (<table_1.TableRow key={customer.id}>
                            <table_1.TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-primary">
                                  {(0, utils_1.getInitials)(customer.name)}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{customer.name}</p>
                                  <p className="text-gray-500 text-xs">ID: {customer.id}</p>
                                </div>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <p>{customer.phone || '-'}</p>
                              <p className="text-gray-500 text-xs">{customer.email || '-'}</p>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center">
                                <lucide_react_1.CarFront className="w-4 h-4 mr-2 text-gray-500"/>
                                <div>
                                  <p>{customer.vehicleType === 'car' ? 'Mobil' : customer.vehicleType === 'motorcycle' ? 'Motor' : '-'}</p>
                                  <p className="text-gray-500 text-xs">
                                    {customer.licensePlate ? customer.licensePlate : '-'}
                                    {customer.vehicleBrand && customer.vehicleModel
                    ? ` | ${customer.vehicleBrand} ${customer.vehicleModel}`
                    : ''}
                                  </p>
                                </div>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                            </table_1.TableCell>
                            <table_1.TableCell className="text-right">
                              <dropdown_menu_1.DropdownMenu>
                                <dropdown_menu_1.DropdownMenuTrigger asChild>
                                  <button_1.Button variant="ghost" size="icon">
                                    <span className="sr-only">Open menu</span>
                                    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                                  </button_1.Button>
                                </dropdown_menu_1.DropdownMenuTrigger>
                                <dropdown_menu_1.DropdownMenuContent align="end">
                                  <dropdown_menu_1.DropdownMenuItem onClick={() => handleEditCustomer(customer.id)}>
                                    <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                                    <span>Edit</span>
                                  </dropdown_menu_1.DropdownMenuItem>
                                  <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                                    <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                                    <span>Hapus</span>
                                  </dropdown_menu_1.DropdownMenuItem>
                                </dropdown_menu_1.DropdownMenuContent>
                              </dropdown_menu_1.DropdownMenu>
                            </table_1.TableCell>
                          </table_1.TableRow>)))}
                    </table_1.TableBody>
                  </table_1.Table>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
      
      {/* Customer Form Dialog */}
      <dialog_1.Dialog open={showCustomerForm} onOpenChange={handleCloseForm}>
        <dialog_1.DialogContent className="max-w-md" aria-describedby="customer-form-description">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</dialog_1.DialogTitle>
            <dialog_1.DialogDescription id="customer-form-description">
              {editingCustomer ? 'Edit data pelanggan yang sudah ada' : 'Tambahkan data pelanggan baru ke sistem'}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <customer_form_1.CustomerForm customerId={editingCustomer} onClose={handleCloseForm}/>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
