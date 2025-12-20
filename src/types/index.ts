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
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  maxGuests: number;
  pricePerNight: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cityId: string;
  city?: City;
  pricePerNight: number;
  roomTypes?: RoomType[];
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cityId: string;
  city?: City;
  hotelId?: string;
  hotel?: Hotel;
  activities?: Activity[];
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  user?: User;
  roomTypeId: string;
  roomType: RoomType;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface TripReservation {
  id: string;
  userId: string;
  user?: User;
  tripId: string;
  trip: Trip;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface AdminDashboard {
  statistics: {
    users: {
      total: number;
      admins: number;
      regular: number;
    };
    content: {
      countries: number;
      cities: number;
      places: number;
      activities: number;
      hotels: number;
      trips: number;
    };
    reservations: {
      total: number;
      hotel: number;
      trip: number;
      pending: number;
      confirmed: number;
      cancelled: number;
    };
    revenue: {
      total: number;
      hotel: number;
      trip: number;
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
  recent: {
    users: User[];
    reservations: any[];
    tripReservations: any[];
  };
  insights: {
    popularDestinations: Array<{
      id: string;
      name: string;
      country: string;
      places: number;
      hotels: number;
      trips: number;
    }>;
    reservationTrends: {
      last7Days: { hotel: number; trip: number; total: number };
      last30Days: { hotel: number; trip: number; total: number };
    };
  };
}