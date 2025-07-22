"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transactions;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const button_1 = require("@/components/ui/button");
const transaction_form_1 = require("@/components/transactions/transaction-form");
const receipt_1 = require("@/components/transactions/receipt");
const table_1 = require("@/components/ui/table");
const utils_1 = require("@/lib/utils");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const card_1 = require("@/components/ui/card");
const queryClient_1 = require("@/lib/queryClient");
const use_toast_1 = require("@/hooks/use-toast");
function Transactions() {
    const [showNewTransaction, setShowNewTransaction] = (0, react_1.useState)(false);
    const [showReceipt, setShowReceipt] = (0, react_1.useState)(false);
    const [selectedTransaction, setSelectedTransaction] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [showStatusDialog, setShowStatusDialog] = (0, react_1.useState)(false);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = (0, react_1.useState)(false);
    const [transactionToUpdate, setTransactionToUpdate] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    // Fetch transactions with proper typing and auto-refresh
    const { data: transactions = [], isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/transactions'],
        // Polling untuk auto refresh data setiap 5 detik
        refetchInterval: 5000,
        // Pastikan refetch tetap berjalan meskipun tab tidak aktif
        refetchIntervalInBackground: true,
    });
    // Import queryClient dan gunakan useQueryClient hook
    const queryClient = (0, react_query_1.useQueryClient)();
    // Mutation untuk menghapus semua transaksi
    const deleteAllTransactionsMutation = (0, react_query_1.useMutation)({
        mutationFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('DELETE', '/api/transactions/all');
            return await res.json();
        },
        onSuccess: (data) => {
            // Invalidate dan refetch
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            toast({
                title: 'Transaksi berhasil dihapus',
                description: data.message,
            });
            setShowDeleteConfirmDialog(false);
        },
        onError: (error) => {
            toast({
                title: 'Gagal menghapus transaksi',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Mutation untuk mengubah status transaksi
    const updateTransactionStatus = (0, react_query_1.useMutation)({
        mutationFn: async ({ id, status }) => {
            try {
                console.log(`Mengirim permintaan update status ke ${id} menjadi ${status}`);
                const res = await (0, queryClient_1.apiRequest)('PATCH', `/api/transactions/${id}`, { status });
                // Hasilnya sudah ditangani oleh apiRequest jika ada error
                const data = await res.json();
                console.log('Response data:', data);
                return data;
            }
            catch (err) {
                console.error("Error updating status:", err);
                throw err;
            }
        },
        onSuccess: (data) => {
            console.log('Success data:', data);
            // Temukan dan update transaksi di cache
            queryClient.setQueryData(['/api/transactions'], (oldData) => {
                if (!oldData)
                    return [];
                // Log data untuk debugging
                console.log('Current cache:', oldData);
                console.log('Updated transaction:', data.transaction);
                return oldData.map(transaction => {
                    // Jika ini adalah transaksi yang diupdate, ganti dengan data baru
                    if (transaction.id === data.transaction.id) {
                        return data.transaction;
                    }
                    return transaction;
                });
            });
            // Segera invalidate query untuk memastikan data tersinkronisasi dengan server
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            toast({
                title: 'Status berhasil diperbarui',
                description: 'Status transaksi telah diubah',
            });
            setShowStatusDialog(false);
            setTransactionToUpdate(null);
        },
        onError: (error) => {
            console.error("Transaction update error:", error);
            toast({
                title: 'Gagal mengubah status',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Handle transaction selection for viewing
    const handleViewTransaction = (id) => {
        setSelectedTransaction(id);
        setShowReceipt(true);
    };
    // Handle receipt printing - otomatis mencetak tanpa perlu klik tombol cetak lagi
    const [autoPrint, setAutoPrint] = (0, react_1.useState)(false);
    const handlePrintReceipt = (id) => {
        setSelectedTransaction(id);
        setAutoPrint(true); // Mengaktifkan fitur auto-print
        setShowReceipt(true);
        // Tunggu sejenak lalu panggil fungsi window.print()
        setTimeout(() => {
            console.log('Triggering print via window.print()');
            window.print();
        }, 1500);
    };
    // Handle transaction status update
    const handleChangeStatus = (id, currentStatus) => {
        setTransactionToUpdate({ id, status: currentStatus });
        setShowStatusDialog(true);
    };
    // Execute status update
    const confirmStatusChange = (newStatus) => {
        if (transactionToUpdate) {
            updateTransactionStatus.mutate({
                id: transactionToUpdate.id,
                status: newStatus
            });
        }
    };
    // Filter transactions based on search term and status
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch = String(transaction.id).includes(searchTerm) ||
            (transaction.customer?.name && transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Transaksi"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Transaksi" subtitle="Kelola semua transaksi cuci kendaraan" actions={[
            {
                label: 'Transaksi Baru',
                icon: 'plus-circle',
                onClick: () => setShowNewTransaction(true),
                primary: true
            },
            {
                label: 'Hapus Semua',
                icon: 'trash-2',
                onClick: () => setShowDeleteConfirmDialog(true),
                disabled: transactions.length === 0 || deleteAllTransactionsMutation.isPending
            }
        ]}/>
          
          <card_1.Card className="mt-6">
            <card_1.CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                  <input_1.Input placeholder="Cari berdasarkan ID atau nama pelanggan" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                </div>
                <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                  <select_1.SelectTrigger className="w-[180px]">
                    <select_1.SelectValue placeholder="Filter Status"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">Semua Status</select_1.SelectItem>
                    <select_1.SelectItem value="pending">Menunggu</select_1.SelectItem>
                    <select_1.SelectItem value="in_progress">Proses</select_1.SelectItem>
                    <select_1.SelectItem value="completed">Selesai</select_1.SelectItem>
                    <select_1.SelectItem value="cancelled">Dibatalkan</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              
              {isLoading ? (<div className="flex justify-center py-10">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<div className="overflow-x-auto">
                  <table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead className="w-[80px]">ID</table_1.TableHead>
                        <table_1.TableHead>Pelanggan</table_1.TableHead>
                        <table_1.TableHead>Tanggal</table_1.TableHead>
                        <table_1.TableHead>Layanan</table_1.TableHead>
                        <table_1.TableHead>Total</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead className="text-right">Aksi</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {filteredTransactions?.length === 0 ? (<table_1.TableRow>
                          <table_1.TableCell colSpan={7} className="text-center py-10 text-gray-500">
                            Tidak ada transaksi yang ditemukan
                          </table_1.TableCell>
                        </table_1.TableRow>) : (filteredTransactions.map((transaction) => (<table_1.TableRow key={transaction.id}>
                            <table_1.TableCell className="font-medium">#{transaction.id}</table_1.TableCell>
                            <table_1.TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-primary">
                                  {transaction.customer ? (0, utils_1.getInitials)(transaction.customer.name) : 'N/A'}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{transaction.customer?.name || 'N/A'}</p>
                                  <p className="text-gray-500 text-xs">
                                    {transaction.customer?.licensePlate || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {new Date(transaction.date).toLocaleDateString('id-ID')}
                            </table_1.TableCell>
                            <table_1.TableCell>
                              {transaction.items?.map((item) => (<div key={item.id}>{item.serviceName}</div>)) || 'N/A'}
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
                                    <span className="sr-only">Open menu</span>
                                    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                                  </button_1.Button>
                                </dropdown_menu_1.DropdownMenuTrigger>
                                <dropdown_menu_1.DropdownMenuContent align="end">
                                  <dropdown_menu_1.DropdownMenuItem onClick={() => handleViewTransaction(transaction.id)}>
                                    <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                                    <span>Lihat Detail</span>
                                  </dropdown_menu_1.DropdownMenuItem>
                                  <dropdown_menu_1.DropdownMenuItem onClick={() => handlePrintReceipt(transaction.id)}>
                                    <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
                                    <span>Cetak Nota</span>
                                  </dropdown_menu_1.DropdownMenuItem>
                                  <dropdown_menu_1.DropdownMenuSeparator />
                                  <dropdown_menu_1.DropdownMenuItem onClick={() => handleChangeStatus(transaction.id, transaction.status)} disabled={updateTransactionStatus.isPending}>
                                    <lucide_react_1.Clock className="mr-2 h-4 w-4"/>
                                    <span>Ubah Status</span>
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
      
      {/* New Transaction Dialog */}
      <dialog_1.Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
        <dialog_1.DialogContent className="max-w-4xl">
          <transaction_form_1.TransactionForm onClose={() => setShowNewTransaction(false)}/>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
      
      {/* Receipt Viewer Dialog - Normal view */}
      {selectedTransaction && !autoPrint && (<dialog_1.Dialog open={showReceipt} onOpenChange={(open) => {
                setShowReceipt(open);
                // Reset autoPrint when dialog closes
                if (!open)
                    setAutoPrint(false);
            }}>
          <dialog_1.DialogContent className="max-w-md">
            <receipt_1.Receipt transactionId={selectedTransaction} autoPrint={false}/>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>)}
      
      {/* Hidden Receipt for auto printing */}
      {selectedTransaction && autoPrint && showReceipt && (<div style={{ position: 'absolute', left: '-9999px' }}>
          <receipt_1.Receipt transactionId={selectedTransaction} autoPrint={true}/>
        </div>)}
      
      {/* Status Change Dialog */}
      <dialog_1.Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <dialog_1.DialogContent className="max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Ubah Status Transaksi</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pilih status baru untuk transaksi #{transactionToUpdate?.id}
            </p>
            
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button_1.Button variant="outline" className="justify-start text-left font-normal h-12" onClick={() => confirmStatusChange("pending")} disabled={updateTransactionStatus.isPending}>
                <div className="flex items-center">
                  <lucide_react_1.Clock className="mr-2 h-5 w-5 text-amber-500"/>
                  <div>
                    <p className="font-medium">Menunggu</p>
                    <p className="text-xs text-muted-foreground">Perlu ditindaklanjuti</p>
                  </div>
                </div>
              </button_1.Button>
              
              <button_1.Button variant="outline" className="justify-start text-left font-normal h-12" onClick={() => confirmStatusChange("in_progress")} disabled={updateTransactionStatus.isPending}>
                <div className="flex items-center">
                  <lucide_react_1.Clock className="mr-2 h-5 w-5 text-blue-500"/>
                  <div>
                    <p className="font-medium">Proses</p>
                    <p className="text-xs text-muted-foreground">Sedang dikerjakan</p>
                  </div>
                </div>
              </button_1.Button>
              
              <button_1.Button variant="outline" className="justify-start text-left font-normal h-12" onClick={() => confirmStatusChange("completed")} disabled={updateTransactionStatus.isPending}>
                <div className="flex items-center">
                  <lucide_react_1.Check className="mr-2 h-5 w-5 text-green-500"/>
                  <div>
                    <p className="font-medium">Selesai</p>
                    <p className="text-xs text-muted-foreground">Pekerjaan telah selesai</p>
                  </div>
                </div>
              </button_1.Button>
              
              <button_1.Button variant="outline" className="justify-start text-left font-normal h-12" onClick={() => confirmStatusChange("cancelled")} disabled={updateTransactionStatus.isPending}>
                <div className="flex items-center">
                  <lucide_react_1.AlertTriangle className="mr-2 h-5 w-5 text-red-500"/>
                  <div>
                    <p className="font-medium">Dibatalkan</p>
                    <p className="text-xs text-muted-foreground">Transaksi dibatalkan</p>
                  </div>
                </div>
              </button_1.Button>
            </div>
            
            {updateTransactionStatus.isPending && (<div className="flex justify-center mt-4">
                <lucide_react_1.Loader2 className="h-6 w-6 animate-spin text-primary"/>
              </div>)}
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
      
      {/* Delete All Confirmation Dialog */}
      <dialog_1.Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <dialog_1.DialogContent className="max-w-md">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Hapus Semua Transaksi</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Apakah Anda yakin ingin menghapus <span className="font-bold">semua data transaksi</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <p className="text-sm text-muted-foreground">
              Semua riwayat transaksi, item transaksi, dan penggunaan inventaris akan dihapus.
            </p>
            
            <div className="flex justify-end gap-3 mt-6">
              <button_1.Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)} disabled={deleteAllTransactionsMutation.isPending}>
                Batal
              </button_1.Button>
              <button_1.Button variant="destructive" onClick={() => deleteAllTransactionsMutation.mutate()} disabled={deleteAllTransactionsMutation.isPending}>
                {deleteAllTransactionsMutation.isPending ? (<>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    <span>Menghapus...</span>
                  </>) : (<>
                    <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                    <span>Hapus Semua</span>
                  </>)}
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
