import { useQuery } from '@tanstack/react-query';
import { Globe, Building2, MapPinned, Zap } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { countriesApi, citiesApi, placesApi, activitiesApi } from '@/lib/api';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { RecentlyAddedPlaces } from '@/components/admin/dashboard/RecentlyAddedPlaces';
import { TopPopularPlaces } from '@/components/admin/dashboard/TopPopularPlaces';

export default function AdminDashboard() {
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getAll(),
  });

  const { data: places } = useQuery({
    queryKey: ['places'],
    queryFn: () => placesApi.getAll(),
  });

  const { data: activities } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesApi.getAll(),
  });

  const stats = [
    {
      label: 'Countries',
      value: countries?.length || 0,
      icon: Globe,
      color: 'text-blue-600',
    },
    {
      label: 'Cities',
      value: cities?.length || 0,
      icon: Building2,
      color: 'text-green-600',
    },
    {
      label: 'Places',
      value: places?.length || 0,
      icon: MapPinned,
      color: 'text-purple-600',
    },
    {
      label: 'Activities',
      value: activities?.length || 0,
      icon: Zap,
      color: 'text-orange-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Overview of your tourism platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="premium-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`w-12 h-12 ${stat.color} opacity-80`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <QuickActions />
      </div>

      <div className="mt-10">
        <RecentlyAddedPlaces />
      </div>

      <div className="mt-10">
        <TopPopularPlaces />
      </div>
    </AdminLayout>
  );
}
