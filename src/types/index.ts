export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Country {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  description: string;
  countryId: string;
  country?: Country;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  cityId: string;
  city?: City;
  images: string[];
  categories?: Category[];
  themes?: Theme[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  placeId: string;
  place?: Place;
  createdAt: string;
  updatedAt: string;
}
