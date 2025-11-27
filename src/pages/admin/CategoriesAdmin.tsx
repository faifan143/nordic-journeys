import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import { toast } from 'sonner';

export default function CategoriesAdmin() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      setOpen(false);
      setName('');
    },
    onError: () => toast.error('Failed to create category'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">Categories</h1>
          <p className="text-muted-foreground text-lg">Manage place categories</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Museum, Park, Restaurant"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create
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
        <div className="premium-card">
          <div className="flex flex-wrap gap-3">
            {categories?.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-base px-4 py-2 flex items-center gap-2"
              >
                <span>{category.name}</span>
                <button
                  onClick={() => deleteMutation.mutate(category.id)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
