import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { reservationsApi, tripReservationsApi } from '@/lib/api';
import { Reservation, TripReservation } from '@/types';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import { format } from 'date-fns';

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export default function UserReservationsPage() {
  return (
    <ProtectedRoute>
      <UserReservationsContent />
    </ProtectedRoute>
  );
}

function UserReservationsContent() {
  const queryClient = useQueryClient();

  const { data: hotelReservations, isLoading: hotelLoading } = useQuery<Reservation[]>({
    queryKey: ['reservations', 'me'],
    queryFn: reservationsApi.getMyReservations,
  });

  const { data: tripReservations, isLoading: tripLoading } = useQuery<TripReservation[]>({
    queryKey: ['trip-reservations', 'me'],
    queryFn: tripReservationsApi.getMyReservations,
  });

  const cancelHotelMutation = useMutation({
    mutationFn: reservationsApi.cancelMyReservation,
    onSuccess: () => {
      toast.success('Reservation cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    },
  });

  const cancelTripMutation = useMutation({
    mutationFn: tripReservationsApi.cancelMyReservation,
    onSuccess: () => {
      toast.success('Reservation cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', 'me'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-16">
        <h1 className="mb-8">My Reservations</h1>

        {/* Hotel Reservations */}
        <div className="mb-12">
          <h2 className="mb-6">Hotel Reservations</h2>
          {hotelLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="premium-card h-32 animate-pulse bg-muted" />
              ))}
            </div>
          ) : hotelReservations && hotelReservations.length > 0 ? (
            <div className="space-y-4">
              {hotelReservations.map((reservation) => (
                <div key={reservation.id} className="premium-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">
                          {reservation.roomType.hotel?.name || 'Hotel'}
                        </h3>
                        <Badge
                          className={`${getStatusColor(reservation.status)} text-white`}
                        >
                          {reservation.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {reservation.roomType.name}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{reservation.guests} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">${reservation.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                    {reservation.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelHotelMutation.mutate(reservation.id)}
                        disabled={cancelHotelMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hotel reservations found.</p>
          )}
        </div>

        {/* Trip Reservations */}
        <div>
          <h2 className="mb-6">Trip Reservations</h2>
          {tripLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="premium-card h-32 animate-pulse bg-muted" />
              ))}
            </div>
          ) : tripReservations && tripReservations.length > 0 ? (
            <div className="space-y-4">
              {tripReservations.map((reservation) => (
                <div key={reservation.id} className="premium-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Link
                          to={`/trips/${reservation.trip.id}`}
                          className="text-xl font-semibold hover:text-primary transition-colors"
                        >
                          {reservation.trip.name}
                        </Link>
                        <Badge
                          className={`${getStatusColor(reservation.status)} text-white`}
                        >
                          {reservation.status}
                        </Badge>
                      </div>
                      {reservation.trip.city && (
                        <p className="text-muted-foreground mb-2">
                          {reservation.trip.city.name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{reservation.guests} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">
                            ${reservation.trip.price * reservation.guests}
                          </span>
                        </div>
                      </div>
                    </div>
                    {reservation.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelTripMutation.mutate(reservation.id)}
                        disabled={cancelTripMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No trip reservations found.</p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

