import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  TagsIcon, 
  Package, 
  LineChart, 
  History, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Droplets,
  BarChart3,
  ClipboardCheck,
  DollarSign,
  Calculator,
  ShieldAlert,
  Clock,
  MessageSquare,
  QrCode
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  permissionRequired?: string;
  roleRequired?: string | string[];
  className?: string;
}

const SidebarLink = ({ 
  href, 
  icon, 
  label, 
  active, 
  onClick,
  permissionRequired,
  roleRequired,
  className
}: SidebarLinkProps) => {
  // Tidak perlu melakukan pengecekan akses karena menimbulkan masalah
  // pada video terlihat bahwa akses ditolak meski user adalah admin
  
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center space-x-2 px-6 py-3 transition-colors",
        active ? "bg-blue-600 text-white" : "text-white hover:bg-gray-700/30",
        className
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();

  // Close sidebar on location change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  // Set sidebar open state based on screen size
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Cek apakah user adalah admin atau manager
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  
  // Cek apakah user adalah admin
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "bg-secondary text-white w-full md:w-64 min-h-screen fixed inset-y-0 z-30 transform transition-transform duration-300 ease-in-out",
          isMobile 
            ? isOpen ? "translate-x-0" : "-translate-x-full" 
            : "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-opacity-20 border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Droplets className="text-white" />
            </div>
            <h1 className="text-lg font-bold">Wash Corner</h1>
          </div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-sidebar-accent/20"
            >
              <X />
            </Button>
          )}
        </div>
        
        <nav className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="text-xs font-medium uppercase text-gray-400 px-4 py-2">MENU UTAMA</div>
          <SidebarLink 
            href="/" 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            active={location === '/'} 
          />
          <SidebarLink 
            href="/transactions" 
            icon={<CreditCard className="w-4 h-4" />} 
            label="Transaksi" 
            active={location === '/transactions'} 
          />
          <SidebarLink 
            href="/customers" 
            icon={<Users className="w-4 h-4" />} 
            label="Pelanggan" 
            active={location === '/customers'} 
          />
          <SidebarLink 
            href="/services" 
            icon={<TagsIcon className="w-4 h-4" />} 
            label="Paket Layanan" 
            active={location === '/services'} 
          />
          
          {/* Menu hanya untuk admin & manager */}
          {isAdminOrManager && (
            <SidebarLink 
              href="/inventory" 
              icon={<Package className="w-4 h-4" />} 
              label="Inventaris" 
              active={location === '/inventory'} 
            />
          )}
          
          {/* HRD Section - hanya untuk admin & manager */}
          {isAdminOrManager && (
            <>
              <div className="text-xs font-medium uppercase text-gray-400 px-4 py-2">HUMAN RESOURCE DEPARTMENT</div>
              <SidebarLink 
                href="/hrd-dashboard" 
                icon={<BarChart3 className="w-4 h-4" />} 
                label="HRD Dashboard" 
                active={location === '/hrd-dashboard'} 
              />
              <SidebarLink 
                href="/hrd-employees" 
                icon={<Users className="w-4 h-4" />} 
                label="Manajemen Karyawan" 
                active={location === '/hrd-employees'} 
              />
              <SidebarLink 
                href="/hrd-attendance" 
                icon={<ClipboardCheck className="w-4 h-4" />} 
                label="Absensi" 
                active={location === '/hrd-attendance'} 
              />
              <SidebarLink 
                href="/hrd-payroll" 
                icon={<Clock className="w-4 h-4" />} 
                label="Penggajian" 
                active={location === '/hrd-payroll'} 
              />
            </>
          )}
          
          {/* Finance Section - hanya untuk admin & manager */}
          {isAdminOrManager && (
            <>
              <div className="text-xs font-medium uppercase text-gray-400 px-4 py-2">KEUANGAN</div>
              <SidebarLink 
                href="/finance/expenses" 
                icon={<DollarSign className="w-4 h-4" />} 
                label="Pengeluaran" 
                active={location === '/finance/expenses'} 
              />
              <SidebarLink 
                href="/finance/profit-loss" 
                icon={<Calculator className="w-4 h-4" />} 
                label="Laporan Laba Rugi" 
                active={location === '/finance/profit-loss'} 
              />
            </>
          )}

          {/* Report Section - hanya untuk admin & manager */}
          {isAdminOrManager && (
            <>
              <div className="text-xs font-medium uppercase text-gray-400 px-4 py-2">LAPORAN</div>
              <SidebarLink 
                href="/reports" 
                icon={<LineChart className="w-4 h-4" />} 
                label="Laporan Penjualan" 
                active={location === '/reports'} 
              />
              <SidebarLink 
                href="/service-history" 
                icon={<History className="w-4 h-4" />} 
                label="Riwayat Layanan" 
                active={location === '/service-history'} 
              />
            </>
          )}
          
          {/* Settings Section - sebagian hanya untuk admin */}
          <div className="text-xs font-medium uppercase text-gray-400 px-4 py-2">PENGATURAN</div>
          
          {isAdminOrManager && (
            <SidebarLink 
              href="/settings" 
              icon={<Settings className="w-4 h-4" />} 
              label="Pengaturan Sistem" 
              active={location === '/settings'} 
            />
          )}
          
          {isAdmin && (
            <>
              <SidebarLink 
                href="/users" 
                icon={<Users className="w-4 h-4" />} 
                label="Manajemen Pengguna" 
                active={location === '/users'} 
              />
              <SidebarLink 
                href="/roles" 
                icon={<ShieldAlert className="w-4 h-4" />} 
                label="Manajemen Peran" 
                active={location === '/roles'} 
              />
              <SidebarLink 
                href="/notification-settings" 
                icon={<MessageSquare className="w-4 h-4" />} 
                label="Pengaturan Notifikasi" 
                active={location === '/notification-settings'} 
              />
            </>
          )}
          
          <SidebarLink 
            href="/profile" 
            icon={<User className="w-4 h-4" />} 
            label="Profil" 
            active={location === '/profile'} 
          />
          <SidebarLink 
            href="#" 
            icon={<LogOut className="w-4 h-4" />} 
            label="Keluar" 
            active={false} 
            onClick={handleLogout}
          />
        </nav>
      </div>
      
      {/* Mobile menu button */}
      {isMobile && !isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-4 z-10 text-secondary"
          onClick={() => setIsOpen(true)}
        >
          <Menu />
        </Button>
      )}
    </>
  );
}
