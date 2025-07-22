import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Printer, 
  Upload, 
  Download, 
  Settings, 
  UserPlus, 
  PackagePlus,
  Trash2,
  LucideIcon
} from 'lucide-react';

// Map action icons to their components
const iconMap: Record<string, LucideIcon> = {
  'plus-circle': PlusCircle,
  'printer': Printer,
  'upload': Upload,
  'download': Download,
  'settings': Settings,
  'user-plus': UserPlus,
  'package-plus': PackagePlus,
  'trash-2': Trash2,
};

interface PageAction {
  label: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageAction[];
}

export function PageHeader({ title, subtitle, actions = [] }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      {actions.length > 0 && (
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon ? iconMap[action.icon] : undefined;
            
            return (
              <Button
                key={index}
                variant={action.primary ? "default" : "outline"}
                onClick={action.onClick}
                disabled={action.disabled}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href} className="flex items-center">
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{action.label}</span>
                  </a>
                ) : (
                  <>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{action.label}</span>
                  </>
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
