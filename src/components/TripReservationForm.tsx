import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripReservationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trip } from '@/types';

const reservationSchema = z.object({
  guests: z.number().min(1, 'At least 1 guest is required'),
});

type ReservationForm = z.infer<typeof reservationSchema>;

interface TripReservationFormProps {
  trip: Trip;
}

export function TripReservationForm({ trip }: TripReservationFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guests: 1,
    },
  });

  const guests = watch('guests') || 1;
  const totalPrice = trip.price * guests;

  const reservationMutation = useMutation({
    mutationFn: tripReservationsApi.create,
    onSuccess: () => {
      toast.success('Reservation request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['trip-reservations'] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    },
  });

  const onSubmit = (data: ReservationForm) => {
    reservationMutation.mutate({
      tripId: trip.id,
      guests: data.guests,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Reserve Trip</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reserve {trip.name}</DialogTitle>
          <DialogDescription>
            Fill in the details to make a reservation request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              {...register('guests', { valueAsNumber: true })}
            />
            {errors.guests && (
              <p className="text-sm text-destructive">{errors.guests.message}</p>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Trip:</span>
              <span className="font-medium">{trip.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Price per person:</span>
              <span className="font-medium">${trip.price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Number of guests:</span>
              <span className="font-medium">{guests}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">${totalPrice}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={reservationMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={reservationMutation.isPending}>
              {reservationMutation.isPending ? 'Submitting...' : 'Submit Reservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

