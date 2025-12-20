import { Link } from 'react-router-dom';
import { MapPin, LogIn, Plane, Hotel, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { isAuthenticated, isAdmin, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <MapPin className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <span className="text-2xl font-bold text-foreground">Explore</span>
            </Link>

            <div className="flex items-center gap-2">
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  to="/countries" 
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
                >
                  Countries
                </Link>
                <Link 
                  to="/trips" 
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200 flex items-center gap-1.5"
                >
                  <Plane className="w-3.5 h-3.5" />
                  Trips
                </Link>
                <Link 
                  to="/hotels" 
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200 flex items-center gap-1.5"
                >
                  <Hotel className="w-3.5 h-3.5" />
                  Hotels
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/reservations" 
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200 flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Reservations
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
                  >
                    Admin
                  </Link>
                )}
              </nav>

              <div className="h-6 w-px bg-border mx-2 hidden md:block" />

              {isAuthenticated ? (
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  Logout
                </Button>
              ) : (
                <Button asChild size="sm" className="gap-2">
                  <Link to="/auth/login">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
