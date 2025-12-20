import { useQuery } from '@tanstack/react-query';
import { Globe, Building2, MapPinned, Zap, Users, DollarSign, TrendingUp, Hotel, Plane } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { dashboardApi } from '@/lib/api';
import { AdminDashboard as AdminDashboardType } from '@/types';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { RecentlyAddedPlaces } from '@/components/admin/dashboard/RecentlyAddedPlaces';
import { TopPopularPlaces } from '@/components/admin/dashboard/TopPopularPlaces';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: dashboard, isLoading, error } = useQuery<AdminDashboardType>({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardApi.getAdmin(),
    retry: 1,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <h1 className="mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your tourism platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="premium-card compact">
              <Skeleton className="h-20" />
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <h1 className="mb-2">Dashboard</h1>
          <p className="text-destructive">
            Failed to load dashboard data. Please try again later.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      label: 'Users',
      value: dashboard.statistics.users.total,
      sublabel: `${dashboard.statistics.users.admins} admins`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Countries',
      value: dashboard.statistics.content.countries,
      icon: Globe,
      color: 'text-green-600',
    },
    {
      label: 'Cities',
      value: dashboard.statistics.content.cities,
      icon: Building2,
      color: 'text-purple-600',
    },
    {
      label: 'Places',
      value: dashboard.statistics.content.places,
      icon: MapPinned,
      color: 'text-orange-600',
    },
    {
      label: 'Activities',
      value: dashboard.statistics.content.activities,
      icon: Zap,
      color: 'text-pink-600',
    },
    {
      label: 'Hotels',
      value: dashboard.statistics.content.hotels,
      icon: Hotel,
      color: 'text-indigo-600',
    },
    {
      label: 'Trips',
      value: dashboard.statistics.content.trips,
      icon: Plane,
      color: 'text-cyan-600',
    },
    {
      label: 'Revenue',
      value: `$${dashboard.statistics.revenue.total.toLocaleString()}`,
      sublabel: dashboard.statistics.revenue.growth > 0 
        ? `↑ ${dashboard.statistics.revenue.growth.toFixed(1)}%`
        : `↓ ${Math.abs(dashboard.statistics.revenue.growth).toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-emerald-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your tourism platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="premium-card compact">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.sublabel && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
                  )}
                </div>
                <Icon className={`w-10 h-10 ${stat.color} opacity-80`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reservation Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="premium-card compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Reservations</p>
              <p className="text-2xl font-bold">{dashboard.statistics.reservations.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.statistics.reservations.hotel} hotels, {dashboard.statistics.reservations.trip} trips
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 opacity-80" />
          </div>
        </div>
        <div className="premium-card compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold">{dashboard.statistics.reservations.pending}</p>
            </div>
          </div>
        </div>
        <div className="premium-card compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
              <p className="text-2xl font-bold">{dashboard.statistics.reservations.confirmed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <QuickActions />
      </div>

      <div className="mt-6">
        <RecentlyAddedPlaces />
      </div>

      <div className="mt-6">
        <TopPopularPlaces />
      </div>
    </AdminLayout>
  );
}
