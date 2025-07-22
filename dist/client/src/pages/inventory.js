"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Inventory;
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
const progress_1 = require("@/components/ui/progress");
function Inventory() {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [categoryFilter, setCategoryFilter] = (0, react_1.useState)('all');
    const { data: inventoryItems, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/inventory'],
    });
    // Filter inventory items
    const filteredItems = inventoryItems?.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    // Get unique categories for filter
    const categories = inventoryItems
        ? [...new Set(inventoryItems.map((item) => item.category))]
        : [];
    // Calculate stock status percentage
    const calculateStockPercentage = (current, minimum) => {
        if (current <= 0)
            return 0;
        if (minimum <= 0)
            return 100;
        const target = minimum * 2; // Target is double the minimum stock
        const percentage = (current / target) * 100;
        return Math.min(percentage, 100);
    };
    // Determine stock status
    const getStockStatus = (current, minimum) => {
        if (current <= 0)
            return { label: 'Habis', color: 'text-red-600 bg-red-100' };
        if (current <= minimum * 0.5)
            return { label: 'Kritis', color: 'text-red-600 bg-red-100' };
        if (current <= minimum)
            return { label: 'Rendah', color: 'text-amber-600 bg-amber-100' };
        return { label: 'Baik', color: 'text-green-600 bg-green-100' };
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Inventaris"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Inventaris" subtitle="Kelola stok perlengkapan cuci kendaraan" actions={[
            {
                label: 'Tambah Item',
                icon: 'plus-circle',
                onClick: () => { },
                primary: true
            }
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                  <input_1.Input placeholder="Cari item inventaris" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                </div>
                <select_1.Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <select_1.SelectTrigger className="w-[180px]">
                    <select_1.SelectValue placeholder="Kategori"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">Semua Kategori</select_1.SelectItem>
                    {categories.map((category) => (<select_1.SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
                <button_1.Button>
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
                        <table_1.TableHead>Nama Item</table_1.TableHead>
                        <table_1.TableHead>Kategori</table_1.TableHead>
                        <table_1.TableHead>Stok</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead>Harga</table_1.TableHead>
                        <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {filteredItems?.length === 0 ? (<table_1.TableRow>
                          <table_1.TableCell colSpan={6} className="text-center py-10 text-gray-500">
                            Tidak ada item inventaris yang ditemukan
                          </table_1.TableCell>
                        </table_1.TableRow>) : (filteredItems?.map((item) => {
                const status = getStockStatus(item.currentStock, item.minimumStock);
                const stockPercentage = calculateStockPercentage(item.currentStock, item.minimumStock);
                return (<table_1.TableRow key={item.id}>
                              <table_1.TableCell>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.description || '-'}</div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '-'}
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    {item.currentStock} {item.unit} 
                                    <span className="text-gray-500 text-xs"> / Min: {item.minimumStock}</span>
                                  </div>
                                  <progress_1.Progress value={stockPercentage} className={`h-2 ${stockPercentage < 30
                        ? 'bg-red-200'
                        : stockPercentage < 70
                            ? 'bg-amber-200'
                            : 'bg-green-200'}`}/>
                                </div>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                              </table_1.TableCell>
                              <table_1.TableCell>{(0, utils_1.formatCurrency)(item.price)}</table_1.TableCell>
                              <table_1.TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <button_1.Button variant="ghost" size="icon">
                                    <lucide_react_1.Edit className="h-4 w-4"/>
                                  </button_1.Button>
                                  <button_1.Button variant="ghost" size="icon" className="text-red-500">
                                    <lucide_react_1.Trash2 className="h-4 w-4"/>
                                  </button_1.Button>
                                </div>
                              </table_1.TableCell>
                            </table_1.TableRow>);
            }))}
                    </table_1.TableBody>
                  </table_1.Table>
                </div>)}
              
              {/* Low stock warning */}
              {filteredItems?.some((item) => item.currentStock <= item.minimumStock) && (<div className="mt-6 p-4 border border-amber-300 bg-amber-50 rounded-lg flex items-start space-x-3">
                  <lucide_react_1.AlertCircle className="text-amber-500 h-5 w-5 mt-0.5"/>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Peringatan Stok Rendah</h4>
                    <p className="text-sm text-amber-600 mt-1">
                      Beberapa item memiliki stok di bawah batas minimum. Harap segera lakukan pembelian untuk mencegah kehabisan stok.
                    </p>
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
