import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plane, MapPin, Hotel as HotelIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tripsApi } from '@/lib/api';
import { Trip } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { TripReservationForm } from '@/components/TripReservationForm';
import { useAuthStore } from '@/store/authStore';
import { SafeImage } from '@/components/ui/safe-image';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();

  const { data: trip, isLoading: tripLoading } = useQuery<Trip>({
    queryKey: ['trip', id],
    queryFn: () => tripsApi.getOne(id!),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link to={trip?.cityId ? `/cities/${trip.cityId}` : '/'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {trip?.city?.name || 'City'}
          </Link>
        </Button>

        {tripLoading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-3xl mb-8" />
            <div className="h-12 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ) : (
          <>
            {/* Trip Header */}
            <div className="mb-12">
              <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <SafeImage
                  src={trip?.imageUrl}
                  fallbackSrc={`https://picsum.photos/seed/${id}/1920/820`}
                  alt={trip?.name || 'Trip'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <Plane className="w-6 h-6 text-primary" />
                    <h1 className="mb-0">{trip?.name}</h1>
                  </div>
                  
                  {trip?.city && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{trip.city.name}</span>
                    </div>
                  )}

                  {trip?.hotel && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <HotelIcon className="w-5 h-5" />
                      <span className="text-lg">{trip.hotel.name}</span>
                    </div>
                  )}
                </div>

                {trip?.price && trip.price > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">
                      ${trip.price}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                )}
              </div>

              <p className="text-xl text-muted-foreground max-w-3xl mb-6">
                {trip?.description}
              </p>

              {isAuthenticated && trip && (
                <div className="mt-6">
                  <TripReservationForm trip={trip} />
                </div>
              )}
            </div>

            {/* Activities Section */}
            {trip?.activities && trip.activities.length > 0 && (
              <div>
                <h2 className="mb-8">Included Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trip.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="premium-card"
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                        <SafeImage
                          src={activity.imageUrl}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-2xl mb-3">
                        {activity.name}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

