"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Employees;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const badge_1 = require("@/components/ui/badge");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function Employees() {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const { data: employees, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/employees'],
    });
    // Filter employees based on search term
    const filteredEmployees = employees?.filter((employee) => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.phone && employee.phone.includes(searchTerm)));
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Karyawan"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Karyawan" subtitle="Kelola data karyawan yang bekerja di Wash Corner" actions={[
            {
                label: 'Tambah Karyawan',
                icon: 'user-plus',
                onClick: () => { },
                primary: true
            }
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                  <input_1.Input placeholder="Cari berdasarkan nama, posisi, atau telepon" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                </div>
                <button_1.Button>
                  Tambah Karyawan
                </button_1.Button>
              </div>
              
              {isLoading ? (<div className="flex justify-center py-10">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<div className="overflow-x-auto">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Karyawan</table_1.TableHead>
                        <table_1.TableHead>Posisi</table_1.TableHead>
                        <table_1.TableHead>Kontak</table_1.TableHead>
                        <table_1.TableHead>Tanggal Bergabung</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {filteredEmployees?.length === 0 ? (<table_1.TableRow>
                          <table_1.TableCell colSpan={6} className="text-center py-10 text-gray-500">
                            Tidak ada karyawan yang ditemukan
                          </table_1.TableCell>
                        </table_1.TableRow>) : (filteredEmployees?.map((employee) => (<table_1.TableRow key={employee.id}>
                            <table_1.TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-primary">
                                  {(0, utils_1.getInitials)(employee.name)}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{employee.name}</p>
                                  <p className="text-gray-500 text-xs">ID: {employee.id}</p>
                                </div>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {employee.position}
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <p>{employee.phone || '-'}</p>
                              <p className="text-gray-500 text-xs">{employee.email || '-'}</p>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {new Date(employee.joiningDate).toLocaleDateString('id-ID')}
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {employee.isActive ? (<badge_1.Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Aktif
                                </badge_1.Badge>) : (<badge_1.Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  Tidak Aktif
                                </badge_1.Badge>)}
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
                                  <dropdown_menu_1.DropdownMenuItem>
                                    <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                                    <span>Edit</span>
                                  </dropdown_menu_1.DropdownMenuItem>
                                  {employee.isActive ? (<dropdown_menu_1.DropdownMenuItem>
                                      <lucide_react_1.UserX className="mr-2 h-4 w-4"/>
                                      <span>Nonaktifkan</span>
                                    </dropdown_menu_1.DropdownMenuItem>) : (<dropdown_menu_1.DropdownMenuItem>
                                      <lucide_react_1.UserCheck className="mr-2 h-4 w-4"/>
                                      <span>Aktifkan</span>
                                    </dropdown_menu_1.DropdownMenuItem>)}
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
    </div>);
}
