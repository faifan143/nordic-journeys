import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { tripsApi, citiesApi, hotelsApi, activitiesApi } from '@/lib/api';
import { Trip, City, Hotel, Activity } from '@/types';
import { toast } from 'sonner';

export default function TripsAdmin() {
  const [open, setOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cityId: '',
    hotelId: '',
    price: '',
    activityIds: [] as string[],
    imageUrl: '',
  });

  const queryClient = useQueryClient();

  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => tripsApi.getAll(),
  });

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedTrips,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(trips || [], 10);

  const { data: cities } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getAll(),
  });

  const { data: hotels } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: () => hotelsApi.getAll(),
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: () => activitiesApi.getAll(),
  });

  // Filter hotels by selected city
  const availableHotels = formData.cityId
    ? hotels?.filter((hotel) => hotel.cityId === formData.cityId) || []
    : [];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const result = await tripsApi.create(data, imageFile || undefined);
      
      if (imageFile && result?.imageUrl?.includes('picsum.photos')) {
        console.error('Backend returned placeholder URL after file upload!');
        toast.error('Image uploaded but backend returned placeholder URL. Please check backend logs.');
      }
      
      return result;
    },
    onSuccess: (newTrip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', newTrip.id] });
      
      if (imageFile && newTrip?.imageUrl && !newTrip.imageUrl.includes('picsum.photos')) {
        toast.success('Trip created successfully with image');
      } else if (imageFile) {
        toast.warning('Trip created, but please verify the image was saved correctly');
      } else {
        toast.success('Trip created successfully');
      }
      
      handleClose();
    },
    onError: (error: any) => {
      console.error('Failed to create trip:', error);
      console.error('Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to create trip');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await tripsApi.update(id, data, imageFile || undefined);
      
      if (imageFile && result?.imageUrl?.includes('picsum.photos')) {
        console.error('Backend returned placeholder URL after file upload!');
        toast.error('Image uploaded but backend returned placeholder URL. Please check backend logs.');
      }
      
      return result;
    },
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData(['trips'], (old: Trip[] | undefined) => {
        if (!old) return old;
        return old.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip));
      });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', updatedTrip.id] });
      
      if (imageFile && updatedTrip?.imageUrl && !updatedTrip.imageUrl.includes('picsum.photos')) {
        toast.success('Trip updated successfully with new image');
      } else if (imageFile) {
        toast.warning('Trip updated, but please verify the image was saved correctly');
      } else {
        toast.success('Trip updated successfully');
      }
      
      handleClose();
    },
    onError: (error: any) => {
      console.error('Failed to update trip:', error);
      console.error('Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to update trip');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tripsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted successfully');
    },
    onError: () => toast.error('Failed to delete trip'),
  });

  const handleClose = () => {
    setOpen(false);
    setEditingTrip(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({ name: '', description: '', cityId: '', hotelId: '', price: '', activityIds: [], imageUrl: '' });
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setImageFile(null);
    
    const isValidImageUrl = trip.imageUrl && !trip.imageUrl.includes('picsum.photos');
    setImagePreview(isValidImageUrl ? trip.imageUrl : null);
    
    setFormData({
      name: trip.name,
      description: trip.description || '',
      cityId: trip.cityId,
      hotelId: trip.hotelId || '',
      price: trip.price.toString(),
      activityIds: trip.activities?.map((a) => a.id) || [],
      imageUrl: isValidImageUrl ? trip.imageUrl : '',
    });
    setOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleActivityToggle = (activityId: string) => {
    setFormData((prev) => {
      const isSelected = prev.activityIds.includes(activityId);
      return {
        ...prev,
        activityIds: isSelected
          ? prev.activityIds.filter((id) => id !== activityId)
          : [...prev.activityIds, activityId],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      hotelId: formData.hotelId && formData.hotelId !== 'none' ? formData.hotelId : undefined,
      activityIds: formData.activityIds.length > 0 ? formData.activityIds : undefined,
    };
    
    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Trips</h1>
          <p className="text-muted-foreground">Manage all trips</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrip ? 'Edit Trip' : 'Create Trip'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="cityId">City</Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cityId: value, hotelId: '' })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} ({city.country?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hotelId">Hotel (optional)</Label>
                <Select
                  value={formData.hotelId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hotelId: value === 'none' ? '' : value })
                  }
                  disabled={!formData.cityId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.cityId ? "Select hotel" : "Select a city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableHotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label>Activities (optional)</Label>
                <div className="mt-2 border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {activities && activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`activity-${activity.id}`}
                          checked={formData.activityIds.includes(activity.id)}
                          onCheckedChange={() => handleActivityToggle(activity.id)}
                        />
                        <label
                          htmlFor={`activity-${activity.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {activity.name}
                          {activity.place && (
                            <span className="text-muted-foreground ml-2">
                              ({activity.place.name})
                            </span>
                          )}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No activities available</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="image">Image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {!imagePreview && editingTrip?.imageUrl && !editingTrip.imageUrl.includes('picsum.photos') && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={editingTrip.imageUrl}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Current image</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTrip ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="premium-card">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="premium-card compact overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.name}</TableCell>
                  <TableCell>{trip.city?.name || 'N/A'}</TableCell>
                  <TableCell>{trip.hotel?.name || 'N/A'}</TableCell>
                  <TableCell>${trip.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {trip.activities && trip.activities.length > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {trip.activities.length} activity{trip.activities.length !== 1 ? 'ies' : ''}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(trip)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(trip.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {endIndex} of {totalItems} trips
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={previousPage}
                      className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={nextPage}
                      className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

