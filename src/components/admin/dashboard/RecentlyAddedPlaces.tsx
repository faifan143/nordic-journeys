import { useQuery } from '@tanstack/react-query';
import { placesApi } from '@/lib/api';
import { Place } from '@/types';
import { formatDistanceToNow } from 'date-fns';

function formatDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function RecentlyAddedPlaces() {
  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: () => placesApi.getAll(),
  });

  const recentlyAdded = places
    ? [...places]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  if (isLoading) {
    return (
      <div className="premium-card">
        <h2 className="text-2xl font-bold mb-6">Recently Added Places</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-muted" />
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

  if (recentlyAdded.length === 0) {
    return (
      <div className="premium-card">
        <h2 className="text-2xl font-bold mb-6">Recently Added Places</h2>
        <p className="text-muted-foreground">No places added yet.</p>
      </div>
    );
  }

  return (
    <div className="premium-card">
      <h2 className="text-2xl font-bold mb-6">Recently Added Places</h2>
      <div className="space-y-4">
        {recentlyAdded.map((place, index) => (
          <div
            key={place.id}
            className={`flex items-center gap-4 pb-4 ${
              index < recentlyAdded.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              {place.images && place.images.length > 0 ? (
                <img
                  src={place.images[0]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${place.id}/64/64`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                  {place.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{place.name}</h3>
              <p className="text-sm text-muted-foreground">
                {place.city?.name || 'Unknown City'}
              </p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDate(place.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

