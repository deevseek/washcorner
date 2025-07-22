import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getInitials, statusColor, statusLabel } from '@/lib/utils';

interface Transaction {
  id: number;
  customer: {
    id: number;
    name: string;
    licensePlate?: string;
    vehicleType?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
  };
  items: Array<{
    id: number;
    serviceId: number;
    serviceName?: string;
  }>;
  total: number;
  status: string;
  date: string;
}

interface RecentTransactionsProps {
  data?: Transaction[];
}

export function RecentTransactions({ data = [] }: RecentTransactionsProps) {
  const transactions = data.slice(0, 4); // Show only 4 most recent transactions

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
        <Link href="/transactions" className="text-primary text-sm hover:underline">
          Lihat Semua
        </Link>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-xs font-medium text-gray-500 uppercase w-[70px]">No</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase">Pelanggan</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase">Layanan</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase">Total</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-200">
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <span className="font-medium">#{transaction.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-medium">
                          {getInitials(transaction.customer?.name || 'Unknown')}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{transaction.customer?.name}</p>
                          <p className="text-gray-500 text-xs">
                            {transaction.customer?.vehicleBrand || ''} {transaction.customer?.vehicleModel || ''}
                            {transaction.customer?.licensePlate 
                              ? ` (${transaction.customer.licensePlate})` 
                              : ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.items?.map((item, index) => (
                        <span key={item.id}>
                          {item.serviceName}
                          {index < transaction.items.length - 1 ? ', ' : ''}
                        </span>
                      )) || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.total)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(transaction.status).bg} ${statusColor(transaction.status).text}`}>
                        {statusLabel(transaction.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                        >
                          <Link href={`/transactions?id=${transaction.id}`} className="flex items-center justify-center">
                            <Eye className="h-4 w-4 text-primary" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Menampilkan {transactions.length} dari {data.length || 0} transaksi
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" disabled={transactions.length === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={transactions.length === data.length}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
