import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Home, Globe, Building2, MapPinned, Tag, Palette, Zap, LogOut, Calendar, Bed, Plane, Menu, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const baseNavItems = [
  { icon: Home, label: 'Dashboard', path: '/admin' },
  { icon: Globe, label: 'Countries', path: '/admin/countries' },
  { icon: Building2, label: 'Cities', path: '/admin/cities' },
  { icon: MapPinned, label: 'Places', path: '/admin/places' },
  { icon: Zap, label: 'Activities', path: '/admin/activities' },
  { icon: Bed, label: 'Hotels', path: '/admin/hotels' },
  { icon: Plane, label: 'Trips', path: '/admin/trips' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: Palette, label: 'Themes', path: '/admin/themes' },
  { icon: Calendar, label: 'Reservations', path: '/admin/reservations' },
];

const adminOnlyNavItems = [
  { icon: Users, label: 'Subadmins', path: '/admin/subadmins' },
];

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const location = useLocation();
  const { logout, user, isAdmin } = useAuthStore();
  
  // Combine base nav items with admin-only items if user is admin
  const navItems = isAdmin 
    ? [...baseNavItems, ...adminOnlyNavItems]
    : baseNavItems;

  return (
    <>
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 group" onClick={onLinkClick}>
          <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <span className="text-lg md:text-xl font-bold">Admin Panel</span>
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
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="mb-3 px-2 md:px-4">
          <p className="text-xs md:text-sm text-muted-foreground">Logged in as</p>
          <p className="text-xs md:text-sm font-medium text-foreground truncate">{user?.email}</p>
        </div>
        <Button onClick={logout} variant="outline" className="w-full" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold">Admin Panel</span>
        </Link>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content - Offset for fixed sidebar on desktop */}
      <main className="flex-1 lg:ml-64 overflow-auto pt-16 lg:pt-0">
        <div className="container mx-auto p-4 md:p-6 admin-page">
          {children}
        </div>
      </main>
    </div>
  );
};
