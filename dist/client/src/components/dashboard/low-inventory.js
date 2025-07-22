"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowInventory = LowInventory;
const wouter_1 = require("wouter");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function LowInventory({ data = [] }) {
    // Only display items with stock below or at minimum
    const lowStockItems = data.filter(item => item.currentStock <= item.minimumStock);
    // Map categories to icons
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'cleaning':
                return <lucide_react_1.SprayCan className="text-danger"/>;
            case 'detailing':
                return <lucide_react_1.Paintbrush className="text-warning"/>;
            default:
                return <lucide_react_1.Droplets className="text-primary"/>;
        }
    };
    // Determine status color and label
    const getStockStatus = (current, minimum) => {
        if (current === 0)
            return { label: 'Habis', className: 'bg-red-100 text-danger' };
        if (current <= minimum * 0.5)
            return { label: 'Kritis', className: 'bg-red-100 text-danger' };
        return { label: 'Rendah', className: 'bg-yellow-100 text-yellow-800' };
    };
    return (<card_1.Card>
      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row justify-between items-center">
        <card_1.CardTitle className="text-base font-semibold">Stok Rendah</card_1.CardTitle>
        <wouter_1.Link href="/inventory?filter=low" className="text-primary text-sm hover:underline">
          Lihat Semua
        </wouter_1.Link>
      </card_1.CardHeader>
      
      <card_1.CardContent className="p-4">
        {lowStockItems.length === 0 ? (<div className="text-center py-4 text-gray-500">
            Semua stok dalam jumlah yang cukup
          </div>) : (<div className="space-y-4">
            {lowStockItems.slice(0, 3).map((item) => {
                const status = getStockStatus(item.currentStock, item.minimumStock);
                return (<div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-secondary">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Tersisa {item.currentStock} {item.unit}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>);
            })}
          </div>)}
        
        <wouter_1.Link href="/inventory/add">
          <button_1.Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-white">
            Tambah Stok
          </button_1.Button>
        </wouter_1.Link>
      </card_1.CardContent>
    </card_1.Card>);
}
