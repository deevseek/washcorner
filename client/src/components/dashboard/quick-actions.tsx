import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, CreditCard, BarChart, Package } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Pelanggan Baru',
      icon: <UserPlus className="text-2xl text-primary mb-2" />,
      href: '/customers?new=true',
    },
    {
      title: 'Transaksi',
      icon: <CreditCard className="text-2xl text-primary mb-2" />,
      href: '/transactions',
    },
    {
      title: 'Laporan',
      icon: <BarChart className="text-2xl text-primary mb-2" />,
      href: '/reports',
    },
    {
      title: 'Inventaris',
      icon: <Package className="text-2xl text-primary mb-2" />,
      href: '/inventory',
    },
  ];

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="text-base font-semibold">Aksi Cepat</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link 
              key={index} 
              href={action.href}
              className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded hover:bg-neutral-100 transition-colors"
            >
              {action.icon}
              <span className="text-sm text-center text-secondary">{action.title}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
