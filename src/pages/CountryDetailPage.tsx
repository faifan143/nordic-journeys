import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countriesApi, citiesApi } from '@/lib/api';
import { Country, City } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function CountryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: country, isLoading: countryLoading } = useQuery<Country>({
    queryKey: ['country', id],
    queryFn: () => countriesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ['cities', id],
    queryFn: () => citiesApi.getAll(id),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link to="/countries">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Countries
          </Link>
        </Button>

        {countryLoading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-3xl mb-8" />
            <div className="h-12 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ) : (
          <>
            {/* Country Hero */}
            <div className="mb-16">
              <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <img
                  src={country?.imageUrl || `https://picsum.photos/seed/${id}/1920/820`}
                  alt={country?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="mb-6">{country?.name}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {country?.description}
              </p>
            </div>

            {/* Cities Section */}
            <div>
              <h2 className="mb-8">Cities in {country?.name}</h2>
              {citiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="premium-card h-80 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cities?.map((city) => (
                    <Link
                      key={city.id}
                      to={`/cities/${city.id}`}
                      className="premium-card hover-lift group overflow-hidden"
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                        <img
                          src={city.imageUrl || `https://picsum.photos/seed/${city.id}/800/600`}
                          alt={city.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="text-2xl mb-3 group-hover:text-primary transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {city.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
