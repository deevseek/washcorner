import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface TodayStatsProps {
  data?: {
    income: number;
    customerCount: number;
    avgPerTransaction: number;
    newCustomers: number;
    avgWaitTime: number;
    queueCount: number;
  };
}

export function TodayStats({ data }: TodayStatsProps) {
  // Default values
  const stats = {
    income: data?.income ?? 0,
    customerCount: data?.customerCount ?? 0,
    avgPerTransaction: data?.avgPerTransaction ?? 0,
    newCustomers: data?.newCustomers ?? 0,
    avgWaitTime: data?.avgWaitTime ?? 15,
    queueCount: data?.queueCount ?? 0,
    queueCapacity: 12, // Assuming fixed capacity for now
  };
  
  // Calculate queue percentage
  const queuePercentage = (stats.queueCount / stats.queueCapacity) * 100;

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="text-base font-semibold">Statistik Hari Ini</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="divide-y divide-neutral-200">
          <div className="py-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Transaksi</span>
            <span className="font-medium">{stats.customerCount}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Rata-rata Per Transaksi</span>
            <span className="font-medium">{formatCurrency(stats.avgPerTransaction)}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Pelanggan</span>
            <span className="font-medium">{stats.customerCount}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Pelanggan Baru</span>
            <span className="font-medium">{stats.newCustomers}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Waktu Tunggu Rata-rata</span>
            <span className="font-medium">{stats.avgWaitTime} menit</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h4 className="text-sm font-medium mb-3">Antrian Saat Ini</h4>
          <div className="flex items-center">
            <div className="w-full bg-neutral-200 rounded-full h-2 mr-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${queuePercentage}%` }}
              />
            </div>
            <span className="text-sm whitespace-nowrap">
              {stats.queueCount} / {stats.queueCapacity}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
