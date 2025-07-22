"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfitLossPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const lucide_react_1 = require("lucide-react");
const XLSX = __importStar(require("xlsx"));
const react_2 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const queryClient_1 = require("@/lib/queryClient");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const alert_1 = require("@/components/ui/alert");
const tabs_1 = require("@/components/ui/tabs");
const table_1 = require("@/components/ui/table");
const skeleton_1 = require("@/components/ui/skeleton");
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
function ProfitLossPage() {
    const [currentPeriod, setCurrentPeriod] = (0, react_1.useState)(() => {
        const now = new Date();
        return (0, date_fns_1.format)(now, 'yyyy-MM');
    });
    const [notes, setNotes] = (0, react_1.useState)('');
    const componentRef = (0, react_2.useRef)(null);
    const { toast } = (0, use_toast_1.useToast)();
    // Format current period for display
    const formattedPeriod = (() => {
        try {
            const date = (0, date_fns_1.parse)(currentPeriod, 'yyyy-MM', new Date());
            return (0, date_fns_1.format)(date, 'MMMM yyyy', { locale: locale_1.id });
        }
        catch {
            return '';
        }
    })();
    // Handle period navigation
    const goToPreviousMonth = () => {
        try {
            const date = (0, date_fns_1.parse)(currentPeriod, 'yyyy-MM', new Date());
            const prevMonth = (0, date_fns_1.subMonths)(date, 1);
            setCurrentPeriod((0, date_fns_1.format)(prevMonth, 'yyyy-MM'));
        }
        catch (err) {
            console.error('Error navigating to previous month', err);
        }
    };
    const goToNextMonth = () => {
        try {
            const date = (0, date_fns_1.parse)(currentPeriod, 'yyyy-MM', new Date());
            const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            // Limit to current month
            const now = new Date();
            if (nextMonth > now)
                return;
            setCurrentPeriod((0, date_fns_1.format)(nextMonth, 'yyyy-MM'));
        }
        catch (err) {
            console.error('Error navigating to next month', err);
        }
    };
    // Fetch saved report data
    const { data: savedReport, isLoading: isLoadingSavedReport, refetch: refetchSavedReport } = (0, react_query_1.useQuery)({
        queryKey: ['/api/finance/profit-loss-reports', currentPeriod],
        queryFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('GET', `/api/finance/profit-loss-reports?period=${currentPeriod}`);
            return res.json();
        },
    });
    // Get calculated profit-loss data
    const { data: calculatedData, isLoading: isCalculating, refetch: recalculate } = (0, react_query_1.useQuery)({
        queryKey: ['/api/finance/calculate-profit-loss', currentPeriod],
        queryFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('GET', `/api/finance/calculate-profit-loss?period=${currentPeriod}`);
            const data = await res.json();
            return data;
        },
    });
    // Get all profit-loss reports
    const { data: allReports, isLoading: isLoadingReports, refetch: refetchAllReports } = (0, react_query_1.useQuery)({
        queryKey: ['/api/finance/profit-loss-reports'],
        queryFn: async () => {
            const res = await (0, queryClient_1.apiRequest)('GET', '/api/finance/profit-loss-reports');
            return res.json();
        },
    });
    // Save the profit-loss report
    const saveMutation = (0, react_query_1.useMutation)({
        mutationFn: async () => {
            if (!calculatedData)
                throw new Error('Tidak ada data untuk disimpan');
            const res = await (0, queryClient_1.apiRequest)('POST', '/api/finance/save-profit-loss', {
                period: currentPeriod,
                totalRevenue: calculatedData.totalRevenue,
                totalExpenses: calculatedData.totalExpenses,
                totalSalaries: calculatedData.totalSalaries,
                netProfit: calculatedData.netProfit,
                notes: notes || `Laporan Laba Rugi ${formattedPeriod}`
            });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Berhasil',
                description: 'Laporan laba rugi berhasil disimpan',
            });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/profit-loss-reports'] });
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/finance/profit-loss-reports', currentPeriod] });
            setNotes('');
        },
        onError: (error) => {
            toast({
                title: 'Gagal menyimpan laporan',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Set notes from saved report if exists
    (0, react_1.useEffect)(() => {
        if (savedReport && savedReport.notes) {
            setNotes(savedReport.notes);
        }
        else {
            setNotes('');
        }
    }, [savedReport]);
    // For printing
    const handlePrint = () => {
        if (componentRef.current) {
            const printContents = componentRef.current.innerHTML;
            const originalContents = document.body.innerHTML;
            const printStyles = `
        <style>
          @media print {
            body { padding: 20mm; font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            table td, table th { padding: 8px; border: 1px solid #ddd; }
            .text-right { text-align: right; }
            .text-destructive { color: #f43f5e; }
            .text-green-600 { color: #059669; }
            .font-medium { font-weight: 500; }
            .font-bold { font-weight: 700; }
            .text-lg { font-size: 1.125rem; }
            .border-t-2 { border-top-width: 2px; }
          }
        </style>
      `;
            document.body.innerHTML = printStyles + '<div class="print-container">' + printContents + '</div>';
            window.print();
            document.body.innerHTML = originalContents;
            // Reload the page to restore React state after printing
            window.location.reload();
        }
    };
    // Export to Excel
    const handleExportExcel = () => {
        if (!calculatedData)
            return;
        const workbook = XLSX.utils.book_new();
        // Create data for worksheet
        const wsData = [
            ['LAPORAN LABA RUGI'],
            ['Wash Corner'],
            [''],
            [`Periode: ${formattedPeriod}`],
            [''],
            ['Deskripsi', 'Jumlah (Rp)'],
            ['Pendapatan', calculatedData.totalRevenue],
            ['Pengeluaran', calculatedData.totalExpenses],
            ['Gaji Karyawan', calculatedData.totalSalaries],
            [''],
            ['LABA / RUGI BERSIH', calculatedData.netProfit],
            [''],
            ['Notes:', notes || '']
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        // Set column widths
        const wscols = [
            { wch: 30 }, // Width of column A
            { wch: 20 }, // Width of column B
        ];
        ws['!cols'] = wscols;
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, ws, 'Laba Rugi');
        // Generate filename
        const fileName = `Laporan_Laba_Rugi_${currentPeriod}.xlsx`;
        // Export workbook
        XLSX.writeFile(workbook, fileName);
    };
    return (<div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Laporan Laba Rugi</h1>
        <div className="flex space-x-2">
          <button_1.Button variant="outline" onClick={() => {
            recalculate();
            refetchSavedReport();
            refetchAllReports();
        }} disabled={isCalculating}>
            <lucide_react_1.RefreshCw className="w-4 h-4 mr-2"/>
            Refresh
          </button_1.Button>
          <button_1.Button variant="outline" onClick={handlePrint}>
            <lucide_react_1.Printer className="w-4 h-4 mr-2"/>
            Cetak
          </button_1.Button>
          <button_1.Button variant="outline" onClick={handleExportExcel} disabled={!calculatedData}>
            <lucide_react_1.FileSpreadsheet className="w-4 h-4 mr-2"/>
            Export Excel
          </button_1.Button>
        </div>
      </div>

      <tabs_1.Tabs defaultValue="current" className="w-full">
        <tabs_1.TabsList className="mb-4">
          <tabs_1.TabsTrigger value="current">Laporan Bulan Ini</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history">Riwayat Laporan</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="current">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <card_1.Card>
                <card_1.CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <card_1.CardTitle className="text-xl flex items-center">
                      <lucide_react_1.Calculator className="w-5 h-5 mr-2"/>
                      Laporan Laba Rugi
                    </card_1.CardTitle>
                    <div className="flex items-center space-x-2">
                      <button_1.Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                        <lucide_react_1.ChevronLeft className="w-4 h-4"/>
                      </button_1.Button>
                      <div className="font-medium text-sm min-w-36 text-center">
                        {formattedPeriod}
                      </div>
                      <button_1.Button variant="ghost" size="icon" onClick={goToNextMonth}>
                        <lucide_react_1.ChevronRight className="w-4 h-4"/>
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="pt-6">
                  <div ref={componentRef} className="p-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold">LAPORAN LABA RUGI</h2>
                      <p className="text-lg">Wash Corner</p>
                      <p className="text-sm text-muted-foreground">Periode: {formattedPeriod}</p>
                    </div>

                    {isCalculating ? (<div className="space-y-4">
                        <skeleton_1.Skeleton className="h-8 w-full"/>
                        <skeleton_1.Skeleton className="h-8 w-full"/>
                        <skeleton_1.Skeleton className="h-8 w-full"/>
                        <skeleton_1.Skeleton className="h-8 w-full"/>
                      </div>) : calculatedData ? (<table_1.Table>
                        <table_1.TableBody>
                          <table_1.TableRow>
                            <table_1.TableCell className="font-medium">Pendapatan</table_1.TableCell>
                            <table_1.TableCell className="text-right">{formatRupiah(calculatedData.totalRevenue)}</table_1.TableCell>
                          </table_1.TableRow>
                          <table_1.TableRow>
                            <table_1.TableCell className="font-medium">Pengeluaran</table_1.TableCell>
                            <table_1.TableCell className="text-right text-destructive">{formatRupiah(calculatedData.totalExpenses)}</table_1.TableCell>
                          </table_1.TableRow>
                          <table_1.TableRow>
                            <table_1.TableCell className="font-medium">Gaji Karyawan</table_1.TableCell>
                            <table_1.TableCell className="text-right text-destructive">{formatRupiah(calculatedData.totalSalaries)}</table_1.TableCell>
                          </table_1.TableRow>
                          <table_1.TableRow className="border-t-2">
                            <table_1.TableCell className="font-bold text-lg">LABA / RUGI BERSIH</table_1.TableCell>
                            <table_1.TableCell className={`text-right font-bold text-lg ${calculatedData.netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {formatRupiah(calculatedData.netProfit)}
                            </table_1.TableCell>
                          </table_1.TableRow>
                        </table_1.TableBody>
                      </table_1.Table>) : (<alert_1.Alert>
                        <alert_1.AlertDescription>
                          Tidak dapat memuat data laporan laba rugi.
                        </alert_1.AlertDescription>
                      </alert_1.Alert>)}

                    {savedReport?.notes && (<div className="mt-6 border-t pt-4">
                        <p className="font-medium">Catatan:</p>
                        <p className="text-sm text-muted-foreground">{savedReport.notes}</p>
                      </div>)}
                  </div>
                </card_1.CardContent>
                <card_1.CardFooter className="bg-muted/30 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {savedReport ?
            `Laporan terakhir disimpan: ${new Date(savedReport.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}` :
            'Laporan belum disimpan'}
                  </div>
                  <button_1.Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isCalculating || !calculatedData}>
                    <lucide_react_1.Save className="w-4 h-4 mr-2"/>
                    {savedReport ? 'Perbarui Laporan' : 'Simpan Laporan'}
                  </button_1.Button>
                </card_1.CardFooter>
              </card_1.Card>
            </div>

            <div>
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Detail Laporan</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Periode</label>
                      <input_1.Input type="month" value={currentPeriod} onChange={(e) => setCurrentPeriod(e.target.value)} className="mt-1"/>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Catatan</label>
                      <input_1.Input type="text" placeholder="Tambahkan catatan untuk laporan ini" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1"/>
                    </div>
                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Analisis Singkat:</h3>
                      {calculatedData && (<div className="space-y-2 text-sm">
                          {calculatedData.netProfit >= 0 ? (<p className="text-green-600">
                              Bulan {formattedPeriod} menghasilkan laba sebesar {formatRupiah(calculatedData.netProfit)}
                            </p>) : (<p className="text-destructive">
                              Bulan {formattedPeriod} mengalami kerugian sebesar {formatRupiah(Math.abs(calculatedData.netProfit))}
                            </p>)}
                          <p>
                            Pendapatan: {formatRupiah(calculatedData.totalRevenue)}
                          </p>
                          <p>
                            Total Pengeluaran: {formatRupiah(calculatedData.totalExpenses + calculatedData.totalSalaries)}
                          </p>
                          <p>
                            Rasio Beban Pengeluaran: {Math.round((calculatedData.totalExpenses / calculatedData.totalRevenue) * 100 || 0)}%
                          </p>
                          <p>
                            Rasio Beban Gaji: {Math.round((calculatedData.totalSalaries / calculatedData.totalRevenue) * 100 || 0)}%
                          </p>
                        </div>)}
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="history">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Riwayat Laporan Laba Rugi</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingReports ? (<div className="space-y-4">
                  <skeleton_1.Skeleton className="h-8 w-full"/>
                  <skeleton_1.Skeleton className="h-8 w-full"/>
                  <skeleton_1.Skeleton className="h-8 w-full"/>
                </div>) : allReports && allReports.length > 0 ? (<table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Periode</table_1.TableHead>
                      <table_1.TableHead>Pendapatan</table_1.TableHead>
                      <table_1.TableHead>Pengeluaran</table_1.TableHead>
                      <table_1.TableHead>Gaji</table_1.TableHead>
                      <table_1.TableHead>Laba/Rugi</table_1.TableHead>
                      <table_1.TableHead>Catatan</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {allReports.map((report) => {
                // Format period as monthly name
                const [year, month] = report.period.split('-');
                const periodDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                const formattedReportPeriod = (0, date_fns_1.format)(periodDate, 'MMMM yyyy', { locale: locale_1.id });
                return (<table_1.TableRow key={report.id}>
                          <table_1.TableCell className="font-medium">
                            {formattedReportPeriod}
                          </table_1.TableCell>
                          <table_1.TableCell>{formatRupiah(report.totalRevenue)}</table_1.TableCell>
                          <table_1.TableCell>{formatRupiah(report.totalExpenses)}</table_1.TableCell>
                          <table_1.TableCell>{formatRupiah(report.totalSalaries)}</table_1.TableCell>
                          <table_1.TableCell className={report.profit >= 0 ? 'text-green-600' : 'text-destructive'}>
                            {formatRupiah(report.profit)}
                          </table_1.TableCell>
                          <table_1.TableCell className="max-w-[200px] truncate" title={report.notes || ''}>
                            {report.notes || '-'}
                          </table_1.TableCell>
                        </table_1.TableRow>);
            })}
                  </table_1.TableBody>
                </table_1.Table>) : (<div className="text-center py-6">
                  <p className="text-muted-foreground">Belum ada laporan laba rugi yang disimpan</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
