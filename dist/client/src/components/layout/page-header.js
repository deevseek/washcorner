"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHeader = PageHeader;
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
// Map action icons to their components
const iconMap = {
    'plus-circle': lucide_react_1.PlusCircle,
    'printer': lucide_react_1.Printer,
    'upload': lucide_react_1.Upload,
    'download': lucide_react_1.Download,
    'settings': lucide_react_1.Settings,
    'user-plus': lucide_react_1.UserPlus,
    'package-plus': lucide_react_1.PackagePlus,
    'trash-2': lucide_react_1.Trash2,
};
function PageHeader({ title, subtitle, actions = [] }) {
    return (<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      {actions.length > 0 && (<div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          {actions.map((action, index) => {
                const Icon = action.icon ? iconMap[action.icon] : undefined;
                return (<button_1.Button key={index} variant={action.primary ? "default" : "outline"} onClick={action.onClick} disabled={action.disabled} asChild={!!action.href}>
                {action.href ? (<a href={action.href} className="flex items-center">
                    {Icon && <Icon className="mr-2 h-4 w-4"/>}
                    <span>{action.label}</span>
                  </a>) : (<>
                    {Icon && <Icon className="mr-2 h-4 w-4"/>}
                    <span>{action.label}</span>
                  </>)}
              </button_1.Button>);
            })}
        </div>)}
    </div>);
}
