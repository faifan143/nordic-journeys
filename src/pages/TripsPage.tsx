import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { tripsApi } from '@/lib/api';
import { Trip } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function TripsPage() {
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => tripsApi.getAll(),
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Plane className="w-8 h-8 text-primary" />
            <h1 className="mb-0">All Trips</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated travel packages for unforgettable experiences
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="premium-card h-80 animate-pulse bg-muted" />
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="premium-card hover-lift group overflow-hidden"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                  <img
                    src={trip.imageUrl || `https://picsum.photos/seed/${trip.id}/800/600`}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl group-hover:text-primary transition-colors flex-1">
                    {trip.name}
                  </h3>
                  {trip.price > 0 && (
                    <span className="text-xl font-bold text-primary ml-4">
                      ${trip.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {trip.city?.name || 'Destination'}
                </p>
                <p className="text-muted-foreground line-clamp-2">
                  {trip.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No trips available at the moment.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

