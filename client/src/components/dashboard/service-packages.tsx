import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Car, Bike } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  vehicleType: string;
  isPopular: boolean;
  isActive: boolean | null;
  warranty: number;
  imageUrl?: string;
}

interface ServicePackagesProps {
  data?: Service[];
}

export function ServicePackages({ data = [] }: ServicePackagesProps) {
  // Get all services, show max 4
  const services = data.slice(0, 4);

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-semibold">Paket Layanan Populer</CardTitle>
        <Link href="/services" className="text-primary text-sm hover:underline">
          Kelola Paket
        </Link>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500">
              Belum ada paket layanan
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 overflow-hidden relative">
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      {service.vehicleType === 'car' ? (
                        <Car className="w-12 h-12 text-gray-400" />
                      ) : (
                        <Bike className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                  )}
                  
                  {service.isPopular && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Paling Laris
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{service.name}</h4>
                    <span className="text-primary font-bold">{formatCurrency(service.price)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {service.description || 'Tidak ada deskripsi'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded">
                      {service.duration} menit
                    </span>
                    
                    {service.warranty > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Garansi {service.warranty} hari
                      </span>
                    )}
                  </div>
                  
                  <Button className="w-full">
                    Pilih Paket
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
