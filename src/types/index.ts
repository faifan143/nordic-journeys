export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUB_ADMIN' | 'USER';
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
  imageUrls: string[];
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

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface Room {
  id: string;
  roomTypeId: string;
  roomType?: RoomType;
  roomNumber?: string;
  status: RoomStatus;
  reservations?: Reservation[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  hotel?: Hotel;
  name: string;
  description?: string;
  maxGuests: number;
  pricePerNight: number;
  capacity: number;
  rooms?: Room[]; // Only for admins
  availableRoomsCount?: number; // Only for regular users
  reservations?: Reservation[];
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
  roomId: string; // NEW: Now required
  room?: Room; // NEW: Room details included
  roomTypeId?: string; // Still included for reference
  roomType?: RoomType;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: ReservationStatus;
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
  status: ReservationStatus;
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