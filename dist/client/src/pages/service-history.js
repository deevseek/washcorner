"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceHistory;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const input_1 = require("@/components/ui/input");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const select_1 = require("@/components/ui/select");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const popover_1 = require("@/components/ui/popover");
const calendar_1 = require("@/components/ui/calendar");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
function ServiceHistory() {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [vehicleType, setVehicleType] = (0, react_1.useState)('all');
    const [date, setDate] = (0, react_1.useState)(undefined);
    const { data: transactions, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/transactions'],
    });
    // Filter transactions based on search, vehicle type and date
    const filteredTransactions = transactions?.filter((transaction) => {
        const matchesSearch = (transaction.customer?.name && transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction.customer?.licensePlate && transaction.customer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesVehicleType = vehicleType === 'all' ||
            (transaction.customer?.vehicleType && transaction.customer.vehicleType === vehicleType);
        let matchesDate = true;
        if (date) {
            const transactionDate = new Date(transaction.date);
            matchesDate = (transactionDate.getDate() === date.getDate() &&
                transactionDate.getMonth() === date.getMonth() &&
                transactionDate.getFullYear() === date.getFullYear());
        }
        return matchesSearch && matchesVehicleType && matchesDate;
    });
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Riwayat Layanan"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Riwayat Layanan" subtitle="Lihat riwayat layanan cuci kendaraan" actions={[
            {
                label: 'Cetak Laporan',
                icon: 'printer',
                onClick: () => { },
                primary: false
            }
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                  <input_1.Input placeholder="Cari berdasarkan nama pelanggan atau plat nomor" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                </div>
                
                <select_1.Select value={vehicleType} onValueChange={setVehicleType}>
                  <select_1.SelectTrigger className="w-[180px]">
                    <select_1.SelectValue placeholder="Jenis Kendaraan"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">Semua Kendaraan</select_1.SelectItem>
                    <select_1.SelectItem value="car">Mobil</select_1.SelectItem>
                    <select_1.SelectItem value="motorcycle">Motor</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
                
                <popover_1.Popover>
                  <popover_1.PopoverTrigger asChild>
                    <button_1.Button variant="outline" className="w-[220px] justify-start text-left font-normal">
                      <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
                      {date ? (0, date_fns_1.format)(date, 'PPP', { locale: locale_1.id }) : <span>Pilih tanggal</span>}
                    </button_1.Button>
                  </popover_1.PopoverTrigger>
                  <popover_1.PopoverContent className="w-auto p-0">
                    <calendar_1.Calendar mode="single" selected={date} onSelect={setDate} initialFocus/>
                    {date && (<div className="p-3 border-t border-border">
                        <button_1.Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                          Reset
                        </button_1.Button>
                      </div>)}
                  </popover_1.PopoverContent>
                </popover_1.Popover>
              </div>
              
              {isLoading ? (<div className="flex justify-center py-10">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<div className="overflow-x-auto">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Tanggal</table_1.TableHead>
                        <table_1.TableHead>Pelanggan</table_1.TableHead>
                        <table_1.TableHead>Layanan</table_1.TableHead>
                        <table_1.TableHead>Kendaraan</table_1.TableHead>
                        <table_1.TableHead>Total</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {filteredTransactions?.length === 0 ? (<table_1.TableRow>
                          <table_1.TableCell colSpan={7} className="text-center py-10 text-gray-500">
                            Tidak ada riwayat layanan yang ditemukan
                          </table_1.TableCell>
                        </table_1.TableRow>) : (filteredTransactions?.map((transaction) => (<table_1.TableRow key={transaction.id}>
                            <table_1.TableCell>
                              {new Date(transaction.date).toLocaleDateString('id-ID')}
                              <div className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-medium">
                                  {(0, utils_1.getInitials)(transaction.customer?.name || 'Unknown')}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{transaction.customer?.name}</p>
                                </div>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              <div className="max-w-[200px] truncate">
                                {transaction.items?.map((item) => (<div key={item.id}>{item.serviceName}</div>)) || 'N/A'}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {transaction.customer?.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                              <div className="text-xs text-gray-500">
                                {transaction.customer?.licensePlate || 'N/A'}
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>{(0, utils_1.formatCurrency)(transaction.total)}</table_1.TableCell>
                            <table_1.TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(0, utils_1.statusColor)(transaction.status).bg} ${(0, utils_1.statusColor)(transaction.status).text}`}>
                                {(0, utils_1.statusLabel)(transaction.status)}
                              </span>
                            </table_1.TableCell>
                            <table_1.TableCell className="text-right">
                              <dropdown_menu_1.DropdownMenu>
                                <dropdown_menu_1.DropdownMenuTrigger asChild>
                                  <button_1.Button variant="ghost" size="icon">
                                    <lucide_react_1.ChevronDown className="h-4 w-4"/>
                                  </button_1.Button>
                                </dropdown_menu_1.DropdownMenuTrigger>
                                <dropdown_menu_1.DropdownMenuContent align="end">
                                  <dropdown_menu_1.DropdownMenuItem>
                                    <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                                    <span>Lihat Detail</span>
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
