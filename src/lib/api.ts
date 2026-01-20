import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // IMPORTANT: For FormData requests, don't override Content-Type
    // Let axios/browser set it automatically with the correct boundary
    if (config.data instanceof FormData) {
      // Remove Content-Type header if it's set - browser will set it with boundary
      delete config.headers['Content-Type'];
      console.log('FormData detected - letting browser set Content-Type with boundary');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Handle both accessToken and access_token response formats
    const data = response.data;
    if (data.accessToken) {
      return { ...data, access_token: data.accessToken };
    }
    return data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  register: async (email: string, password: string, role?: 'ADMIN' | 'USER') => {
    const response = await api.post('/auth/register', { email, password, role });
    const data = response.data;
    if (data.accessToken) {
      return { ...data, access_token: data.accessToken };
    }
    return data;
  },
};

// STORAGE
export const storageApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/storage/upload', formData);
    return response.data;
  },
};

// COUNTRIES
export const countriesApi = {
  getAll: async () => {
    const response = await api.get('/countries');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/countries/${id}`);
    return response.data;
  },
  create: async (data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new country image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      // Only send imageUrl if it's a valid URL (not a placeholder from seed data)
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    const response = await api.post('/countries', formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new country image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    const response = await api.put(`/countries/${id}`, formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/countries/${id}`);
    return response.data;
  },
};

// CITIES
export const citiesApi = {
  getAll: async (countryId?: string) => {
    const params = countryId ? { countryId } : {};
    const response = await api.get('/cities', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/cities/${id}`);
    return response.data;
  },
  create: async (data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('countryId', data.countryId);
    
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new image file:', imageFile.name, imageFile.type, imageFile.size);
      // CRITICAL: When uploading a new file, DO NOT send imageUrl
      // This ensures the backend processes the uploaded file and returns the real URL
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      // Only send imageUrl if it's a valid URL (not a placeholder from seed data)
      // Never send picsum.photos URLs - those are placeholders, not real uploaded images
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos) - treating as no image');
      }
    }
    
    const response = await api.post('/cities', formData);
    
    // Validate response - backend should return a real uploaded image URL, not placeholder
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL instead of uploaded image!');
      console.error('Response:', response.data);
      // Don't throw error, but log it - the backend should handle this correctly
    }
    
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    console.log('=== citiesApi.update() START ===');
    console.log('City ID:', id);
    console.log('Data:', data);
    console.log('Image file provided:', !!imageFile);
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('countryId', data.countryId);
    
    // Log what we're adding to FormData
    console.log('FormData entries:');
    console.log('  - name:', data.name);
    console.log('  - description:', data.description || '');
    console.log('  - countryId:', data.countryId);
    
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('✅ Adding image file to FormData:');
      console.log('  - name:', imageFile.name);
      console.log('  - type:', imageFile.type);
      console.log('  - size:', imageFile.size, 'bytes');
      // CRITICAL: When uploading a new file, DO NOT send imageUrl
      // This ensures the backend processes the uploaded file and returns the real URL from storage
      console.log('  - NOT sending imageUrl (file takes precedence)');
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      // Only send imageUrl if it's a valid URL (not a placeholder from seed data)
      // Never send picsum.photos URLs - those are placeholders from seed data, not real uploaded images
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
        console.log('  - Adding imageUrl (no file uploaded):', imageUrl);
      } else {
        console.warn('⚠️ Ignoring placeholder image URL (picsum.photos) - treating as no image');
        // Don't send placeholder URLs - let backend preserve existing real image or set to null
      }
    } else {
      console.log('  - No image file and no imageUrl provided');
    }
    
    // Verify FormData contents (for debugging)
    console.log('Sending PUT request to:', `/cities/${id}`);
    
    // Don't set Content-Type header - let axios/browser set it automatically with boundary
    // Setting it manually can cause issues with FormData
    const response = await api.put(`/cities/${id}`, formData);
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', response.data);
    
    // Validate response - backend should return a real uploaded image URL, not placeholder
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('❌ Backend returned placeholder image URL instead of uploaded image!');
      console.error('Expected: Real uploaded image URL from storage (e.g., Backblaze B2 URL)');
      console.error('Got:', response.data.imageUrl);
      console.error('Full response:', response.data);
      console.error('This suggests the backend did not process the uploaded file correctly.');
    } else if (response.data?.imageUrl && !response.data.imageUrl.includes('picsum.photos')) {
      console.log('✅ Backend returned valid image URL:', response.data.imageUrl);
    } else {
      console.log('⚠️ No imageUrl in response (may be null/empty)');
    }
    
    console.log('=== citiesApi.update() END ===');
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/cities/${id}`);
    return response.data;
  },
};

// CATEGORIES
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// THEMES
export const themesApi = {
  getAll: async () => {
    const response = await api.get('/themes');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/themes', data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/themes/${id}`);
    return response.data;
  },
};

// PLACES
export const placesApi = {
  getAll: async (cityId?: string) => {
    const params = cityId ? { cityId } : {};
    const response = await api.get('/places', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/places/${id}`);
    return response.data;
  },
  create: async (data: any, imageFiles?: File[]) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('cityId', data.cityId);
    if (data.categoryIds && Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach((id: string) => {
        formData.append('categoryIds', id);
      });
    }
    if (data.themeIds && Array.isArray(data.themeIds)) {
      data.themeIds.forEach((id: string) => {
        formData.append('themeIds', id);
      });
    }
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }
    if (data.imageUrls && Array.isArray(data.imageUrls)) {
      data.imageUrls.forEach((url: string) => {
        formData.append('imageUrls', url);
      });
    }
    const response = await api.post('/places', formData);
    return response.data;
  },
  update: async (id: string, data: any, imageFiles?: File[]) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('cityId', data.cityId);
    if (data.categoryIds && Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach((categoryId: string) => {
        formData.append('categoryIds', categoryId);
      });
    }
    if (data.themeIds && Array.isArray(data.themeIds)) {
      data.themeIds.forEach((themeId: string) => {
        formData.append('themeIds', themeId);
      });
    }
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }
    if (data.imageUrls && Array.isArray(data.imageUrls)) {
      data.imageUrls.forEach((url: string) => {
        formData.append('imageUrls', url);
      });
    }
    const response = await api.put(`/places/${id}`, formData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/places/${id}`);
    return response.data;
  },
  updateCategories: async (id: string, categoryIds: string[]) => {
    const response = await api.put(`/places/${id}/categories`, { categoryIds });
    return response.data;
  },
  updateThemes: async (id: string, themeIds: string[]) => {
    const response = await api.put(`/places/${id}/themes`, { themeIds });
    return response.data;
  },
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/places/${id}/images`, formData);
    return response.data;
  },
  deleteImage: async (id: string, fileName: string) => {
    const response = await api.delete(`/places/${id}/images/${fileName}`);
    return response.data;
  },
};

// ACTIVITIES
export const activitiesApi = {
  getAll: async (placeId?: string) => {
    const params = placeId ? { placeId } : {};
    const response = await api.get('/activities', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },
  create: async (data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('placeId', data.placeId);
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new activity image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    const response = await api.post('/activities', formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('placeId', data.placeId);
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new activity image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    const response = await api.put(`/activities/${id}`, formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
};

// EMBEDDINGS
export const embeddingsApi = {
  fetchPlaceEmbedding: async (id: string) => {
    const response = await api.get(`/embeddings/places/${id}`);
    return response.data;
  },
  uploadPlaceEmbedding: async (id: string, embedding: number[]) => {
    const response = await api.post(`/embeddings/places/${id}`, { embedding });
    return response.data;
  },
  uploadActivityEmbedding: async (id: string, embedding: number[]) => {
    const response = await api.post(`/embeddings/activities/${id}`, { embedding });
    return response.data;
  },
};

// HOTELS
export const hotelsApi = {
  getAll: async (cityId?: string) => {
    const params = cityId ? { cityId } : {};
    const response = await api.get('/browse/hotels', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/browse/hotels/${id}`);
    return response.data;
  },
  getRoomTypes: async (hotelId: string) => {
    const response = await api.get(`/browse/hotels/${hotelId}/room-types`);
    return response.data;
  },
  // Admin endpoints
  create: async (data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('cityId', data.cityId);
    formData.append('pricePerNight', data.pricePerNight.toString());
    
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new hotel image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    
    // Room types - send as JSON string
    if (data.roomTypes && Array.isArray(data.roomTypes) && data.roomTypes.length > 0) {
      formData.append('roomTypes', JSON.stringify(data.roomTypes));
    }
    
    const response = await api.post('/hotels', formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('cityId', data.cityId);
    formData.append('pricePerNight', data.pricePerNight.toString());
    
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new hotel image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    
    // Room types - send as JSON string
    if (data.roomTypes && Array.isArray(data.roomTypes) && data.roomTypes.length > 0) {
      formData.append('roomTypes', JSON.stringify(data.roomTypes));
    }
    
    const response = await api.patch(`/hotels/${id}`, formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },
  // Room Types management
  createRoomType: async (hotelId: string, data: {
    name: string;
    description?: string;
    maxGuests: number;
    pricePerNight: number;
    capacity: number;
    initialRoomCount?: number;
    roomNumberPrefix?: string;
  }) => {
    const response = await api.post(`/hotels/${hotelId}/room-types`, data);
    return response.data;
  },
  updateRoomType: async (hotelId: string, roomTypeId: string, data: {
    name?: string;
    description?: string;
    maxGuests?: number;
    pricePerNight?: number;
    capacity?: number;
  }) => {
    const response = await api.patch(`/hotels/${hotelId}/room-types/${roomTypeId}`, data);
    return response.data;
  },
  deleteRoomType: async (hotelId: string, roomTypeId: string) => {
    const response = await api.delete(`/hotels/${hotelId}/room-types/${roomTypeId}`);
    return response.data;
  },
  // Room management
  getRoomsByRoomType: async (hotelId: string, roomTypeId: string) => {
    const response = await api.get(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms`);
    return response.data;
  },
  createRoom: async (hotelId: string, roomTypeId: string, data: {
    roomNumber?: string;
    status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
  }) => {
    const response = await api.post(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms`, data);
    return response.data;
  },
  updateRoom: async (hotelId: string, roomTypeId: string, roomId: string, data: {
    roomNumber?: string;
    status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
  }) => {
    const response = await api.patch(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms/${roomId}`, data);
    return response.data;
  },
  deleteRoom: async (hotelId: string, roomTypeId: string, roomId: string) => {
    const response = await api.delete(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms/${roomId}`);
    return response.data;
  },
  bulkAddRooms: async (hotelId: string, roomTypeId: string, data: {
    count: number;
    roomNumberPrefix?: string;
  }) => {
    const response = await api.post(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms/bulk-add`, data);
    return response.data;
  },
  bulkRemoveRooms: async (hotelId: string, roomTypeId: string, data: {
    count: number;
  }) => {
    const response = await api.post(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms/bulk-remove`, data);
    return response.data;
  },
};

// TRIPS
export const tripsApi = {
  getAll: async (cityId?: string) => {
    const params = cityId ? { cityId } : {};
    const response = await api.get('/browse/trips', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/browse/trips/${id}`);
    return response.data;
  },
  // Admin endpoints
  create: async (data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('cityId', data.cityId);
    formData.append('price', data.price.toString());
    
    if (data.hotelId) {
      formData.append('hotelId', data.hotelId);
    }
    
    // Activity IDs - send multiple fields with same name
    if (data.activityIds && Array.isArray(data.activityIds)) {
      data.activityIds.forEach((activityId: string) => {
        formData.append('activityIds', activityId);
      });
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new trip image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    
    const response = await api.post('/trips', formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('cityId', data.cityId);
    formData.append('price', data.price.toString());
    
    if (data.hotelId) {
      formData.append('hotelId', data.hotelId);
    }
    
    // Activity IDs - send multiple fields with same name
    if (data.activityIds && Array.isArray(data.activityIds)) {
      data.activityIds.forEach((activityId: string) => {
        formData.append('activityIds', activityId);
      });
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Uploading new trip image file:', imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      const imageUrl = data.imageUrl.trim();
      if (!imageUrl.includes('picsum.photos')) {
        formData.append('imageUrl', imageUrl);
      } else {
        console.warn('Ignoring placeholder image URL (picsum.photos)');
      }
    }
    
    const response = await api.patch(`/trips/${id}`, formData);
    if (response.data?.imageUrl?.includes('picsum.photos')) {
      console.error('⚠️ Backend returned placeholder image URL!');
    }
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },
};

// RESERVATIONS (Hotel)
export const reservationsApi = {
  getAll: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },
  getMyReservations: async () => {
    const response = await api.get('/reservations/me');
    return response.data;
  },
  getMyReservation: async (id: string) => {
    const response = await api.get(`/reservations/me/${id}`);
    return response.data;
  },
  create: async (data: {
    roomId: string; // Changed from roomTypeId
    startDate: string;
    endDate: string;
    guests: number;
  }) => {
    const response = await api.post('/reservations', data);
    return response.data;
  },
  updateStatus: async (id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    const response = await api.patch(`/reservations/${id}/status`, { status });
    return response.data;
  },
  cancelMyReservation: async (id: string) => {
    const response = await api.patch(`/reservations/me/${id}/status`, { status: 'CANCELLED' });
    return response.data;
  },
};

// TRIP RESERVATIONS
export const tripReservationsApi = {
  getAll: async () => {
    const response = await api.get('/trip-reservations');
    return response.data;
  },
  getMyReservations: async () => {
    const response = await api.get('/trip-reservations/me');
    return response.data;
  },
  create: async (data: {
    tripId: string;
    guests: number;
  }) => {
    const response = await api.post('/trip-reservations', data);
    return response.data;
  },
  updateStatus: async (id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    const response = await api.patch(`/trip-reservations/${id}/status`, { status });
    return response.data;
  },
  cancelMyReservation: async (id: string) => {
    const response = await api.patch(`/trip-reservations/me/${id}/status`, { status: 'CANCELLED' });
    return response.data;
  },
};

// DASHBOARD
export const dashboardApi = {
  getGuest: async () => {
    const response = await api.get('/dashboard/guest');
    return response.data;
  },
  getUser: async () => {
    const response = await api.get('/dashboard/user');
    return response.data;
  },
  getAdmin: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};

export default api;
