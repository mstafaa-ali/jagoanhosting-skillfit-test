import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Home, CreditCard, Wallet, LogOut, BarChart3, Sun, Moon, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { toast } from "sonner";
import { useState, useEffect } from 'react';

export function MainLayout({ children }) {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5 min-w-5" /> },
    { name: 'Penghuni', path: '/residents', icon: <Users className="w-5 h-5 min-w-5" /> },
    { name: 'Rumah', path: '/houses', icon: <Home className="w-5 h-5 min-w-5" /> },
    { name: 'Iuran', path: '/billings', icon: <CreditCard className="w-5 h-5 min-w-5" /> },
    { name: 'Pengeluaran', path: '/expenses', icon: <Wallet className="w-5 h-5 min-w-5" /> },
    { name: 'Laporan', path: '/reports', icon: <BarChart3 className="w-5 h-5 min-w-5" /> },
  ];
  
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-primary">RT Admin</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <nav className={`fixed inset-y-0 left-0 z-50 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-all duration-300 border-r bg-card flex flex-col shadow-sm ${isSidebarMinimized ? 'md:w-20 p-4 w-64' : 'w-64 p-6'}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 z-10 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className="hidden md:flex absolute -right-4 top-8 z-10 h-8 w-8 rounded-full shadow-sm"
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
        >
          {isSidebarMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        <div className={`mb-8 flex items-center ${isSidebarMinimized ? 'md:justify-center' : ''} mt-2 md:mt-0`}>
          <h2 className="text-2xl font-bold tracking-tight text-primary whitespace-nowrap overflow-hidden transition-all">
            {isSidebarMinimized ? (
              <>
                <span className="hidden md:inline">RT</span>
                <span className="inline md:hidden">RT Admin</span>
              </>
            ) : 'RT Admin'}
          </h2>
        </div>
        
        <div className="flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              title={isSidebarMinimized ? item.name : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-md transition-colors ${isSidebarMinimized ? 'md:justify-center md:px-2 px-4' : 'px-4'} ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              <span className={`truncate ${isSidebarMinimized ? 'md:hidden' : ''}`}>{item.name}</span>
            </Link>
          ))}
        </div>
        
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${isSidebarMinimized ? 'md:justify-center md:px-2' : 'justify-center w-full'}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={isSidebarMinimized ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 min-w-5" /> : <Moon className="w-5 h-5 min-w-5" />}
            <span className={isSidebarMinimized ? 'md:hidden' : ''}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>
          <Button 
            onClick={async () => {
              await logout();
              toast.success("Berhasil logout");
            }} 
            variant="outline" 
            className={`flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 ${isSidebarMinimized ? 'md:justify-center md:px-2' : 'justify-center w-full'}`}
            title={isSidebarMinimized ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 min-w-5" />
            <span className={isSidebarMinimized ? 'md:hidden' : ''}>Logout</span>
          </Button>
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
        {children}
      </main>
    </div>
  );
}
