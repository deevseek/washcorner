"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePackages = ServicePackages;
const wouter_1 = require("wouter");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
function ServicePackages({ data = [] }) {
    // Get all services, show max 4
    const services = data.slice(0, 4);
    return (<card_1.Card>
      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row justify-between items-center">
        <card_1.CardTitle className="text-base font-semibold">Paket Layanan Populer</card_1.CardTitle>
        <wouter_1.Link href="/services" className="text-primary text-sm hover:underline">
          Kelola Paket
        </wouter_1.Link>
      </card_1.CardHeader>
      
      <card_1.CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.length === 0 ? (<div className="col-span-2 text-center py-10 text-gray-500">
              Belum ada paket layanan
            </div>) : (services.map((service) => (<div key={service.id} className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 overflow-hidden relative">
                  {service.imageUrl ? (<img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center bg-gray-100">
                      {service.vehicleType === 'car' ? (<lucide_react_1.Car className="w-12 h-12 text-gray-400"/>) : (<lucide_react_1.Bike className="w-12 h-12 text-gray-400"/>)}
                    </div>)}
                  
                  {service.isPopular && (<div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Paling Laris
                    </div>)}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{service.name}</h4>
                    <span className="text-primary font-bold">{(0, utils_1.formatCurrency)(service.price)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {service.description || 'Tidak ada deskripsi'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded">
                      {service.duration} menit
                    </span>
                    
                    {service.warranty > 0 && (<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Garansi {service.warranty} hari
                      </span>)}
                  </div>
                  
                  <button_1.Button className="w-full">
                    Pilih Paket
                  </button_1.Button>
                </div>
              </div>)))}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
