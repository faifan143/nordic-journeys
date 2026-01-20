import { useQuery } from '@tanstack/react-query';
import { placesApi } from '@/lib/api';
import { Place } from '@/types';
import { Badge } from '@/components/ui/badge';

// Since there's no popularity field, we'll use a mock popularity based on name length
// In a real app, this would come from the backend
function calculatePopularity(place: Place): number {
  // Mock popularity: combine name length, description length, and number of images
  const baseScore = (place.name?.length || 0) * 2;
  const descScore = (place.description?.length || 0) / 10;
  const imageScore = (place.imageUrls?.length || 0) * 5;
  return Math.round(baseScore + descScore + imageScore);
}

export function TopPopularPlaces() {
  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: () => placesApi.getAll(),
  });

  const topPopular = places
    ? [...places]
        .map((place) => ({
          place,
          popularity: calculatePopularity(place),
        }))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
    : [];

  if (isLoading) {
    return (
      <div className="premium-card compact bg-gradient-to-br from-[#CFE4F4] to-[#E8EEF2]">
        <h2 className="text-xl font-bold mb-4">Top Popular Places</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topPopular.length === 0) {
    return (
      <div className="premium-card compact bg-gradient-to-br from-[#CFE4F4] to-[#E8EEF2]">
        <h2 className="text-xl font-bold mb-4">Top Popular Places</h2>
        <p className="text-muted-foreground text-sm">No places available yet.</p>
      </div>
    );
  }

  return (
    <div className="premium-card compact bg-gradient-to-br from-[#CFE4F4] to-[#E8EEF2]">
      <h2 className="text-xl font-bold mb-4">Top Popular Places</h2>
      <div className="space-y-3">
        {topPopular.map(({ place, popularity }, index) => (
          <div
            key={place.id}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{place.name}</h3>
              <p className="text-xs text-muted-foreground">
                {place.city?.name || 'Unknown City'}
              </p>
            </div>
            <Badge variant="secondary" className="font-semibold text-xs">
              {popularity} pts
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

