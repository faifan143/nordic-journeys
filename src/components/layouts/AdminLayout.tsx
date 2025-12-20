import { Link, useLocation } from 'react-router-dom';
import { MapPin, Home, Globe, Building2, MapPinned, Tag, Palette, Zap, Upload, LogOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/admin' },
  { icon: Globe, label: 'Countries', path: '/admin/countries' },
  { icon: Building2, label: 'Cities', path: '/admin/cities' },
  { icon: MapPinned, label: 'Places', path: '/admin/places' },
  { icon: Zap, label: 'Activities', path: '/admin/activities' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: Palette, label: 'Themes', path: '/admin/themes' },
  { icon: Upload, label: 'Uploads', path: '/admin/uploads' },
  { icon: Calendar, label: 'Reservations', path: '/admin/reservations' },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-10">
        <div className="p-6 border-b border-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <MapPin className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="mb-3 px-4">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
          </div>
          <Button onClick={logout} variant="outline" className="w-full" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content - Offset for fixed sidebar */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="container mx-auto p-6 admin-page">
          {children}
        </div>
      </main>
    </div>
  );
};
