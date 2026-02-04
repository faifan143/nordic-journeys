import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { authApi, usersApi } from '@/lib/api';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function SubAdminsAdmin() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'SUB_ADMIN' as 'SUB_ADMIN' | 'USER',
  });

  const queryClient = useQueryClient();

  // Try to fetch sub-admins, fallback to empty array if endpoint doesn't exist
  // Only fetch if user is admin
  const { data: subAdmins = [], isLoading, error: fetchError } = useQuery<User[]>({
    queryKey: ['sub-admins'],
    queryFn: async () => {
      try {
        return await usersApi.getSubAdmins();
      } catch (error: any) {
        // If endpoint doesn't exist (404/501), return empty array
        if (error.response?.status === 404 || error.response?.status === 501) {
          console.warn('Sub-admins list endpoint not available yet. Create functionality still works.');
          return [];
        }
        throw error;
      }
    },
    retry: false,
    enabled: isAdmin, // Only fetch if user is admin
  });

  const hasListEndpoint = !fetchError || (fetchError as any)?.response?.status !== 404 && (fetchError as any)?.response?.status !== 501;

  // Only ADMIN can access this page
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      toast.error('Access denied. Only admins can manage sub-admins.');
    }
  }, [isAdmin, navigate]);

  // Early return after all hooks
  if (!isAdmin) {
    return null; // Prevent flash of content
  }

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedSubAdmins,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(subAdmins || [], 10);

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; role: 'SUB_ADMIN' | 'USER' }) => {
      return authApi.register(data.email, data.password, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-admins'] });
      toast.success('Sub-admin created successfully');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create sub-admin';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { email?: string; role?: 'SUB_ADMIN' | 'USER' } }) => {
      try {
        return await usersApi.update(id, data);
      } catch (error: any) {
        // If endpoint doesn't exist, show helpful message
        if (error.response?.status === 404 || error.response?.status === 501) {
          throw new Error('Update endpoint not available yet. Please contact backend team.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-admins'] });
      toast.success('Sub-admin updated successfully');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.message || error.response?.data?.message || 'Failed to update sub-admin';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await usersApi.delete(id);
      } catch (error: any) {
        // If endpoint doesn't exist, show helpful message
        if (error.response?.status === 404 || error.response?.status === 501) {
          throw new Error('Delete endpoint not available yet. Please contact backend team.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-admins'] });
      toast.success('Sub-admin deleted successfully');
    },
    onError: (error: any) => {
      const message = error.message || error.response?.data?.message || 'Failed to delete sub-admin';
      toast.error(message);
    },
  });

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', role: 'SUB_ADMIN' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role === 'SUB_ADMIN' ? 'SUB_ADMIN' : 'USER',
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // For updates, only send email and role (password is optional and handled separately if needed)
      const updateData: { email?: string; role?: 'SUB_ADMIN' | 'USER' } = {};
      if (formData.email !== editingUser.email) {
        updateData.email = formData.email;
      }
      if (formData.role !== editingUser.role) {
        updateData.role = formData.role;
      }
      if (Object.keys(updateData).length > 0) {
        updateMutation.mutate({ id: editingUser.id, data: updateData });
      } else {
        toast.info('No changes to save');
      }
    } else {
      if (!formData.password) {
        toast.error('Password is required for new sub-admins');
        return;
      }
      createMutation.mutate({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Sub-Admins Management</h1>
          <p className="text-muted-foreground">Manage sub-admin accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => handleClose()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit Sub-Admin' : 'Create Sub-Admin'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'SUB_ADMIN' | 'USER') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUB_ADMIN">Sub-Admin</SelectItem>
                    <SelectItem value="USER">Regular User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {editingUser
                    ? 'Changing role will affect user permissions'
                    : 'Sub-admins have admin panel access'}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!hasListEndpoint && (
        <div className="premium-card mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> The sub-admins list endpoint is not yet available on the backend. 
            You can still create sub-admins using the "Add Sub-Admin" button above. 
            Once the backend implements the list endpoint, created sub-admins will appear here.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="premium-card">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      ) : !hasListEndpoint ? (
        <div className="premium-card">
          <p className="text-center text-muted-foreground">
            Sub-admins list feature will be available once the backend implements the endpoint.
            Use the "Add Sub-Admin" button above to create new sub-admins.
          </p>
        </div>
      ) : subAdmins.length === 0 ? (
        <div className="premium-card">
          <p className="text-center text-muted-foreground">
            No sub-admins found. Create your first sub-admin above.
          </p>
        </div>
      ) : (
        <div className="premium-card compact overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubAdmins.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'SUB_ADMIN'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {user.role === 'SUB_ADMIN' ? 'Sub-Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${user.email}?`
                            )
                          ) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
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
                Showing {startIndex + 1} to {endIndex} of {totalItems} sub-admins
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

