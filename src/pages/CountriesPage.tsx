import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { countriesApi } from '@/lib/api';
import { Country } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { SafeImage } from '@/components/ui/safe-image';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/use-pagination';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: countries, isLoading } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });

  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    if (!searchQuery.trim()) return countries;
    
    const query = searchQuery.toLowerCase().trim();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.description?.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination(filteredCountries, 9);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the start
        pages.push(2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }

    return (
      <Pagination className="mt-12">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={previousPage} className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
          
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => goToPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext onClick={nextPage} className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="mb-4">All Countries</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Browse through our collection of beautiful destinations
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search countries by name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                goToPage(1); // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="premium-card h-56 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? `No countries found matching "${searchQuery}"` : 'No countries available at the moment.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedItems.map((country) => (
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
            {renderPagination()}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
