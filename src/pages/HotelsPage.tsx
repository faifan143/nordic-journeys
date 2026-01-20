import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Hotel, Search, X } from 'lucide-react';
import { hotelsApi, citiesApi, countriesApi } from '@/lib/api';
import { Hotel as HotelType, City, Country } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { SafeImage } from '@/components/ui/safe-image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function HotelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  const { data: hotels, isLoading } = useQuery<HotelType[]>({
    queryKey: ['hotels'],
    queryFn: () => hotelsApi.getAll(),
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getAll(),
  });

  const { data: countries } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: () => countriesApi.getAll(),
  });

  // Get unique cities from hotels data
  const availableCities = useMemo(() => {
    if (!hotels || !cities) return [];
    const hotelCityIds = new Set(hotels.map(h => h.cityId).filter(Boolean));
    return cities.filter(city => hotelCityIds.has(city.id));
  }, [hotels, cities]);

  // Filter cities by selected country
  const filteredCities = useMemo(() => {
    if (!selectedCountry) return availableCities;
    return availableCities.filter(city => city.countryId === selectedCountry);
  }, [availableCities, selectedCountry]);

  const filteredHotels = useMemo(() => {
    if (!hotels) return [];
    
    let filtered = hotels;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(query) ||
          hotel.description?.toLowerCase().includes(query) ||
          hotel.city?.name.toLowerCase().includes(query)
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(hotel => hotel.cityId === selectedCity);
    }

    // Country filter (through city)
    if (selectedCountry && !selectedCity) {
      filtered = filtered.filter(hotel => hotel.city?.countryId === selectedCountry);
    }

    // Price filters
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(hotel => hotel.pricePerNight >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(hotel => hotel.pricePerNight <= max);
      }
    }

    return filtered;
  }, [hotels, searchQuery, selectedCity, selectedCountry, minPrice, maxPrice]);

  const hasActiveFilters = selectedCity || selectedCountry || minPrice || maxPrice;

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination(filteredHotels, 9);

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedCountry('');
    setMinPrice('');
    setMaxPrice('');
    goToPage(1);
  };

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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Hotel className="w-8 h-8 text-primary" />
            <h1 className="mb-0">All Hotels</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Find the perfect place to stay for your next adventure
          </p>
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search hotels by name, description, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                goToPage(1); // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {/* Country Filter */}
              <Select value={selectedCountry || 'all'} onValueChange={(value) => {
                setSelectedCountry(value === 'all' ? '' : value);
                setSelectedCity(''); // Reset city when country changes
                goToPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries?.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select 
                value={selectedCity || 'all'} 
                onValueChange={(value) => {
                  setSelectedCity(value === 'all' ? '' : value);
                  goToPage(1);
                }}
                disabled={!selectedCountry && filteredCities.length === 0}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Min Price Filter */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    goToPage(1);
                  }}
                  className="w-[120px]"
                  min="0"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    goToPage(1);
                  }}
                  className="w-[120px]"
                  min="0"
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="premium-card h-56 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery || hasActiveFilters 
                ? `No hotels found matching your criteria.` 
                : 'No hotels available at the moment.'}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4 gap-2"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedItems.map((hotel) => (
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
            {renderPagination()}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

