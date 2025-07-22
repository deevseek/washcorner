import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { PageHeader } from '@/components/layout/page-header';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { ServicePackages } from '@/components/dashboard/service-packages';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { LowInventory } from '@/components/dashboard/low-inventory';
import { TodayStats } from '@/components/dashboard/today-stats';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    // Auto refresh setiap 5 detik untuk data dashboard
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    // Layanan jarang berubah, jadi refresh lebih jarang
    refetchInterval: 30000,
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['/api/inventory/low-stock'],
    // Refresh stok setiap 10 detik
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/transactions/recent'],
    // Auto refresh setiap 3 detik untuk transaksi terbaru
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <TopNav title="Dashboard" />
        
        <div className="container mx-auto px-4 py-6">
          <PageHeader 
            title="Dashboard" 
            subtitle="Selamat datang, lihat ikhtisar bisnis Anda hari ini" 
            actions={[
              { label: 'Transaksi Baru', icon: 'plus-circle', href: '/transactions/new', primary: true },
              { label: 'Cetak Laporan', icon: 'printer', href: '/reports' }
            ]} 
          />
          
          {isLoadingStats ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <StatsOverview data={stats} />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {isLoadingTransactions ? (
                <div className="flex justify-center my-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <RecentTransactions data={recentTransactions} />
              )}
              
              <ServicePackages data={services} />
            </div>
            
            <div className="space-y-6">
              <QuickActions />
              <LowInventory data={lowStockItems} />
              <TodayStats data={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
