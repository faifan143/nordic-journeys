import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Hotel as HotelIcon, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { citiesApi, placesApi, hotelsApi, tripsApi } from '@/lib/api';
import { City, Place, Hotel, Trip } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function CityDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: city, isLoading: cityLoading } = useQuery<City>({
    queryKey: ['city', id],
    queryFn: () => citiesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: places, isLoading: placesLoading } = useQuery<Place[]>({
    queryKey: ['places', id],
    queryFn: () => placesApi.getAll(id),
    enabled: !!id,
  });

  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels', id],
    queryFn: () => hotelsApi.getAll(id),
    enabled: !!id,
  });

  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['trips', id],
    queryFn: () => tripsApi.getAll(id),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link to={`/countries/${city?.countryId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Country
          </Link>
        </Button>

        {cityLoading ? (
          <div className="animate-pulse">
            <div className="h-80 bg-muted rounded-3xl mb-8" />
            <div className="h-12 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ) : (
          <>
            {/* City Header */}
            <div className="mb-16">
              <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <img
                  src={city?.imageUrl || `https://picsum.photos/seed/${id}/1920/820`}
                  alt={city?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="mb-6">{city?.name}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {city?.description}
              </p>
            </div>

            {/* Places Section */}
            <div className="mb-16">
              <h2 className="mb-8">Places in {city?.name}</h2>
              {placesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="premium-card h-80 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : places && places.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {places.map((place) => (
                    <Link
                      key={place.id}
                      to={`/places/${place.id}`}
                      className="premium-card hover-lift group overflow-hidden"
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                        <img
                          src={place.images?.[0] || `https://picsum.photos/seed/${place.id}/800/600`}
                          alt={place.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="text-2xl mb-3 group-hover:text-primary transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {place.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No places available in this city.</p>
              )}
            </div>

            {/* Hotels Section */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <HotelIcon className="w-6 h-6 text-primary" />
                <h2 className="mb-0">Hotels in {city?.name}</h2>
              </div>
              {hotelsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="premium-card h-80 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : hotels && hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hotels.map((hotel) => (
                    <Link
                      key={hotel.id}
                      to={`/hotels/${hotel.id}`}
                      className="premium-card hover-lift group overflow-hidden"
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                        <img
                          src={hotel.imageUrl || `https://picsum.photos/seed/${hotel.id}/800/600`}
                          alt={hotel.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl group-hover:text-primary transition-colors flex-1">
                          {hotel.name}
                        </h3>
                        {hotel.pricePerNight > 0 && (
                          <span className="text-lg font-semibold text-primary ml-4">
                            ${hotel.pricePerNight}/night
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {hotel.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hotels available in this city.</p>
              )}
            </div>

            {/* Trips Section */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Plane className="w-6 h-6 text-primary" />
                <h2 className="mb-0">Trips in {city?.name}</h2>
              </div>
              {tripsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
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
                      <p className="text-muted-foreground line-clamp-2">
                        {trip.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No trips available in this city.</p>
              )}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
