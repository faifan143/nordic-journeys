import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reservationsApi, tripReservationsApi } from '@/lib/api';
import { Reservation, TripReservation } from '@/types';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { toast } from 'sonner';
import { format } from 'date-fns';

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export default function ReservationsAdmin() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="mb-2">Reservations Management</h1>
        <p className="text-muted-foreground">
          Manage all hotel and trip reservations
        </p>
      </div>

      <Tabs defaultValue="hotels" className="w-full">
        <TabsList>
          <TabsTrigger value="hotels">Hotel Reservations</TabsTrigger>
          <TabsTrigger value="trips">Trip Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="hotels">
          <HotelReservationsTab />
        </TabsContent>

        <TabsContent value="trips">
          <TripReservationsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function HotelReservationsTab() {
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ['reservations'],
    queryFn: reservationsApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Reservation status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update reservation status');
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

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="premium-card h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-muted-foreground">No hotel reservations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {reservations.map((reservation) => (
        <div key={reservation.id} className="premium-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold">
                  {reservation.roomType?.hotel?.name || 'Hotel'}
                </h3>
                <Badge className={`${getStatusColor(reservation.status)} text-white`}>
                  {reservation.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium">
                    {reservation.roomType?.name || 'N/A'}
                    {reservation.room && (
                      <span className="block text-xs text-muted-foreground">
                        Room {reservation.room.roomNumber || reservation.room.id.slice(-6)}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guest</p>
                  <p className="font-medium">
                    {reservation.user?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-medium text-sm">
                    {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">${reservation.totalPrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{reservation.guests} guests</span>
              </div>
            </div>
            {reservation.status === 'PENDING' && (
              <div className="flex gap-2 ml-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: reservation.id, status: 'CONFIRMED' })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: reservation.id, status: 'CANCELLED' })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TripReservationsTab() {
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery<TripReservation[]>({
    queryKey: ['trip-reservations'],
    queryFn: tripReservationsApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' }) =>
      tripReservationsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Reservation status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['trip-reservations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update reservation status');
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

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="premium-card h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-muted-foreground">No trip reservations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {reservations.map((reservation) => (
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
                <Badge className={`${getStatusColor(reservation.status)} text-white`}>
                  {reservation.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Guest</p>
                  <p className="font-medium">
                    {reservation.user?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {reservation.trip.city?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">
                    ${reservation.trip.price * reservation.guests}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{reservation.guests} guests</span>
              </div>
            </div>
            {reservation.status === 'PENDING' && (
              <div className="flex gap-2 ml-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: reservation.id, status: 'CONFIRMED' })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: reservation.id, status: 'CANCELLED' })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

