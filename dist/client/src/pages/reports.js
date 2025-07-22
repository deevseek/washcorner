"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Reports;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const export_utils_1 = require("@/lib/export-utils");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const select_1 = require("@/components/ui/select");
// Register ChartJS components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.LineElement, chart_js_1.PointElement, chart_js_1.ArcElement);
function Reports() {
    const [reportType, setReportType] = (0, react_1.useState)('daily');
    const [dateRange, setDateRange] = (0, react_1.useState)('current-month');
    // Fetch transaction data
    const { data: transactions = [], isLoading: isLoadingTransactions } = (0, react_query_1.useQuery)({
        queryKey: ['/api/transactions'],
    });
    // Fetch daily transaction data
    const { data: dailyTransactions = [], isLoading: isLoadingDaily } = (0, react_query_1.useQuery)({
        queryKey: ['/api/transactions/daily'],
    });
    // Fetch all services data
    const { data: services = [], isLoading: isLoadingServices } = (0, react_query_1.useQuery)({
        queryKey: ['/api/services'],
    });
    // Calculate key metrics from actual transaction data
    const isLoading = isLoadingTransactions || isLoadingDaily || isLoadingServices;
    // Total revenue
    const totalRevenue = transactions?.reduce((sum, transaction) => sum + transaction.total, 0) || 0;
    // Total transactions count
    const transactionCount = transactions?.length || 0;
    // Average transaction value
    const avgTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;
    // New customers (for simplicity, we'll count unique customers today)
    const uniqueCustomerIds = new Set(dailyTransactions?.map(t => t.customerId) || []);
    const newCustomersCount = uniqueCustomerIds.size;
    // Mock chart data
    const salesData = {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        datasets: [
            {
                label: 'Pendapatan',
                data: [1250000, 1450000, 980000, 1320000, 1780000, 2150000, 1950000],
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgb(37, 99, 235)',
                borderWidth: 1,
                barThickness: 30, // Menyesuaikan ketebalan bar
                borderRadius: 4, // Menambahkan corner radius
            },
        ],
    };
    const servicesData = {
        labels: ['Cuci Mobil Premium', 'Cuci Motor Premium', 'Cuci Mobil + Wax', 'Cuci Motor Standar', 'Detail Interior'],
        datasets: [
            {
                label: 'Jumlah Layanan',
                data: [45, 32, 18, 27, 15],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.7)',
                    'rgba(6, 182, 212, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                ],
                borderColor: [
                    'rgb(37, 99, 235)',
                    'rgb(6, 182, 212)',
                    'rgb(34, 197, 94)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 1,
            },
        ],
    };
    const vehicleTypeData = {
        labels: ['Mobil', 'Motor'],
        datasets: [
            {
                label: 'Jumlah Kendaraan',
                data: [68, 59],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.7)',
                    'rgba(6, 182, 212, 0.7)',
                ],
                borderColor: [
                    'rgb(37, 99, 235)',
                    'rgb(6, 182, 212)',
                ],
                borderWidth: 1,
            },
        ],
    };
    const customerTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        datasets: [
            {
                label: 'Pelanggan Baru',
                data: [25, 32, 38, 45, 42, 50, 55, 58, 65, 70, 75, 80],
                fill: false,
                borderColor: 'rgb(34, 197, 94)',
                tension: 0.1,
            },
            {
                label: 'Pelanggan Kembali',
                data: [15, 22, 28, 35, 40, 45, 50, 55, 60, 65, 70, 75],
                fill: false,
                borderColor: 'rgb(37, 99, 235)',
                tension: 0.1,
            },
        ],
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Laporan"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Laporan Penjualan" subtitle="Analisis performa bisnis dan tren penjualan" actions={[
            {
                label: 'Cetak Laporan',
                icon: 'printer',
                onClick: () => window.print(),
                primary: false
            },
            {
                label: 'Unduh Excel',
                icon: 'download',
                onClick: () => {
                    if (isLoading) {
                        alert('Mohon tunggu data sedang dimuat...');
                        return;
                    }
                    (0, export_utils_1.exportTransactionsToExcel)(transactions, {
                        title: 'LAPORAN TRANSAKSI WASH CORNER',
                        subtitle: 'Periode: ' + (dateRange === 'today' ? 'Hari Ini' :
                            dateRange === 'yesterday' ? 'Kemarin' :
                                dateRange === 'current-week' ? 'Minggu Ini' :
                                    dateRange === 'last-week' ? 'Minggu Lalu' :
                                        dateRange === 'current-month' ? 'Bulan Ini' :
                                            dateRange === 'last-month' ? 'Bulan Lalu' : 'Semua Waktu'),
                        dateRange: new Date().toLocaleDateString('id-ID')
                    });
                },
                primary: true
            }
        ]}/>
          
          {/* Statistik Utama */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <card_1.Card className="shadow-sm hover:shadow-md transition-shadow">
              <card_1.CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Pendapatan</h3>
                  {isLoading ? (<div className="flex items-center h-6">
                      <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
                      <span>Memuat data...</span>
                    </div>) : (<>
                      <div className="text-xl font-bold text-primary truncate">{(0, utils_1.formatCurrency)(totalRevenue)}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span>Pendapatan dari {transactions?.length || 0} transaksi</span>
                      </div>
                    </>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card className="shadow-sm hover:shadow-md transition-shadow">
              <card_1.CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
                  {isLoading ? (<div className="flex items-center h-6">
                      <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
                      <span>Memuat data...</span>
                    </div>) : (<>
                      <div className="text-xl font-bold text-primary">{transactionCount}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span>Jumlah transaksi tercatat</span>
                      </div>
                    </>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card className="shadow-sm hover:shadow-md transition-shadow">
              <card_1.CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Rata-rata Transaksi</h3>
                  {isLoading ? (<div className="flex items-center h-6">
                      <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
                      <span>Memuat data...</span>
                    </div>) : (<>
                      <div className="text-xl font-bold text-primary truncate">{(0, utils_1.formatCurrency)(avgTransactionValue)}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span>Nilai rata-rata per transaksi</span>
                      </div>
                    </>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card className="shadow-sm hover:shadow-md transition-shadow">
              <card_1.CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Pelanggan Baru</h3>
                  {isLoading ? (<div className="flex items-center h-6">
                      <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
                      <span>Memuat data...</span>
                    </div>) : (<>
                      <div className="text-xl font-bold text-primary">{newCustomersCount}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span>Pelanggan hari ini</span>
                      </div>
                    </>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
          
          {/* Filter dan Grafik */}
          <div className="mt-8 flex flex-col md:flex-row gap-6 mb-6">
            {/* Panel Filter Kiri */}
            <div className="md:w-72 space-y-5">
              <card_1.Card className="shadow-sm">
                <card_1.CardHeader className="px-5 py-4 border-b border-neutral-200 bg-gray-50/50">
                  <card_1.CardTitle className="text-sm font-medium text-gray-700">Filter Laporan</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="p-5">
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">Jenis Laporan</label>
                      <select_1.Select value={reportType} onValueChange={setReportType}>
                        <select_1.SelectTrigger className="w-full bg-white">
                          <select_1.SelectValue placeholder="Pilih jenis laporan"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="daily">Harian</select_1.SelectItem>
                          <select_1.SelectItem value="weekly">Mingguan</select_1.SelectItem>
                          <select_1.SelectItem value="monthly">Bulanan</select_1.SelectItem>
                          <select_1.SelectItem value="yearly">Tahunan</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">Rentang Waktu</label>
                      <select_1.Select value={dateRange} onValueChange={setDateRange}>
                        <select_1.SelectTrigger className="w-full bg-white">
                          <select_1.SelectValue placeholder="Pilih rentang waktu"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="today">Hari Ini</select_1.SelectItem>
                          <select_1.SelectItem value="yesterday">Kemarin</select_1.SelectItem>
                          <select_1.SelectItem value="current-week">Minggu Ini</select_1.SelectItem>
                          <select_1.SelectItem value="last-week">Minggu Lalu</select_1.SelectItem>
                          <select_1.SelectItem value="current-month">Bulan Ini</select_1.SelectItem>
                          <select_1.SelectItem value="last-month">Bulan Lalu</select_1.SelectItem>
                          <select_1.SelectItem value="custom">Kustom</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                    
                    <div className="pt-3 space-y-3">
                      <button_1.Button className="w-full shadow-sm" onClick={() => window.print()}>
                        <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
                        Cetak Laporan
                      </button_1.Button>
                      <button_1.Button variant="outline" className="w-full" onClick={() => {
            if (isLoading) {
                alert('Mohon tunggu data sedang dimuat...');
                return;
            }
            // Berdasarkan tab yang dipilih di halaman
            const activeTab = document.querySelector('[data-state="active"][role="tab"]');
            const activeTabValue = activeTab?.getAttribute('data-value') || 'sales';
            // Format periode untuk judul laporan
            const periodLabel = dateRange === 'today' ? 'Hari Ini' :
                dateRange === 'yesterday' ? 'Kemarin' :
                    dateRange === 'current-week' ? 'Minggu Ini' :
                        dateRange === 'last-week' ? 'Minggu Lalu' :
                            dateRange === 'current-month' ? 'Bulan Ini' :
                                dateRange === 'last-month' ? 'Bulan Lalu' : 'Semua Waktu';
            if (activeTabValue === 'services') {
                // Export laporan layanan
                (0, export_utils_1.exportServicesToExcel)(services, {
                    dateRange: periodLabel
                });
            }
            else if (activeTabValue === 'income') {
                // Export laporan pendapatan
                (0, export_utils_1.exportIncomeReportToExcel)(transactions, {
                    dateRange: periodLabel
                });
            }
            else {
                // Export laporan transaksi (default)
                (0, export_utils_1.exportTransactionsToExcel)(transactions, {
                    dateRange: periodLabel
                });
            }
        }}>
                        <lucide_react_1.FileSpreadsheet className="mr-2 h-4 w-4"/>
                        Unduh Excel
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
              
              <card_1.Card className="shadow-sm">
                <card_1.CardHeader className="px-5 py-4 border-b border-neutral-200 bg-gray-50/50">
                  <card_1.CardTitle className="text-sm font-medium text-gray-700">Layanan Terlaris</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="p-5">
                  {isLoading ? (<div className="flex justify-center items-center py-6">
                      <lucide_react_1.Loader2 className="h-6 w-6 animate-spin text-primary"/>
                    </div>) : (<div className="space-y-4">
                      {services.length === 0 ? (<div className="text-center py-4 text-gray-500">
                          Belum ada data layanan
                        </div>) : (<>
                          {services.slice(0, 5).map((service, index) => (<div key={service.id} className={`flex justify-between items-center ${index < services.length - 1 ? 'border-b border-gray-100 pb-3' : ''}`}>
                              <span className="text-sm font-medium">{service.name}</span>
                              <span className="font-semibold text-primary">
                                {/* Untuk contoh kita anggap setiap layanan memiliki satu transaksi */}
                                {index + 1}
                              </span>
                            </div>))}
                        </>)}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>
            </div>
            
            {/* Panel Utama Kanan */}
            <div className="flex-1">
              <tabs_1.Tabs defaultValue="sales" className="w-full">
                <tabs_1.TabsList className="w-full grid grid-cols-5">
                  <tabs_1.TabsTrigger value="sales" data-value="sales" className="flex items-center">
                    <lucide_react_1.BarChart className="mr-2 h-4 w-4"/>
                    <span>Penjualan</span>
                  </tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="income" data-value="income" className="flex items-center">
                    <lucide_react_1.BarChart className="mr-2 h-4 w-4"/>
                    <span>Pendapatan</span>
                  </tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="services" data-value="services" className="flex items-center">
                    <lucide_react_1.PieChart className="mr-2 h-4 w-4"/>
                    <span>Layanan</span>
                  </tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="vehicles" data-value="vehicles" className="flex items-center">
                    <lucide_react_1.PieChart className="mr-2 h-4 w-4"/>
                    <span>Kendaraan</span>
                  </tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="customers" data-value="customers" className="flex items-center">
                    <lucide_react_1.LineChart className="mr-2 h-4 w-4"/>
                    <span>Pelanggan</span>
                  </tabs_1.TabsTrigger>
                </tabs_1.TabsList>
                
                <div className="mt-5">
                  <tabs_1.TabsContent value="sales">
                    <card_1.Card className="shadow-sm">
                      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 bg-gray-50/50">
                        <card_1.CardTitle className="text-base font-semibold text-gray-700">Grafik Penjualan {reportType === 'daily' ? 'Harian' : reportType === 'weekly' ? 'Mingguan' : reportType === 'monthly' ? 'Bulanan' : 'Tahunan'}</card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        <div className="h-80">
                          {isLoading ? (<div className="flex justify-center items-center h-full">
                              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            </div>) : (<react_chartjs_2_1.Bar data={salesData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        bodyFont: {
                            size: 13,
                        },
                        borderColor: 'rgba(203, 213, 225, 0.5)',
                        borderWidth: 1,
                        padding: 10,
                        boxWidth: 10,
                        boxHeight: 10,
                        boxPadding: 3,
                        usePointStyle: true,
                        callbacks: {
                            label: function (context) {
                                return ' ' + context.dataset.label + ': Rp ' + context.raw.toLocaleString('id-ID');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(203, 213, 225, 0.2)'
                        },
                        ticks: {
                            padding: 10,
                            callback: function (value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            padding: 5
                        }
                    }
                }
            }}/>)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>

                  <tabs_1.TabsContent value="income">
                    <card_1.Card className="shadow-sm">
                      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 bg-gray-50/50">
                        <card_1.CardTitle className="text-base font-semibold text-gray-700">
                          Laporan Pendapatan berdasarkan Jenis Kendaraan
                        </card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        {isLoading ? (<div className="flex justify-center items-center h-80">
                            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                          </div>) : (<div className="space-y-8">
                            {/* Kalkulasi pendapatan berdasarkan jenis kendaraan */}
                            {(() => {
                // Hitung pendapatan berdasarkan jenis layanan
                // Pengelompokan transaksi berdasarkan jenis kendaraan dari LAYANAN, bukan customer
                const carTransactions = transactions.filter(t => {
                    // Periksa apakah ada layanan yang tipe kendaraannya mobil
                    if (t.items && t.items.length > 0) {
                        // Cek tipe kendaraan pada serviceDetails
                        return t.items.some((item) => item.serviceDetails?.vehicleType === 'car' ||
                            // Fallback jika serviceDetails tidak ada
                            (item.serviceDetails === undefined && t.customer?.vehicleType === 'car'));
                    }
                    // Fallback ke tipe kendaraan customer
                    return t.customer?.vehicleType === 'car';
                });
                const motorcycleTransactions = transactions.filter(t => {
                    // Periksa apakah ada layanan yang tipe kendaraannya motor
                    if (t.items && t.items.length > 0) {
                        // Cek tipe kendaraan pada serviceDetails
                        return t.items.some((item) => item.serviceDetails?.vehicleType === 'motorcycle' ||
                            // Fallback jika serviceDetails tidak ada
                            (item.serviceDetails === undefined && t.customer?.vehicleType === 'motorcycle'));
                    }
                    // Fallback ke tipe kendaraan customer
                    return t.customer?.vehicleType === 'motorcycle';
                });
                // Perhitungan pendapatan menggunakan harga ASLI layanan (bukan 't.total' yang mungkin diubah manual)
                const getServiceTotalPrice = (t) => {
                    if (!t.items || t.items.length === 0)
                        return 0;
                    return t.items.reduce((sum, item) => {
                        console.log('Service details for calculating price:', item.serviceDetails?.name, 'Price from service:', item.serviceDetails?.price, 'Price from item:', item.price);
                        // PENTING: Gunakan harga dari serviceDetails (harga asli layanan) 
                        // Motor seharusnya Rp 20.000 dari serviceDetails.price
                        const actualPrice = item.serviceDetails?.price || item.price;
                        const quantity = item.quantity || 1;
                        const discount = item.discount || 0;
                        // Hitung total setelah diskon
                        const itemTotal = actualPrice * quantity * (1 - discount / 100);
                        console.log(`Service: ${item.serviceDetails?.name}, Actual price: ${actualPrice}, Quantity: ${quantity}, Discount: ${discount}%, Total: ${itemTotal}`);
                        return sum + itemTotal;
                    }, 0);
                };
                const carIncome = carTransactions.reduce((sum, t) => sum + getServiceTotalPrice(t), 0);
                const motorcycleIncome = motorcycleTransactions.reduce((sum, t) => sum + getServiceTotalPrice(t), 0);
                const totalIncome = carIncome + motorcycleIncome;
                const carPercentage = totalIncome > 0 ? ((carIncome / totalIncome) * 100).toFixed(2) : '0.00';
                const motorcyclePercentage = totalIncome > 0 ? ((motorcycleIncome / totalIncome) * 100).toFixed(2) : '0.00';
                return (<>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <card_1.Card className="shadow-sm bg-blue-50">
                                      <card_1.CardContent className="p-6">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2">Pendapatan Mobil</h3>
                                        <div className="text-xl font-bold text-blue-700">{(0, utils_1.formatCurrency)(carIncome)}</div>
                                        <div className="text-sm text-gray-500">
                                          {carTransactions.length} Transaksi ({carPercentage}%)
                                        </div>
                                      </card_1.CardContent>
                                    </card_1.Card>
                                    
                                    <card_1.Card className="shadow-sm bg-green-50">
                                      <card_1.CardContent className="p-6">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2">Pendapatan Motor</h3>
                                        <div className="text-xl font-bold text-green-700">{(0, utils_1.formatCurrency)(motorcycleIncome)}</div>
                                        <div className="text-sm text-gray-500">
                                          {motorcycleTransactions.length} Transaksi ({motorcyclePercentage}%)
                                        </div>
                                      </card_1.CardContent>
                                    </card_1.Card>
                                    
                                    <card_1.Card className="shadow-sm bg-purple-50">
                                      <card_1.CardContent className="p-6">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Pendapatan</h3>
                                        <div className="text-xl font-bold text-purple-700">{(0, utils_1.formatCurrency)(totalIncome)}</div>
                                        <div className="text-sm text-gray-500">
                                          {transactions.length} Transaksi Total
                                        </div>
                                      </card_1.CardContent>
                                    </card_1.Card>
                                  </div>
                                  
                                  <div className="flex justify-end mt-4">
                                    <button_1.Button variant="outline" size="sm" onClick={() => {
                        (0, export_utils_1.exportIncomeReportToExcel)(transactions, {
                            dateRange: dateRange === 'today' ? 'Hari Ini' :
                                dateRange === 'yesterday' ? 'Kemarin' :
                                    dateRange === 'current-week' ? 'Minggu Ini' :
                                        dateRange === 'last-week' ? 'Minggu Lalu' :
                                            dateRange === 'current-month' ? 'Bulan Ini' :
                                                dateRange === 'last-month' ? 'Bulan Lalu' : 'Semua Waktu'
                        });
                    }}>
                                      <lucide_react_1.FileSpreadsheet className="h-4 w-4 mr-2"/>
                                      Unduh Laporan Pendapatan
                                    </button_1.Button>
                                  </div>
                                </>);
            })()}
                          </div>)}
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>
                  
                  <tabs_1.TabsContent value="services">
                    <card_1.Card className="shadow-sm">
                      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 bg-gray-50/50">
                        <card_1.CardTitle className="text-base font-semibold text-gray-700">Distribusi Layanan</card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        <div className="h-80">
                          {isLoading ? (<div className="flex justify-center items-center h-full">
                              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            </div>) : (<react_chartjs_2_1.Pie data={servicesData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        borderColor: 'rgba(203, 213, 225, 0.5)',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }}/>)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>
                  
                  <tabs_1.TabsContent value="vehicles">
                    <card_1.Card className="shadow-sm">
                      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 bg-gray-50/50">
                        <card_1.CardTitle className="text-base font-semibold text-gray-700">Jenis Kendaraan</card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        <div className="h-80">
                          {isLoading ? (<div className="flex justify-center items-center h-full">
                              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            </div>) : (<react_chartjs_2_1.Pie data={vehicleTypeData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        borderColor: 'rgba(203, 213, 225, 0.5)',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }}/>)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>
                  
                  <tabs_1.TabsContent value="customers">
                    <card_1.Card className="shadow-sm">
                      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 bg-gray-50/50">
                        <card_1.CardTitle className="text-base font-semibold text-gray-700">Tren Pelanggan</card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="p-6">
                        <div className="h-80">
                          {isLoading ? (<div className="flex justify-center items-center h-full">
                              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            </div>) : (<react_chartjs_2_1.Line data={customerTrendData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        borderColor: 'rgba(203, 213, 225, 0.5)',
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(203, 213, 225, 0.2)'
                        },
                        ticks: {
                            padding: 10
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            padding: 5
                        }
                    }
                }
            }}/>)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </tabs_1.TabsContent>
                </div>
              </tabs_1.Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
