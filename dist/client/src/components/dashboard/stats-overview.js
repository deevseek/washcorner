"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsOverview = StatsOverview;
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const StatsCard = ({ title, value, icon, iconBg, change }) => (<div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-secondary">{value}</h3>
        {change && (<div className="flex items-center mt-2 text-sm">
            <span className={`flex items-center ${change.isIncrease ? 'text-success' : 'text-destructive'}`}>
              {change.isIncrease ? (<lucide_react_1.TrendingUp className="mr-1 text-xs h-3 w-3"/>) : (<lucide_react_1.TrendingDown className="mr-1 text-xs h-3 w-3"/>)}
              <span>{Math.abs(change.value)}%</span>
            </span>
            <span className="text-gray-500 ml-2">vs kemarin</span>
          </div>)}
      </div>
      <div className={`${iconBg} p-3 rounded-full`}>
        {icon}
      </div>
    </div>
  </div>);
function StatsOverview({ data }) {
    // Default values until data loads
    const stats = {
        income: data?.income ?? 0,
        customerCount: data?.customerCount ?? 0,
        carCount: data?.carCount ?? 0,
        motorcycleCount: data?.motorcycleCount ?? 0,
    };
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="Total Pendapatan Hari Ini" value={(0, utils_1.formatCurrency)(stats.income)} icon={<lucide_react_1.DollarSign className="text-primary text-xl"/>} iconBg="bg-blue-100" change={{ value: 12.5, isIncrease: true }}/>
      
      <StatsCard title="Jumlah Pelanggan Hari Ini" value={stats.customerCount} icon={<lucide_react_1.Users className="text-success text-xl"/>} iconBg="bg-green-100" change={{ value: 8.3, isIncrease: true }}/>
      
      <StatsCard title="Mobil Dicuci Hari Ini" value={stats.carCount} icon={<lucide_react_1.Car className="text-accent text-xl"/>} iconBg="bg-cyan-100" change={{ value: 5.2, isIncrease: true }}/>
      
      <StatsCard title="Motor Dicuci Hari Ini" value={stats.motorcycleCount} icon={<lucide_react_1.Bike className="text-warning text-xl"/>} iconBg="bg-yellow-100" change={{ value: 3.1, isIncrease: false }}/>
    </div>);
}
