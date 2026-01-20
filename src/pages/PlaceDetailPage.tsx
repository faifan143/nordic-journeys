import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { placesApi, activitiesApi } from '@/lib/api';
import { Place, Activity } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { SafeImage } from '@/components/ui/safe-image';
import { getFullImageUrl } from '@/lib/utils';

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: place, isLoading: placeLoading } = useQuery<Place>({
    queryKey: ['place', id],
    queryFn: () => placesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['activities', id],
    queryFn: () => activitiesApi.getAll(id),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link to={`/cities/${place?.cityId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to City
          </Link>
        </Button>

        {placeLoading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-3xl mb-8" />
            <div className="h-12 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ) : (
          <>
            {/* Place Gallery */}
            <div className="mb-12">
              {place?.imageUrls && place.imageUrls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {place.imageUrls.map((image, idx) => (
                    <div
                      key={idx}
                      className={`rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${
                        idx === 0 ? 'md:col-span-2 lg:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                      }`}
                    >
                      <SafeImage
                        src={image}
                        alt={`${place.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-8">
                  <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <SafeImage
                      src={null}
                      fallbackSrc={`https://picsum.photos/seed/${id}/1920/820`}
                      alt={place?.name || 'Place'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <h1 className="mb-6">{place?.name}</h1>
              
              {/* Categories and Themes */}
              <div className="flex flex-wrap gap-2 mb-6">
                {place?.categories?.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="text-base px-4 py-2">
                    {cat.name}
                  </Badge>
                ))}
                {place?.themes?.map((theme) => (
                  <Badge key={theme.id} variant="outline" className="text-base px-4 py-2">
                    {theme.name}
                  </Badge>
                ))}
              </div>

              <p className="text-xl text-muted-foreground max-w-3xl">
                {place?.description}
              </p>
            </div>

            {/* Activities Section */}
            <div>
              <h2 className="mb-8">Activities</h2>
              {activitiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="premium-card h-48 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities?.map((activity) => (
                    <div
                      key={activity.id}
                      className="premium-card"
                    >
                      <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                        <SafeImage
                          src={activity.imageUrl}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg mb-1.5">
                        {activity.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
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
