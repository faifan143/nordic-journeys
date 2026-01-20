import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import CityDetailPage from './pages/CityDetailPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import UserReservationsPage from './pages/UserReservationsPage';
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CountriesAdmin from './pages/admin/CountriesAdmin';
import CitiesAdmin from './pages/admin/CitiesAdmin';
import PlacesAdmin from './pages/admin/PlacesAdmin';
import ActivitiesAdmin from './pages/admin/ActivitiesAdmin';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import ThemesAdmin from './pages/admin/ThemesAdmin';
import UploadsAdmin from './pages/admin/UploadsAdmin';
import ReservationsAdmin from './pages/admin/ReservationsAdmin';
import HotelsAdmin from './pages/admin/HotelsAdmin';
import TripsAdmin from './pages/admin/TripsAdmin';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/countries" element={<CountriesPage />} />
            <Route path="/countries/:id" element={<CountryDetailPage />} />
            <Route path="/cities/:id" element={<CityDetailPage />} />
            <Route path="/places/:id" element={<PlaceDetailPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <UserReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/countries"
              element={
                <ProtectedRoute requireAdmin>
                  <CountriesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cities"
              element={
                <ProtectedRoute requireAdmin>
                  <CitiesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/places"
              element={
                <ProtectedRoute requireAdmin>
                  <PlacesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activities"
              element={
                <ProtectedRoute requireAdmin>
                  <ActivitiesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requireAdmin>
                  <CategoriesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/themes"
              element={
                <ProtectedRoute requireAdmin>
                  <ThemesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/uploads"
              element={
                <ProtectedRoute requireAdmin>
                  <UploadsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <ProtectedRoute requireAdmin>
                  <ReservationsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotels"
              element={
                <ProtectedRoute requireAdmin>
                  <HotelsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trips"
              element={
                <ProtectedRoute requireAdmin>
                  <TripsAdmin />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
