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
import { Badge } from '@/components/ui/badge';
import { usePagination } from '@/hooks/use-pagination';
import { placesApi, citiesApi, categoriesApi, themesApi } from '@/lib/api';
import { Place, City, Category, Theme } from '@/types';
import { toast } from 'sonner';

export default function PlacesAdmin() {
  const [open, setOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cityId: '',
    categoryIds: [] as string[],
    themeIds: [] as string[],
  });

  const queryClient = useQueryClient();

  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: () => placesApi.getAll(),
  });

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedPlaces,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(places || [], 10);

  const { data: cities } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getAll(),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: themes } = useQuery<Theme[]>({
    queryKey: ['themes'],
    queryFn: themesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      placeData,
      categoryIds,
      themeIds,
    }: {
      placeData: any;
      categoryIds: string[];
      themeIds: string[];
    }) => {
      const placeDataWithRelations = {
        ...placeData,
        categoryIds,
        themeIds,
      };
      return await placesApi.create(placeDataWithRelations, imageFiles.length > 0 ? imageFiles : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Place created successfully');
      handleClose();
    },
    onError: () => toast.error('Failed to create place'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      placeData,
      categoryIds,
      themeIds,
    }: {
      id: string;
      placeData: any;
      categoryIds: string[];
      themeIds: string[];
    }) => {
      const placeDataWithRelations = {
        ...placeData,
        categoryIds,
        themeIds,
      };
      return await placesApi.update(id, placeDataWithRelations, imageFiles.length > 0 ? imageFiles : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Place updated successfully');
      handleClose();
    },
    onError: () => toast.error('Failed to update place'),
  });

  const deleteMutation = useMutation({
    mutationFn: placesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Place deleted successfully');
    },
    onError: () => toast.error('Failed to delete place'),
  });

  const handleClose = () => {
    setOpen(false);
    setEditingPlace(null);
    setImageFiles([]);
    setImagePreviews([]);
    setFormData({
      name: '',
      description: '',
      cityId: '',
      categoryIds: [],
      themeIds: [],
    });
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setImageFiles([]);
    setImagePreviews(place.imageUrls || []);
    setFormData({
      name: place.name,
      description: place.description,
      cityId: place.cityId,
      categoryIds: place.categories?.map((c) => c.id) || [],
      themeIds: place.themes?.map((t) => t.id) || [],
    });
    setOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 10 - imageFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more image(s) can be added (max 10 total)`);
      }
      setImageFiles((prev) => [...prev, ...filesToAdd]);
      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { categoryIds, themeIds, ...submitData } = formData;
    if (editingPlace) {
      updateMutation.mutate({
        id: editingPlace.id,
        placeData: submitData,
        categoryIds,
        themeIds,
      });
    } else {
      createMutation.mutate({
        placeData: submitData,
        categoryIds,
        themeIds,
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const toggleTheme = (themeId: string) => {
    setFormData((prev) => ({
      ...prev,
      themeIds: prev.themeIds.includes(themeId)
        ? prev.themeIds.filter((id) => id !== themeId)
        : [...prev.themeIds, themeId],
    }));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Places</h1>
          <p className="text-muted-foreground">Manage all places</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlace ? 'Edit Place' : 'Create Place'}
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories?.map((category) => (
                    <Badge
                      key={category.id}
                      variant={
                        formData.categoryIds.includes(category.id)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Themes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {themes?.map((theme) => (
                    <Badge
                      key={theme.id}
                      variant={
                        formData.themeIds.includes(theme.id)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTheme(theme.id)}
                    >
                      {theme.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="images">Images (optional, max 10)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="mt-2"
                  disabled={imageFiles.length >= 10}
                />
                {imageFiles.length >= 10 && (
                  <p className="text-xs text-muted-foreground mt-1">Maximum 10 images allowed</p>
                )}
                {(imagePreviews.length > 0 || (editingPlace && editingPlace.imageUrls && editingPlace.imageUrls.length > 0)) && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {editingPlace && editingPlace.imageUrls && editingPlace.imageUrls.length > 0 && imageFiles.length === 0 && (
                      editingPlace.imageUrls.map((img, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={img}
                            alt={`Current ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-center">Current</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingPlace ? 'Update' : 'Create'}
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
                <TableHead>Categories</TableHead>
                <TableHead>Themes</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPlaces.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="font-medium">{place.name}</TableCell>
                  <TableCell>{place.city?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {place.categories?.map((category) => (
                        <Badge key={category.id} variant="secondary" className="text-xs">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {place.themes?.map((theme) => (
                        <Badge key={theme.id} variant="outline" className="text-xs">
                          {theme.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {place.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(place)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(place.id)}
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
                Showing {startIndex + 1} to {endIndex} of {totalItems} places
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

