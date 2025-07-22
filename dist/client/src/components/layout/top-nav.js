"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopNav = TopNav;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const use_auth_1 = require("@/hooks/use-auth");
const avatar_1 = require("@/components/ui/avatar");
const input_1 = require("@/components/ui/input");
const utils_1 = require("@/lib/utils");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function TopNav({ title = 'Dashboard' }) {
    const { user, logoutMutation } = (0, use_auth_1.useAuth)();
    const [notifications] = (0, react_1.useState)(3); // For demo purposes
    return (<div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-secondary ml-10 md:ml-0">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
            <input_1.Input type="text" placeholder="Cari..." className="pl-10 pr-4 py-2 w-64"/>
          </div>
          
          <div className="relative">
            <button className="text-secondary focus:outline-none p-2">
              <lucide_react_1.Bell className="h-5 w-5"/>
              {notifications > 0 && (<span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications}
                </span>)}
            </button>
          </div>
          
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <avatar_1.Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <avatar_1.AvatarFallback>{user ? (0, utils_1.getInitials)(user.name) : 'U'}</avatar_1.AvatarFallback>
                </avatar_1.Avatar>
                <span className="text-secondary font-medium hidden md:inline">
                  {user?.name || 'User'}
                </span>
              </div>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuLabel>Akun Saya</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                <lucide_react_1.User className="w-4 h-4 mr-2"/>
                <span>Profil</span>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <lucide_react_1.Settings className="w-4 h-4 mr-2"/>
                <span>Pengaturan</span>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <span>Keluar</span>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>
    </div>);
}
