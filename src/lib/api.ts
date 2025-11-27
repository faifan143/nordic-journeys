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
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// STORAGE
export const storageApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    formData.append('description', data.description);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    const response = await api.post('/countries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    const response = await api.put(`/countries/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    formData.append('description', data.description);
    formData.append('countryId', data.countryId);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    const response = await api.post('/cities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('countryId', data.countryId);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    const response = await api.put(`/cities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    const response = await api.post('/places', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id: string, data: any, imageFiles?: File[]) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('cityId', data.cityId);
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
    const response = await api.put(`/places/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    const response = await api.post(`/places/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    formData.append('description', data.description);
    formData.append('placeId', data.placeId);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    const response = await api.post('/activities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('placeId', data.placeId);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    const response = await api.put(`/activities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

export default api;
