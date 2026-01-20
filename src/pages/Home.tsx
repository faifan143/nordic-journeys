import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Hotel as HotelIcon, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countriesApi, tripsApi, hotelsApi } from '@/lib/api';
import { Country, Trip, Hotel } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { SafeImage } from '@/components/ui/safe-image';

export default function Home() {
  const { data: countries, isLoading: countriesLoading } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });

  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['trips', 'featured'],
    queryFn: () => tripsApi.getAll(),
  });

  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels', 'featured'],
    queryFn: () => hotelsApi.getAll(),
  });

  const featuredCountries = countries?.slice(0, 6) || [];
  const featuredTrips = trips?.slice(0, 6) || [];
  const featuredHotels = hotels?.slice(0, 6) || [];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card text-sm font-medium shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Discover your next adventure</span>
            </div>
            
            <h1 className="text-foreground">
              Explore the World's Most Beautiful Destinations
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Curated travel recommendations for unforgettable experiences around the globe.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full text-base px-8">
                <Link to="/countries">
                  Browse Countries
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Countries */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="mb-4">Featured Destinations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start your journey with our most popular countries
            </p>
          </div>

          {countriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="premium-card h-56 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCountries.map((country) => (
                <Link
                  key={country.id}
                  to={`/countries/${country.id}`}
                  className="premium-card hover-lift group overflow-hidden"
                >
                  <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                    <SafeImage
                      src={country.imageUrl}
                      fallbackSrc={`https://picsum.photos/seed/${country.id}/800/600`}
                      alt={country.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-lg mb-1.5 group-hover:text-primary transition-colors">
                    {country.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {country.description}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {!countriesLoading && featuredCountries.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/countries">
                  View All Countries
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-primary" />
              <h2 className="mb-0">Featured Trips</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover curated travel packages for amazing experiences
            </p>
          </div>

          {tripsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="premium-card h-56 animate-pulse bg-muted" />
              ))}
            </div>
          ) : featuredTrips.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="premium-card hover-lift group overflow-hidden"
                  >
                    <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                      <SafeImage
                        src={trip.imageUrl}
                        fallbackSrc={`https://picsum.photos/seed/${trip.id}/800/600`}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-lg group-hover:text-primary transition-colors flex-1">
                        {trip.name}
                      </h3>
                      {trip.price > 0 && (
                        <span className="text-base font-bold text-primary ml-3">
                          ${trip.price}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {trip.city?.name || 'Destination'}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {trip.description}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/trips">
                    View All Trips
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No trips available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <HotelIcon className="w-6 h-6 text-primary" />
              <h2 className="mb-0">Featured Hotels</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect place to stay for your next adventure
            </p>
          </div>

          {hotelsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="premium-card h-56 animate-pulse bg-muted" />
              ))}
            </div>
          ) : featuredHotels.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredHotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    to={`/hotels/${hotel.id}`}
                    className="premium-card hover-lift group overflow-hidden"
                  >
                    <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                      <SafeImage
                        src={hotel.imageUrl}
                        fallbackSrc={`https://picsum.photos/seed/${hotel.id}/800/600`}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-lg group-hover:text-primary transition-colors flex-1">
                        {hotel.name}
                      </h3>
                      {hotel.pricePerNight > 0 && (
                        <span className="text-sm font-semibold text-primary ml-3">
                          ${hotel.pricePerNight}/night
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {hotel.city?.name || 'Location'}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {hotel.description}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/hotels">
                    View All Hotels
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hotels available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
