"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickActions = QuickActions;
const wouter_1 = require("wouter");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function QuickActions() {
    const actions = [
        {
            title: 'Pelanggan Baru',
            icon: <lucide_react_1.UserPlus className="text-2xl text-primary mb-2"/>,
            href: '/customers?new=true',
        },
        {
            title: 'Transaksi',
            icon: <lucide_react_1.CreditCard className="text-2xl text-primary mb-2"/>,
            href: '/transactions',
        },
        {
            title: 'Laporan',
            icon: <lucide_react_1.BarChart className="text-2xl text-primary mb-2"/>,
            href: '/reports',
        },
        {
            title: 'Inventaris',
            icon: <lucide_react_1.Package className="text-2xl text-primary mb-2"/>,
            href: '/inventory',
        },
    ];
    return (<card_1.Card>
      <card_1.CardHeader className="px-6 py-4 border-b border-neutral-200">
        <card_1.CardTitle className="text-base font-semibold">Aksi Cepat</card_1.CardTitle>
      </card_1.CardHeader>
      
      <card_1.CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (<wouter_1.Link key={index} href={action.href} className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded hover:bg-neutral-100 transition-colors">
              {action.icon}
              <span className="text-sm text-center text-secondary">{action.title}</span>
            </wouter_1.Link>))}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
