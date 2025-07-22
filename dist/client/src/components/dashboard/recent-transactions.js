"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecentTransactions = RecentTransactions;
const wouter_1 = require("wouter");
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function RecentTransactions({ data = [] }) {
    const transactions = data.slice(0, 4); // Show only 4 most recent transactions
    return (<card_1.Card>
      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row justify-between items-center">
        <card_1.CardTitle className="text-base font-semibold">Transaksi Terbaru</card_1.CardTitle>
        <wouter_1.Link href="/transactions" className="text-primary text-sm hover:underline">
          Lihat Semua
        </wouter_1.Link>
      </card_1.CardHeader>
      
      <card_1.CardContent className="p-0">
        <div className="overflow-x-auto">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow className="bg-neutral-50">
                <table_1.TableHead className="text-xs font-medium text-gray-500 uppercase w-[70px]">No</table_1.TableHead>
                <table_1.TableHead className="text-xs font-medium text-gray-500 uppercase">Pelanggan</table_1.TableHead>
                <table_1.TableHead className="text-xs font-medium text-gray-500 uppercase">Layanan</table_1.TableHead>
                <table_1.TableHead className="text-xs font-medium text-gray-500 uppercase">Total</table_1.TableHead>
                <table_1.TableHead className="text-xs font-medium text-gray-500 uppercase">Status</table_1.TableHead>
                <table_1.TableHead className="text-xs font-medium text-gray-500 uppercase w-[100px]">Aksi</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody className="divide-y divide-neutral-200">
              {transactions.length === 0 ? (<table_1.TableRow>
                  <table_1.TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    Belum ada transaksi
                  </table_1.TableCell>
                </table_1.TableRow>) : (transactions.map((transaction) => (<table_1.TableRow key={transaction.id} className="hover:bg-neutral-50">
                    <table_1.TableCell>
                      <span className="font-medium">#{transaction.id}</span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-medium">
                          {(0, utils_1.getInitials)(transaction.customer?.name || 'Unknown')}
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
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {transaction.items?.map((item, index) => (<span key={item.id}>
                          {item.serviceName}
                          {index < transaction.items.length - 1 ? ', ' : ''}
                        </span>)) || 'N/A'}
                    </table_1.TableCell>
                    <table_1.TableCell className="font-medium">
                      {(0, utils_1.formatCurrency)(transaction.total)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(0, utils_1.statusColor)(transaction.status).bg} ${(0, utils_1.statusColor)(transaction.status).text}`}>
                        {(0, utils_1.statusLabel)(transaction.status)}
                      </span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex space-x-2">
                        <button_1.Button variant="ghost" size="icon" asChild>
                          <wouter_1.Link href={`/transactions?id=${transaction.id}`} className="flex items-center justify-center">
                            <lucide_react_1.Eye className="h-4 w-4 text-primary"/>
                          </wouter_1.Link>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="icon">
                          <lucide_react_1.Printer className="h-4 w-4 text-gray-600"/>
                        </button_1.Button>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>)))}
            </table_1.TableBody>
          </table_1.Table>
        </div>
        
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Menampilkan {transactions.length} dari {data.length || 0} transaksi
          </div>
          <div className="flex space-x-1">
            <button_1.Button variant="outline" size="icon" disabled={transactions.length === 0}>
              <lucide_react_1.ChevronLeft className="h-4 w-4"/>
            </button_1.Button>
            <button_1.Button variant="outline" size="icon" disabled={transactions.length === data.length}>
              <lucide_react_1.ChevronRight className="h-4 w-4"/>
            </button_1.Button>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
