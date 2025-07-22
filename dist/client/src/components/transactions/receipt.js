"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = Receipt;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
function Receipt({ transactionId, autoPrint = false }) {
    const receiptRef = (0, react_1.useRef)(null);
    const { data: transaction, isLoading } = (0, react_query_1.useQuery)({
        queryKey: [`/api/transactions/${transactionId}`],
    });
    // Simplified print function
    const handlePrint = () => {
        console.log('Printing receipt...');
        window.print();
    };
    // Auto print setelah komponen di-render dan data selesai dimuat
    (0, react_1.useEffect)(() => {
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
        return (<div className="flex flex-col items-center justify-center py-10">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary mb-4"/>
        <p className="text-gray-500">Memuat data transaksi...</p>
      </div>);
    }
    if (!transaction) {
        return (<div className="flex flex-col items-center justify-center py-10">
        <p className="text-gray-500">Transaksi tidak ditemukan</p>
      </div>);
    }
    // Menggunakan type cast untuk mengatasi error TypeScript
    const transactionData = transaction;
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
    return (<div className="max-w-lg mx-auto receipt-container">
      <div className="mb-4 flex justify-between items-center no-print">
        <h2 className="text-xl font-semibold">Nota Transaksi</h2>
        <button_1.Button variant="outline" onClick={handlePrint} className="receipt-print-button">
          <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
          Cetak Nota
        </button_1.Button>
      </div>
      
      <div ref={receiptRef} className="bg-white p-6 shadow-sm border rounded-lg printable">
        {/* Receipt Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <lucide_react_1.Droplets className="text-white text-xl"/>
              </div>
            </div>
            <h1 className="text-xl font-bold">Wash Corner</h1>
            <p className="text-sm text-gray-500">
              Jasa Cuci Mobil dan Motor Premium
            </p>
          </div>
        </div>
        
        <separator_1.Separator className="my-4"/>
        
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
            <span>{statusLabel[transactionData.status] || transactionData.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Metode Pembayaran:</span>
            <span>{paymentMethodLabel[transactionData.paymentMethod] || transactionData.paymentMethod}</span>
          </div>
        </div>
        
        <separator_1.Separator className="my-4"/>
        
        {/* Customer Info */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Informasi Pelanggan</h3>
          <div className="text-sm">
            <p><span className="text-gray-500">Nama:</span> {transactionData.customer?.name || '-'}</p>
            {transactionData.customer?.phone && (<p><span className="text-gray-500">Telepon:</span> {transactionData.customer.phone}</p>)}
            {transactionData.customer?.licensePlate && (<p><span className="text-gray-500">Kendaraan:</span> {transactionData.customer.vehicleBrand} {transactionData.customer.vehicleModel} ({transactionData.customer.licensePlate})</p>)}
          </div>
        </div>
        
        <separator_1.Separator className="my-4"/>
        
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
              {transactionData.items?.map((item) => (<tr key={item.id} className="border-b border-dashed">
                  <td className="py-2">{item.serviceName}</td>
                  <td className="text-right py-2">{(0, utils_1.formatCurrency)(item.price)}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{(0, utils_1.formatCurrency)(item.discount)}</td>
                  <td className="text-right py-2">{(0, utils_1.formatCurrency)(item.price * item.quantity - item.discount)}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span>
              {(0, utils_1.formatCurrency)(transactionData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Diskon:</span>
            <span>
              {(0, utils_1.formatCurrency)(transactionData.items?.reduce((sum, item) => sum + item.discount, 0) || 0)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>{(0, utils_1.formatCurrency)(transactionData.total)}</span>
          </div>
        </div>
        
        {transactionData.notes && (<>
            <separator_1.Separator className="my-4"/>
            <div className="mb-4">
              <h3 className="font-medium mb-1">Catatan:</h3>
              <p className="text-sm">{transactionData.notes}</p>
            </div>
          </>)}
        
        <separator_1.Separator className="my-4"/>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Terima kasih atas kunjungan Anda</p>
          <p className="mt-1">Silahkan datang kembali!</p>
        </div>
      </div>
    </div>);
}
