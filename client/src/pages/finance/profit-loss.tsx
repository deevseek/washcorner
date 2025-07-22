import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, parse, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calculator, Save, Printer, FileSpreadsheet, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfitLossData {
  totalRevenue: number;
  totalExpenses: number;
  totalSalaries: number;
  netProfit: number;
}

interface ProfitLossReport {
  id: number;
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  totalSalaries: number;
  profit: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProfitLossPage() {
  const [currentPeriod, setCurrentPeriod] = useState(() => {
    const now = new Date();
    return format(now, 'yyyy-MM');
  });
  const [notes, setNotes] = useState('');
  const componentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Format current period for display
  const formattedPeriod = (() => {
    try {
      const date = parse(currentPeriod, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy', { locale: id });
    } catch {
      return '';
    }
  })();

  // Handle period navigation
  const goToPreviousMonth = () => {
    try {
      const date = parse(currentPeriod, 'yyyy-MM', new Date());
      const prevMonth = subMonths(date, 1);
      setCurrentPeriod(format(prevMonth, 'yyyy-MM'));
    } catch (err) {
      console.error('Error navigating to previous month', err);
    }
  };

  const goToNextMonth = () => {
    try {
      const date = parse(currentPeriod, 'yyyy-MM', new Date());
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      // Limit to current month
      const now = new Date();
      if (nextMonth > now) return;
      
      setCurrentPeriod(format(nextMonth, 'yyyy-MM'));
    } catch (err) {
      console.error('Error navigating to next month', err);
    }
  };

  // Fetch saved report data
  const { 
    data: savedReport,
    isLoading: isLoadingSavedReport,
    refetch: refetchSavedReport
  } = useQuery({
    queryKey: ['/api/finance/profit-loss-reports', currentPeriod],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/finance/profit-loss-reports?period=${currentPeriod}`);
      return res.json();
    },
  });

  // Get calculated profit-loss data
  const { 
    data: calculatedData,
    isLoading: isCalculating,
    refetch: recalculate
  } = useQuery({
    queryKey: ['/api/finance/calculate-profit-loss', currentPeriod],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/finance/calculate-profit-loss?period=${currentPeriod}`);
      const data = await res.json();
      return data as ProfitLossData;
    },
  });

  // Get all profit-loss reports
  const { 
    data: allReports,
    isLoading: isLoadingReports,
    refetch: refetchAllReports
  } = useQuery({
    queryKey: ['/api/finance/profit-loss-reports'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/finance/profit-loss-reports');
      return res.json() as Promise<ProfitLossReport[]>;
    },
  });

  // Save the profit-loss report
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!calculatedData) throw new Error('Tidak ada data untuk disimpan');

      const res = await apiRequest('POST', '/api/finance/save-profit-loss', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/finance/profit-loss-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/profit-loss-reports', currentPeriod] });
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
  useEffect(() => {
    if (savedReport && savedReport.notes) {
      setNotes(savedReport.notes);
    } else {
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
    if (!calculatedData) return;

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
      { wch: 30 },  // Width of column A
      { wch: 20 },  // Width of column B
    ];

    ws['!cols'] = wscols;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, ws, 'Laba Rugi');
    
    // Generate filename
    const fileName = `Laporan_Laba_Rugi_${currentPeriod}.xlsx`;
    
    // Export workbook
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Laporan Laba Rugi</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              recalculate();
              refetchSavedReport();
              refetchAllReports();
            }} 
            disabled={isCalculating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline" onClick={handleExportExcel} disabled={!calculatedData}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Laporan Bulan Ini</TabsTrigger>
          <TabsTrigger value="history">Riwayat Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Laporan Laba Rugi
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="font-medium text-sm min-w-36 text-center">
                        {formattedPeriod}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div ref={componentRef} className="p-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold">LAPORAN LABA RUGI</h2>
                      <p className="text-lg">Wash Corner</p>
                      <p className="text-sm text-muted-foreground">Periode: {formattedPeriod}</p>
                    </div>

                    {isCalculating ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : calculatedData ? (
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Pendapatan</TableCell>
                            <TableCell className="text-right">{formatRupiah(calculatedData.totalRevenue)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Pengeluaran</TableCell>
                            <TableCell className="text-right text-destructive">{formatRupiah(calculatedData.totalExpenses)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Gaji Karyawan</TableCell>
                            <TableCell className="text-right text-destructive">{formatRupiah(calculatedData.totalSalaries)}</TableCell>
                          </TableRow>
                          <TableRow className="border-t-2">
                            <TableCell className="font-bold text-lg">LABA / RUGI BERSIH</TableCell>
                            <TableCell 
                              className={`text-right font-bold text-lg ${
                                calculatedData.netProfit >= 0 ? 'text-green-600' : 'text-destructive'
                              }`}
                            >
                              {formatRupiah(calculatedData.netProfit)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          Tidak dapat memuat data laporan laba rugi.
                        </AlertDescription>
                      </Alert>
                    )}

                    {savedReport?.notes && (
                      <div className="mt-6 border-t pt-4">
                        <p className="font-medium">Catatan:</p>
                        <p className="text-sm text-muted-foreground">{savedReport.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {savedReport ? 
                      `Laporan terakhir disimpan: ${new Date(savedReport.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}` : 
                      'Laporan belum disimpan'
                    }
                  </div>
                  <Button 
                    onClick={() => saveMutation.mutate()} 
                    disabled={saveMutation.isPending || isCalculating || !calculatedData}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savedReport ? 'Perbarui Laporan' : 'Simpan Laporan'}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Detail Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Periode</label>
                      <Input 
                        type="month" 
                        value={currentPeriod}
                        onChange={(e) => setCurrentPeriod(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Catatan</label>
                      <Input 
                        type="text" 
                        placeholder="Tambahkan catatan untuk laporan ini"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Analisis Singkat:</h3>
                      {calculatedData && (
                        <div className="space-y-2 text-sm">
                          {calculatedData.netProfit >= 0 ? (
                            <p className="text-green-600">
                              Bulan {formattedPeriod} menghasilkan laba sebesar {formatRupiah(calculatedData.netProfit)}
                            </p>
                          ) : (
                            <p className="text-destructive">
                              Bulan {formattedPeriod} mengalami kerugian sebesar {formatRupiah(Math.abs(calculatedData.netProfit))}
                            </p>
                          )}
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
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Laporan Laba Rugi</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : allReports && allReports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Pendapatan</TableHead>
                      <TableHead>Pengeluaran</TableHead>
                      <TableHead>Gaji</TableHead>
                      <TableHead>Laba/Rugi</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReports.map((report) => {
                      // Format period as monthly name
                      const [year, month] = report.period.split('-');
                      const periodDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                      const formattedReportPeriod = format(periodDate, 'MMMM yyyy', { locale: id });
                      
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {formattedReportPeriod}
                          </TableCell>
                          <TableCell>{formatRupiah(report.totalRevenue)}</TableCell>
                          <TableCell>{formatRupiah(report.totalExpenses)}</TableCell>
                          <TableCell>{formatRupiah(report.totalSalaries)}</TableCell>
                          <TableCell className={report.profit >= 0 ? 'text-green-600' : 'text-destructive'}>
                            {formatRupiah(report.profit)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={report.notes || ''}>
                            {report.notes || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Belum ada laporan laba rugi yang disimpan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}