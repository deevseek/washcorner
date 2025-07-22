"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const react_query_1 = require("@tanstack/react-query");
const sidebar_1 = require("@/components/layout/sidebar");
const top_nav_1 = require("@/components/layout/top-nav");
const page_header_1 = require("@/components/layout/page-header");
const stats_overview_1 = require("@/components/dashboard/stats-overview");
const recent_transactions_1 = require("@/components/dashboard/recent-transactions");
const service_packages_1 = require("@/components/dashboard/service-packages");
const quick_actions_1 = require("@/components/dashboard/quick-actions");
const low_inventory_1 = require("@/components/dashboard/low-inventory");
const today_stats_1 = require("@/components/dashboard/today-stats");
const lucide_react_1 = require("lucide-react");
function Dashboard() {
    const { data: stats, isLoading: isLoadingStats } = (0, react_query_1.useQuery)({
        queryKey: ['/api/dashboard/stats'],
        // Auto refresh setiap 5 detik untuk data dashboard
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
    const { data: services } = (0, react_query_1.useQuery)({
        queryKey: ['/api/services'],
        // Layanan jarang berubah, jadi refresh lebih jarang
        refetchInterval: 30000,
    });
    const { data: lowStockItems } = (0, react_query_1.useQuery)({
        queryKey: ['/api/inventory/low-stock'],
        // Refresh stok setiap 10 detik
        refetchInterval: 10000,
        refetchIntervalInBackground: true,
    });
    const { data: recentTransactions, isLoading: isLoadingTransactions } = (0, react_query_1.useQuery)({
        queryKey: ['/api/transactions/recent'],
        // Auto refresh setiap 3 detik untuk transaksi terbaru
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
    });
    return (<div className="min-h-screen flex flex-col md:flex-row">
      <sidebar_1.Sidebar />
      
      <div className="flex-1 md:ml-64">
        <top_nav_1.TopNav title="Dashboard"/>
        
        <div className="container mx-auto px-4 py-6">
          <page_header_1.PageHeader title="Dashboard" subtitle="Selamat datang, lihat ikhtisar bisnis Anda hari ini" actions={[
            { label: 'Transaksi Baru', icon: 'plus-circle', href: '/transactions/new', primary: true },
            { label: 'Cetak Laporan', icon: 'printer', href: '/reports' }
        ]}/>
          
          {isLoadingStats ? (<div className="flex justify-center my-12">
              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>) : (<stats_overview_1.StatsOverview data={stats}/>)}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {isLoadingTransactions ? (<div className="flex justify-center my-12">
                  <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>) : (<recent_transactions_1.RecentTransactions data={recentTransactions}/>)}
              
              <service_packages_1.ServicePackages data={services}/>
            </div>
            
            <div className="space-y-6">
              <quick_actions_1.QuickActions />
              <low_inventory_1.LowInventory data={lowStockItems}/>
              <today_stats_1.TodayStats data={stats}/>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
