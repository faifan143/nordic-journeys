import { Link } from 'react-router-dom';
import { MapPin, LogIn, Plane, Hotel } from 'lucide-react';
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

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/countries" className="text-muted-foreground hover:text-foreground transition-colors">
                Countries
              </Link>
              <Link to="/trips" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Plane className="w-4 h-4" />
                Trips
              </Link>
              <Link to="/hotels" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Hotel className="w-4 h-4" />
                Hotels
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth/login">
                    <LogIn className="w-4 h-4 mr-2" />
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

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Explore. Premium tourism platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
