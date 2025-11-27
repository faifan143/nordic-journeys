import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { countriesApi } from '@/lib/api';
import { Country } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function CountriesPage() {
  const { data: countries, isLoading } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="mb-4">All Countries</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse through our collection of beautiful destinations
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="premium-card h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries?.map((country) => (
              <Link
                key={country.id}
                to={`/countries/${country.id}`}
                className="premium-card hover-lift group overflow-hidden"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                  <img
                    src={country.imageUrl || `https://picsum.photos/seed/${country.id}/800/600`}
                    alt={country.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl mb-3 group-hover:text-primary transition-colors">
                  {country.name}
                </h3>
                <p className="text-muted-foreground">
                  {country.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
