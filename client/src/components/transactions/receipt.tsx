import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Printer, Droplets } from 'lucide-react';

// Definisikan type untuk transaksi
interface TransactionItem {
  id: number;
  transactionId: number;
  serviceId: number;
  quantity: number;
  price: number;
  discount: number;
  serviceName?: string;
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  licensePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType: string;
}

interface Transaction {
  id: number;
  customerId: number;
  date: string;
  total: number;
  status: string;
  paymentMethod: string;
  items?: TransactionItem[];
  customer?: Customer;
  notes?: string;
}

interface ReceiptProps {
  transactionId: number;
}

export function Receipt({ transactionId, autoPrint = false }: ReceiptProps & { autoPrint?: boolean }) {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const { data: transaction, isLoading } = useQuery<Transaction>({
    queryKey: [`/api/transactions/${transactionId}`],
  });

  // Simplified print function
  const handlePrint = () => {
    console.log('Printing receipt...');
    window.print();
  };
  
  // Auto print setelah komponen di-render dan data selesai dimuat
  useEffect(() => {
    // Hanya lakukan auto-print jika prop autoPrint = true dan data transaksi telah dimuat
    if (autoPrint && transaction && !isLoading) {
      // Beri jeda untuk memastikan DOM sudah sepenuhnya dirender
      console.log('Mulai timer cetak otomatis...');
      const timer = setTimeout(() => {
        console.log('Menjalankan fungsi cetak...');
        window.print();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [autoPrint, transaction, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Memuat data transaksi...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-gray-500">Transaksi tidak ditemukan</p>
      </div>
    );
  }
  
  // Menggunakan type cast untuk mengatasi error TypeScript
  const transactionData = transaction as Transaction;

  const statusLabel = {
    pending: 'Menunggu',
    in_progress: 'Dalam Proses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  const paymentMethodLabel = {
    cash: 'Tunai',
    debit: 'Kartu Debit',
    credit: 'Kartu Kredit',
    transfer: 'Transfer Bank',
    ewallet: 'E-Wallet',
  };

  return (
    <div className="max-w-lg mx-auto receipt-container">
      <div className="mb-4 flex justify-between items-center no-print">
        <h2 className="text-xl font-semibold">Nota Transaksi</h2>
        <Button variant="outline" onClick={handlePrint} className="receipt-print-button">
          <Printer className="mr-2 h-4 w-4" />
          Cetak Nota
        </Button>
      </div>
      
      <div ref={receiptRef} className="bg-white p-6 shadow-sm border rounded-lg printable">
        {/* Receipt Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Droplets className="text-white text-xl" />
              </div>
            </div>
            <h1 className="text-xl font-bold">Wash Corner</h1>
            <p className="text-sm text-gray-500">
              Jasa Cuci Mobil dan Motor Premium
            </p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Transaction Info */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">No. Transaksi:</span>
            <span className="font-medium">#{transactionData.id}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Tanggal:</span>
            <span>{new Date(transactionData.date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Status:</span>
            <span>{statusLabel[transactionData.status as keyof typeof statusLabel] || transactionData.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Metode Pembayaran:</span>
            <span>{paymentMethodLabel[transactionData.paymentMethod as keyof typeof paymentMethodLabel] || transactionData.paymentMethod}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Customer Info */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Informasi Pelanggan</h3>
          <div className="text-sm">
            <p><span className="text-gray-500">Nama:</span> {transactionData.customer?.name || '-'}</p>
            {transactionData.customer?.phone && (
              <p><span className="text-gray-500">Telepon:</span> {transactionData.customer.phone}</p>
            )}
            {transactionData.customer?.licensePlate && (
              <p><span className="text-gray-500">Kendaraan:</span> {transactionData.customer.vehicleBrand} {transactionData.customer.vehicleModel} ({transactionData.customer.licensePlate})</p>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Service Items */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Detail Layanan</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Layanan</th>
                <th className="text-right py-2">Harga</th>
                <th className="text-right py-2">Jml</th>
                <th className="text-right py-2">Diskon</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.items?.map((item: TransactionItem) => (
                <tr key={item.id} className="border-b border-dashed">
                  <td className="py-2">{item.serviceName}</td>
                  <td className="text-right py-2">{formatCurrency(item.price)}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.discount)}</td>
                  <td className="text-right py-2">{formatCurrency(item.price * item.quantity - item.discount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span>
              {formatCurrency(transactionData.items?.reduce(
                (sum: number, item: TransactionItem) => sum + (item.price * item.quantity), 0
              ) || 0)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Diskon:</span>
            <span>
              {formatCurrency(transactionData.items?.reduce(
                (sum: number, item: TransactionItem) => sum + item.discount, 0
              ) || 0)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>{formatCurrency(transactionData.total)}</span>
          </div>
        </div>
        
        {transactionData.notes && (
          <>
            <Separator className="my-4" />
            <div className="mb-4">
              <h3 className="font-medium mb-1">Catatan:</h3>
              <p className="text-sm">{transactionData.notes}</p>
            </div>
          </>
        )}
        
        <Separator className="my-4" />
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Terima kasih atas kunjungan Anda</p>
          <p className="mt-1">Silahkan datang kembali!</p>
        </div>
      </div>
    </div>
  );
}
