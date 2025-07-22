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
import { formatCurrency, getInitials, statusColor, statusLabel } from '@/lib/utils';
import { Loader2, Search, Calendar, ChevronDown, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ServiceHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleType, setVehicleType] = useState('all');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Filter transactions based on search, vehicle type and date
  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = 
      (transaction.customer?.name && transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.customer?.licensePlate && transaction.customer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVehicleType = vehicleType === 'all' || 
      (transaction.customer?.vehicleType && transaction.customer.vehicleType === vehicleType);
    
    let matchesDate = true;
    if (date) {
      const transactionDate = new Date(transaction.date);
      matchesDate = (
        transactionDate.getDate() === date.getDate() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    }
    
    return matchesSearch && matchesVehicleType && matchesDate;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Riwayat Layanan" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Riwayat Layanan" 
            subtitle="Lihat riwayat layanan cuci kendaraan" 
            actions={[
              { 
                label: 'Cetak Laporan', 
                icon: 'printer', 
                onClick: () => {}, 
                primary: false 
              }
            ]} 
          />
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Cari berdasarkan nama pelanggan atau plat nomor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  value={vehicleType}
                  onValueChange={setVehicleType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Jenis Kendaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kendaraan</SelectItem>
                    <SelectItem value="car">Mobil</SelectItem>
                    <SelectItem value="motorcycle">Motor</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[220px] justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                    {date && (
                      <div className="p-3 border-t border-border">
                        <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                          Reset
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
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
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Kendaraan</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                            Tidak ada riwayat layanan yang ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions?.map((transaction: any) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString('id-ID')}
                              <div className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleTimeString('id-ID', { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-medium">
                                  {getInitials(transaction.customer?.name || 'Unknown')}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{transaction.customer?.name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {transaction.items?.map((item: any) => (
                                  <div key={item.id}>{item.serviceName}</div>
                                )) || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {transaction.customer?.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                              <div className="text-xs text-gray-500">
                                {transaction.customer?.licensePlate || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(transaction.total)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(transaction.status).bg} ${statusColor(transaction.status).text}`}>
                                {statusLabel(transaction.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Lihat Detail</span>
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
    </div>
  );
}
