import { useNavigate } from 'react-router-dom';
import { Globe, Building2, MapPinned, Tag, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  {
    label: 'Add Country',
    icon: Globe,
    path: '/admin/countries',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Add City',
    icon: Building2,
    path: '/admin/cities',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    label: 'Add Place',
    icon: MapPinned,
    path: '/admin/places',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    label: 'Add Category',
    icon: Tag,
    path: '/admin/categories',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    label: 'Add Theme',
    icon: Palette,
    path: '/admin/themes',
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    label: 'Upload Images',
    icon: Upload,
    path: '/admin/uploads',
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="premium-card">
      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-full px-6 py-6 h-auto shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

