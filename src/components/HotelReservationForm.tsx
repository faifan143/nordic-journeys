import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
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
import { RoomType } from '@/types';

const reservationSchema = z.object({
  roomTypeId: z.string().min(1, 'Please select a room type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  guests: z.number().min(1, 'At least 1 guest is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type ReservationForm = z.infer<typeof reservationSchema>;

interface HotelReservationFormProps {
  roomTypes: RoomType[];
  hotelName: string;
}

export function HotelReservationForm({ roomTypes, hotelName }: HotelReservationFormProps) {
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

  const selectedRoomTypeId = watch('roomTypeId');
  const selectedRoomType = roomTypes.find((rt) => rt.id === selectedRoomTypeId);
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const guests = watch('guests') || 1;

  const calculateTotal = () => {
    if (!selectedRoomType || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return selectedRoomType.pricePerNight * nights;
  };

  const reservationMutation = useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => {
      toast.success('Reservation request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    },
  });

  const onSubmit = (data: ReservationForm) => {
    reservationMutation.mutate({
      roomTypeId: data.roomTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      guests: data.guests,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Reserve Now</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reserve at {hotelName}</DialogTitle>
          <DialogDescription>
            Fill in the details to make a reservation request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomTypeId">Room Type</Label>
            <select
              id="roomTypeId"
              {...register('roomTypeId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a room type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name} - ${roomType.pricePerNight}/night (Max {roomType.maxGuests} guests)
                </option>
              ))}
            </select>
            {errors.roomTypeId && (
              <p className="text-sm text-destructive">{errors.roomTypeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Check-in Date</Label>
              <Input
                id="startDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Check-out Date</Label>
              <Input
                id="endDate"
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={selectedRoomType?.maxGuests || 10}
              {...register('guests', { valueAsNumber: true })}
            />
            {errors.guests && (
              <p className="text-sm text-destructive">{errors.guests.message}</p>
            )}
            {selectedRoomType && (
              <p className="text-sm text-muted-foreground">
                Maximum {selectedRoomType.maxGuests} guests for this room type
              </p>
            )}
          </div>

          {selectedRoomType && startDate && endDate && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Room Type:</span>
                <span className="font-medium">{selectedRoomType.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Price per night:</span>
                <span className="font-medium">${selectedRoomType.pricePerNight}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Nights:</span>
                <span className="font-medium">
                  {Math.ceil(
                    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">${calculateTotal()}</span>
              </div>
            </div>
          )}

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

