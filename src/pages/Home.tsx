import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countriesApi } from '@/lib/api';
import { Country } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function Home() {
  const { data: countries, isLoading } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });

  const featuredCountries = countries?.slice(0, 5) || [];

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

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="premium-card h-80 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCountries.map((country) => (
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
                  <p className="text-muted-foreground line-clamp-2">
                    {country.description}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && featuredCountries.length > 0 && (
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
    </PublicLayout>
  );
}
