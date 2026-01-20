import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { hotelsApi, citiesApi } from '@/lib/api';
import { Hotel, City, RoomType } from '@/types';
import { toast } from 'sonner';

export default function HotelsAdmin() {
  const [open, setOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cityId: '',
    pricePerNight: '',
    imageUrl: '',
    roomTypes: [] as Array<{
      id?: string; // Optional: if present, updates existing; if missing, creates new
      name: string;
      description: string;
      maxGuests: number;
      pricePerNight: number;
      capacity: number;
      initialRoomCount?: number;
      roomNumberPrefix?: string;
    }>,
  });

  const queryClient = useQueryClient();

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: () => hotelsApi.getAll(),
  });

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedHotels,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(hotels || [], 10);

  const { data: cities } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const result = await hotelsApi.create(data, imageFile || undefined);
      
      if (imageFile && result?.imageUrl?.includes('picsum.photos')) {
        console.error('Backend returned placeholder URL after file upload!');
        toast.error('Image uploaded but backend returned placeholder URL. Please check backend logs.');
      }
      
      return result;
    },
    onSuccess: (newHotel) => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', newHotel.id] });
      
      if (imageFile && newHotel?.imageUrl && !newHotel.imageUrl.includes('picsum.photos')) {
        toast.success('Hotel created successfully with image');
      } else if (imageFile) {
        toast.warning('Hotel created, but please verify the image was saved correctly');
      } else {
        toast.success('Hotel created successfully');
      }
      
      handleClose();
    },
    onError: (error: any) => {
      console.error('Failed to create hotel:', error);
      console.error('Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to create hotel');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await hotelsApi.update(id, data, imageFile || undefined);
      
      if (imageFile && result?.imageUrl?.includes('picsum.photos')) {
        console.error('Backend returned placeholder URL after file upload!');
        toast.error('Image uploaded but backend returned placeholder URL. Please check backend logs.');
      }
      
      return result;
    },
    onSuccess: (updatedHotel) => {
      queryClient.setQueryData(['hotels'], (old: Hotel[] | undefined) => {
        if (!old) return old;
        return old.map((hotel) => (hotel.id === updatedHotel.id ? updatedHotel : hotel));
      });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', updatedHotel.id] });
      
      if (imageFile && updatedHotel?.imageUrl && !updatedHotel.imageUrl.includes('picsum.photos')) {
        toast.success('Hotel updated successfully with new image');
      } else if (imageFile) {
        toast.warning('Hotel updated, but please verify the image was saved correctly');
      } else {
        toast.success('Hotel updated successfully');
      }
      
      handleClose();
    },
    onError: (error: any) => {
      console.error('Failed to update hotel:', error);
      console.error('Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to update hotel');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: hotelsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel deleted successfully');
    },
    onError: () => toast.error('Failed to delete hotel'),
  });

  const handleClose = () => {
    setOpen(false);
    setEditingHotel(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({ 
      name: '', 
      description: '', 
      cityId: '', 
      pricePerNight: '', 
      imageUrl: '', 
      roomTypes: [] 
    });
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setImageFile(null);
    
    const isValidImageUrl = hotel.imageUrl && !hotel.imageUrl.includes('picsum.photos');
    setImagePreview(isValidImageUrl ? hotel.imageUrl : null);
    
    setFormData({
      name: hotel.name,
      description: hotel.description || '',
      cityId: hotel.cityId,
      pricePerNight: hotel.pricePerNight.toString(),
      imageUrl: isValidImageUrl ? hotel.imageUrl : '',
      roomTypes: hotel.roomTypes?.map(rt => ({
        id: rt.id, // Include ID for existing room types (updates)
        name: rt.name,
        description: rt.description || '',
        maxGuests: rt.maxGuests,
        pricePerNight: rt.pricePerNight,
        capacity: rt.capacity,
        // Don't include initialRoomCount or roomNumberPrefix for existing room types
      })) || [],
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

  const addRoomType = () => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          name: '',
          description: '',
          maxGuests: 1,
          pricePerNight: 0,
          capacity: 1,
          initialRoomCount: 0,
          roomNumberPrefix: '',
        },
      ],
    }));
  };

  const removeRoomType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index),
    }));
  };

  const updateRoomType = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.map((rt, i) =>
        i === index ? { ...rt, [field]: value } : rt
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up room types based on update/create logic
    const cleanedRoomTypes = formData.roomTypes.map(rt => {
      const cleaned: any = {
        name: rt.name,
        description: rt.description || undefined,
        maxGuests: rt.maxGuests,
        pricePerNight: rt.pricePerNight,
        capacity: rt.capacity,
      };
      
      // If ID exists, this is an update - include ID and exclude initialRoomCount/roomNumberPrefix
      if (rt.id) {
        cleaned.id = rt.id;
        // initialRoomCount and roomNumberPrefix are ignored for updates
      } else {
        // No ID = new room type - include initialRoomCount and roomNumberPrefix if provided
        if (rt.initialRoomCount && rt.initialRoomCount > 0) {
          cleaned.initialRoomCount = rt.initialRoomCount;
        }
        if (rt.roomNumberPrefix && rt.roomNumberPrefix.trim()) {
          cleaned.roomNumberPrefix = rt.roomNumberPrefix.trim();
        }
      }
      
      return cleaned;
    });
    
    const submitData = {
      ...formData,
      pricePerNight: parseFloat(formData.pricePerNight),
      roomTypes: cleanedRoomTypes.length > 0 ? cleanedRoomTypes : undefined,
    };
    
    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Hotels</h1>
          <p className="text-muted-foreground">Manage all hotels</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHotel ? 'Edit Hotel' : 'Create Hotel'}
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
                    setFormData({ ...formData, cityId: value })
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
                <Label htmlFor="pricePerNight">Price per Night</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerNight}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerNight: e.target.value })
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
                <div className="flex items-center justify-between mb-2">
                  <Label>Room Types (optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRoomType}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Room Type
                  </Button>
                </div>
                {formData.roomTypes.length > 0 && (
                  <div className="space-y-4 border rounded-lg p-4">
                    {formData.roomTypes.map((roomType, index) => (
                      <div key={index} className="space-y-3 border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-semibold">
                              Room Type {index + 1}
                            </Label>
                            {roomType.id ? (
                              <Badge variant="outline" className="text-xs">
                                Existing (Update)
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                New (Create)
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoomType(index)}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor={`rt-name-${index}`} className="text-xs">
                            Name
                          </Label>
                          <Input
                            id={`rt-name-${index}`}
                            value={roomType.name}
                            onChange={(e) =>
                              updateRoomType(index, 'name', e.target.value)
                            }
                            placeholder="Deluxe Room"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`rt-desc-${index}`} className="text-xs">
                            Description (optional)
                          </Label>
                          <Textarea
                            id={`rt-desc-${index}`}
                            value={roomType.description}
                            onChange={(e) =>
                              updateRoomType(index, 'description', e.target.value)
                            }
                            placeholder="Spacious room with city view"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`rt-guests-${index}`} className="text-xs">
                              Max Guests
                            </Label>
                            <Input
                              id={`rt-guests-${index}`}
                              type="number"
                              min="1"
                              value={roomType.maxGuests}
                              onChange={(e) =>
                                updateRoomType(index, 'maxGuests', parseInt(e.target.value) || 1)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rt-capacity-${index}`} className="text-xs">
                              Capacity
                            </Label>
                            <Input
                              id={`rt-capacity-${index}`}
                              type="number"
                              min="1"
                              value={roomType.capacity}
                              onChange={(e) =>
                                updateRoomType(index, 'capacity', parseInt(e.target.value) || 1)
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`rt-price-${index}`} className="text-xs">
                            Price per Night
                          </Label>
                          <Input
                            id={`rt-price-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={roomType.pricePerNight}
                            onChange={(e) =>
                              updateRoomType(index, 'pricePerNight', parseFloat(e.target.value) || 0)
                            }
                            required
                          />
                        </div>
                        {/* Only show initial room fields for new room types (without id) */}
                        {!roomType.id && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`rt-initial-count-${index}`} className="text-xs">
                                Initial Room Count (optional)
                              </Label>
                              <Input
                                id={`rt-initial-count-${index}`}
                                type="number"
                                min="0"
                                value={roomType.initialRoomCount || ''}
                                onChange={(e) =>
                                  updateRoomType(index, 'initialRoomCount', e.target.value ? parseInt(e.target.value) : undefined)
                                }
                                placeholder="0"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Number of rooms to create automatically
                              </p>
                            </div>
                            <div>
                              <Label htmlFor={`rt-prefix-${index}`} className="text-xs">
                                Room Number Prefix (optional)
                              </Label>
                              <Input
                                id={`rt-prefix-${index}`}
                                type="text"
                                maxLength={50}
                                value={roomType.roomNumberPrefix || ''}
                                onChange={(e) =>
                                  updateRoomType(index, 'roomNumberPrefix', e.target.value || undefined)
                                }
                                placeholder="DLX"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Prefix for room numbers (e.g., "DLX-1", "DLX-2")
                              </p>
                            </div>
                          </div>
                        )}
                        {roomType.id && (
                          <p className="text-xs text-muted-foreground italic">
                            Note: Initial room creation fields are only available when creating new room types.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                {!imagePreview && editingHotel?.imageUrl && !editingHotel.imageUrl.includes('picsum.photos') && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={editingHotel.imageUrl}
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
                  {editingHotel ? 'Update' : 'Create'}
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
                <TableHead>Price/Night</TableHead>
                <TableHead>Room Types</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>{hotel.city?.name || 'N/A'}</TableCell>
                  <TableCell>${hotel.pricePerNight.toFixed(2)}</TableCell>
                  <TableCell>
                    {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {hotel.roomTypes.length} type{hotel.roomTypes.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {hotel.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(hotel)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(hotel.id)}
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
                Showing {startIndex + 1} to {endIndex} of {totalItems} hotels
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

