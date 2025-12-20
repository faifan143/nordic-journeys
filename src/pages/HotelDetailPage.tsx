import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Hotel, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hotelsApi } from '@/lib/api';
import { Hotel as HotelType } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: hotel, isLoading: hotelLoading } = useQuery<HotelType>({
    queryKey: ['hotel', id],
    queryFn: () => hotelsApi.getOne(id!),
    enabled: !!id,
  });

  const { data: roomTypes, isLoading: roomTypesLoading } = useQuery({
    queryKey: ['roomTypes', id],
    queryFn: () => hotelsApi.getRoomTypes(id!),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link to={hotel?.cityId ? `/cities/${hotel.cityId}` : '/'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {hotel?.city?.name || 'City'}
          </Link>
        </Button>

        {hotelLoading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-3xl mb-8" />
            <div className="h-12 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ) : (
          <>
            {/* Hotel Header */}
            <div className="mb-12">
              <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <img
                  src={hotel?.imageUrl || `https://picsum.photos/seed/${id}/1920/820`}
                  alt={hotel?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <Hotel className="w-6 h-6 text-primary" />
                    <h1 className="mb-0">{hotel?.name}</h1>
                  </div>
                  
                  {hotel?.city && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{hotel.city.name}</span>
                    </div>
                  )}
                </div>

                {hotel?.pricePerNight && hotel.pricePerNight > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">
                      ${hotel.pricePerNight}
                    </div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                )}
              </div>

              <p className="text-xl text-muted-foreground max-w-3xl">
                {hotel?.description}
              </p>
            </div>

            {/* Room Types Section */}
            {roomTypes && roomTypes.length > 0 && (
              <div>
                <h2 className="mb-8">Available Room Types</h2>
                {roomTypesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="premium-card h-48 animate-pulse bg-muted" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roomTypes.map((roomType: any) => (
                      <div key={roomType.id} className="premium-card">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl mb-2">{roomType.name}</h3>
                            {roomType.description && (
                              <p className="text-muted-foreground mb-4">
                                {roomType.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary">
                              ${roomType.pricePerNight}
                            </div>
                            <div className="text-sm text-muted-foreground">per night</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Up to {roomType.maxGuests} guests</span>
                          </div>
                          {roomType.capacity && (
                            <span>{roomType.capacity} rooms available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

