import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import { hotelsApi } from '@/lib/api';
import { Hotel as HotelType } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function HotelsPage() {
  const { data: hotels, isLoading } = useQuery<HotelType[]>({
    queryKey: ['hotels'],
    queryFn: () => hotelsApi.getAll(),
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Hotel className="w-8 h-8 text-primary" />
            <h1 className="mb-0">All Hotels</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect place to stay for your next adventure
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
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
                <p className="text-sm text-muted-foreground mb-2">
                  {hotel.city?.name || 'Location'}
                </p>
                <p className="text-muted-foreground line-clamp-2">
                  {hotel.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No hotels available at the moment.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

