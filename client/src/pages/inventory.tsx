import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { 
  Loader2, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Plus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });

  // Filter inventory items
  const filteredItems = inventoryItems?.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = inventoryItems 
    ? [...new Set(inventoryItems.map((item: any) => item.category))]
    : [];

  // Calculate stock status percentage
  const calculateStockPercentage = (current: number, minimum: number) => {
    if (current <= 0) return 0;
    if (minimum <= 0) return 100;
    
    const target = minimum * 2; // Target is double the minimum stock
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  // Determine stock status
  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) return { label: 'Habis', color: 'text-red-600 bg-red-100' };
    if (current <= minimum * 0.5) return { label: 'Kritis', color: 'text-red-600 bg-red-100' };
    if (current <= minimum) return { label: 'Rendah', color: 'text-amber-600 bg-amber-100' };
    return { label: 'Baik', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Inventaris" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Inventaris" 
            subtitle="Kelola stok perlengkapan cuci kendaraan" 
            actions={[
              { 
                label: 'Tambah Item', 
                icon: 'plus-circle', 
                onClick: () => {}, 
                primary: true 
              }
            ]} 
          />
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Cari item inventaris"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button>
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
                        <TableHead>Nama Item</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                            Tidak ada item inventaris yang ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems?.map((item: any) => {
                          const status = getStockStatus(item.currentStock, item.minimumStock);
                          const stockPercentage = calculateStockPercentage(item.currentStock, item.minimumStock);
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.description || '-'}</div>
                              </TableCell>
                              <TableCell>
                                {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    {item.currentStock} {item.unit} 
                                    <span className="text-gray-500 text-xs"> / Min: {item.minimumStock}</span>
                                  </div>
                                  <Progress value={stockPercentage} 
                                    className={`h-2 ${
                                      stockPercentage < 30 
                                        ? 'bg-red-200' 
                                        : stockPercentage < 70 
                                          ? 'bg-amber-200' 
                                          : 'bg-green-200'
                                    }`} 
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                              </TableCell>
                              <TableCell>{formatCurrency(item.price)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Low stock warning */}
              {filteredItems?.some((item: any) => item.currentStock <= item.minimumStock) && (
                <div className="mt-6 p-4 border border-amber-300 bg-amber-50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Peringatan Stok Rendah</h4>
                    <p className="text-sm text-amber-600 mt-1">
                      Beberapa item memiliki stok di bawah batas minimum. Harap segera lakukan pembelian untuk mencegah kehabisan stok.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
