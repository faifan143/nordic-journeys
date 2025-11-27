import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { activitiesApi } from '@/lib/api';
import { Activity } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: activity, isLoading } = useQuery<Activity>({
    queryKey: ['activity', id],
    queryFn: () => activitiesApi.getOne(id!),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link to={`/places/${activity?.placeId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Place
          </Link>
        </Button>

        {isLoading ? (
          <div className="animate-pulse max-w-3xl">
            <div className="h-12 bg-muted rounded w-2/3 mb-6" />
            <div className="h-6 bg-muted rounded w-full mb-3" />
            <div className="h-6 bg-muted rounded w-5/6" />
          </div>
        ) : (
          <div className="max-w-3xl">
            <h1 className="mb-6">{activity?.name}</h1>
            <p className="text-xl text-muted-foreground">
              {activity?.description}
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
