import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Receipt } from "@/components/transactions/receipt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  getInitials,
  statusColor,
  statusLabel,
} from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Eye,
  Printer,
  Search,
  MoreHorizontal,
  Check,
  Clock,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [transactionToUpdate, setTransactionToUpdate] = useState<{
    id: number;
    status: string;
  } | null>(null);
  const { toast } = useToast();

  // Define Transaction interface untuk tipe data
  interface Transaction {
    id: number;
    customerId: number;
    date: string;
    total: number;
    status: string;
    paymentMethod: string;
    employeeId?: number;
    notes?: string;
    customer?: {
      id: number;
      name: string;
      phone: string;
      email?: string;
      licensePlate?: string;
      vehicleType: string;
      vehicleDetails?: string;
    };
    items?: Array<{
      id: number;
      transactionId: number;
      serviceId: number;
      quantity: number;
      price: number;
      discount: number;
      serviceName?: string;
      serviceDetails?: any;
    }>;
  }

  // Fetch transactions with proper typing and auto-refresh
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    // Polling untuk auto refresh data setiap 5 detik
    refetchInterval: 5000,
    // Pastikan refetch tetap berjalan meskipun tab tidak aktif
    refetchIntervalInBackground: true,
  });

  // Import queryClient dan gunakan useQueryClient hook
  const queryClient = useQueryClient();

  // Mutation untuk menghapus semua transaksi
  const deleteAllTransactionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/transactions/all");
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate dan refetch
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      toast({
        title: "Transaksi berhasil dihapus",
        description: data.message,
      });

      setShowDeleteConfirmDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus transaksi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation untuk mengubah status transaksi
  const updateTransactionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      try {
        console.log(
          `Mengirim permintaan update status ke ${id} menjadi ${status}`
        );
        const res = await apiRequest("PATCH", `/api/transactions/${id}`, {
          status,
        });

        // Hasilnya sudah ditangani oleh apiRequest jika ada error
        const data = await res.json();
        console.log("Response data:", data);
        return data;
      } catch (err) {
        console.error("Error updating status:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Success data:", data);

      // Temukan dan update transaksi di cache
      queryClient.setQueryData<Transaction[]>(
        ["/api/transactions"],
        (oldData) => {
          if (!oldData) return [];

          // Log data untuk debugging
          console.log("Current cache:", oldData);
          console.log("Updated transaction:", data.transaction);

          return oldData.map((transaction) => {
            // Jika ini adalah transaksi yang diupdate, ganti dengan data baru
            if (transaction.id === data.transaction.id) {
              return data.transaction;
            }
            return transaction;
          });
        }
      );

      // Segera invalidate query untuk memastikan data tersinkronisasi dengan server
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });

      toast({
        title: "Status berhasil diperbarui",
        description: "Status transaksi telah diubah",
      });

      setShowStatusDialog(false);
      setTransactionToUpdate(null);
    },
    onError: (error: Error) => {
      console.error("Transaction update error:", error);
      toast({
        title: "Gagal mengubah status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle transaction selection for viewing
  const handleViewTransaction = (id: number) => {
    setSelectedTransaction(id);
    setShowReceipt(true);
  };

  // Handle receipt printing - otomatis mencetak tanpa perlu klik tombol cetak lagi
  const [autoPrint, setAutoPrint] = useState(false);

  const handlePrintReceipt = (id: number) => {
    setSelectedTransaction(id);
    setAutoPrint(true); // Mengaktifkan fitur auto-print
    setShowReceipt(true);

    // Tunggu sejenak lalu panggil fungsi window.print()
    setTimeout(() => {
      console.log("Triggering print via window.print()");
      window.print();
    }, 1500);
  };

  // Handle transaction status update
  const handleChangeStatus = (id: number, currentStatus: string) => {
    setTransactionToUpdate({ id, status: currentStatus });
    setShowStatusDialog(true);
  };

  // Execute status update
  const confirmStatusChange = (newStatus: string) => {
    if (transactionToUpdate) {
      updateTransactionStatus.mutate({
        id: transactionToUpdate.id,
        status: newStatus,
      });
    }
  };

  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter(
    (transaction: Transaction) => {
      const matchesSearch =
        String(transaction.id).includes(searchTerm) ||
        (transaction.customer?.name &&
          transaction.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <TopNav title="Transaksi" />

        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Transaksi"
            subtitle="Kelola semua transaksi cuci kendaraan"
            actions={[
              {
                label: "Transaksi Baru",
                icon: "plus-circle",
                onClick: () => setShowNewTransaction(true),
                primary: true,
              },
              {
                label: "Hapus Semua",
                icon: "trash-2",
                onClick: () => setShowDeleteConfirmDialog(true),
                disabled:
                  transactions.length === 0 ||
                  deleteAllTransactionsMutation.isPending,
              },
            ]}
          />

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Cari berdasarkan ID atau nama pelanggan"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="in_progress">Proses</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
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
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions?.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-10 text-gray-500"
                          >
                            Tidak ada transaksi yang ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction: Transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              #{transaction.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium bg-primary">
                                  {transaction.customer
                                    ? getInitials(transaction.customer.name)
                                    : "N/A"}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {transaction.customer?.name || "N/A"}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {transaction.customer?.licensePlate ||
                                      "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString(
                                "id-ID"
                              )}
                            </TableCell>
                            <TableCell>
                              {transaction.items?.map((item) => (
                                <div key={item.id}>{item.serviceName}</div>
                              )) || "N/A"}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(transaction.total)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusColor(transaction.status).bg
                                } ${statusColor(transaction.status).text}`}
                              >
                                {statusLabel(transaction.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewTransaction(transaction.id)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Lihat Detail</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handlePrintReceipt(transaction.id)
                                    }
                                  >
                                    <Printer className="mr-2 h-4 w-4" />
                                    <span>Cetak Nota</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeStatus(
                                        transaction.id,
                                        transaction.status
                                      )
                                    }
                                    disabled={updateTransactionStatus.isPending}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>Ubah Status</span>
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

      {/* New Transaction Dialog */}
      <Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
        <DialogContent className="max-w-4xl">
          <TransactionForm onClose={() => setShowNewTransaction(false)} />
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Dialog - Normal view */}
      {selectedTransaction && !autoPrint && (
        <Dialog
          open={showReceipt}
          onOpenChange={(open) => {
            setShowReceipt(open);
            // Reset autoPrint when dialog closes
            if (!open) setAutoPrint(false);
          }}
        >
          <DialogContent className="max-w-md">
            <Receipt transactionId={selectedTransaction} autoPrint={false} />
          </DialogContent>
        </Dialog>
      )}

      {/* Hidden Receipt for auto printing */}
      {selectedTransaction && autoPrint && showReceipt && (
        <div className="print-area">
          <Receipt transactionId={selectedTransaction} autoPrint={true} />
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Status Transaksi</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pilih status baru untuk transaksi #{transactionToUpdate?.id}
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button
                variant="outline"
                className="justify-start text-left font-normal h-12"
                onClick={() => confirmStatusChange("pending")}
                disabled={updateTransactionStatus.isPending}
              >
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium">Menunggu</p>
                    <p className="text-xs text-muted-foreground">
                      Perlu ditindaklanjuti
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start text-left font-normal h-12"
                onClick={() => confirmStatusChange("in_progress")}
                disabled={updateTransactionStatus.isPending}
              >
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Proses</p>
                    <p className="text-xs text-muted-foreground">
                      Sedang dikerjakan
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start text-left font-normal h-12"
                onClick={() => confirmStatusChange("completed")}
                disabled={updateTransactionStatus.isPending}
              >
                <div className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Selesai</p>
                    <p className="text-xs text-muted-foreground">
                      Pekerjaan telah selesai
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start text-left font-normal h-12"
                onClick={() => confirmStatusChange("cancelled")}
                disabled={updateTransactionStatus.isPending}
              >
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Dibatalkan</p>
                    <p className="text-xs text-muted-foreground">
                      Transaksi dibatalkan
                    </p>
                  </div>
                </div>
              </Button>
            </div>

            {updateTransactionStatus.isPending && (
              <div className="flex justify-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Semua Transaksi</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-bold">semua data transaksi</span>? Tindakan
              ini tidak dapat dibatalkan.
            </p>
            <p className="text-sm text-muted-foreground">
              Semua riwayat transaksi, item transaksi, dan penggunaan inventaris
              akan dihapus.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmDialog(false)}
                disabled={deleteAllTransactionsMutation.isPending}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteAllTransactionsMutation.mutate()}
                disabled={deleteAllTransactionsMutation.isPending}
              >
                {deleteAllTransactionsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Hapus Semua</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
