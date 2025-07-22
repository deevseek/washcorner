import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SprayCan, Droplets, Paintbrush } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  category: string;
}

interface LowInventoryProps {
  data?: InventoryItem[];
}

export function LowInventory({ data = [] }: LowInventoryProps) {
  // Only display items with stock below or at minimum
  const lowStockItems = data.filter(item => item.currentStock <= item.minimumStock);
  
  // Map categories to icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleaning':
        return <SprayCan className="text-danger" />;
      case 'detailing':
        return <Paintbrush className="text-warning" />;
      default:
        return <Droplets className="text-primary" />;
    }
  };
  
  // Determine status color and label
  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: 'Habis', className: 'bg-red-100 text-danger' };
    if (current <= minimum * 0.5) return { label: 'Kritis', className: 'bg-red-100 text-danger' };
    return { label: 'Rendah', className: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-semibold">Stok Rendah</CardTitle>
        <Link href="/inventory?filter=low" className="text-primary text-sm hover:underline">
          Lihat Semua
        </Link>
      </CardHeader>
      
      <CardContent className="p-4">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Semua stok dalam jumlah yang cukup
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.slice(0, 3).map((item) => {
              const status = getStockStatus(item.currentStock, item.minimumStock);
              
              return (
                <div key={item.id} className="flex items-center justify-between">
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
                </div>
              );
            })}
          </div>
        )}
        
        <Link href="/inventory/add">
          <Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-white">
            Tambah Stok
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
