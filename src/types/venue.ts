import { type Booking } from "./user"; // We import the Booking type from the user types because the Venue interface includes an array of bookings. This allows us to ensure that the bookings associated with each venue are correctly typed and consistent with the structure defined in our user types.

// TypeScript Interfaces. These interfaces define the structure of the data we expect to receive from the API, as well as the state for our filters. This helps ensure type safety and makes the code easier to understand and maintain.
export interface VenueMeta {
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
}

// Media Interface (handling potential nulls from the API) - allowing for robust handling of API inconsistencies where media fields might be missing or null, ensuring that the application can still function and display venues without crashing.
export interface VenueMedia {
  url: string;
  alt: string;
}

// Location Interface (handling potential nulls from the API) - allowing for robust handling of API inconsistencies where location fields might be missing or null, ensuring that the application can still function and display venues without crashing.
export interface VenueLocation {
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  continent: string | null;
  lat: number | null;
  lng: number | null;
}

// Main Venue Interface with all necessary fields for display and filtering, including handling potential null values for location and media to ensure robustness against API inconsistencies.
export interface Venue {
  id: string;
  name: string;
  description: string;
  media: VenueMedia[];
  price: number;
  maxGuests: number;
  rating: number;
  created: string;
  updated: string;
  meta: VenueMeta;
  location: VenueLocation;

  // owner object, included when fetching data with the ?_owner=true flag
  owner?: {
    name: string;
    email: string;
    avatar: VenueMedia;
  };

  //  bookings array, included when fetching data with the ?_bookings=true flag. This allows us to have all the booking information for a venue directly within the venue object, which is especially useful for the manager dashboard where we need to see all bookings for each venue.
  bookings?: Booking[];
}

// Filter State Interface - defining the structure of the filter state, which includes all the criteria that users can use to filter the venues. This allows for easy management and updating of filter criteria in a type-safe manner.
export interface FilterState {
  minPrice: number;
  maxPrice: number;
  maxGuests: number;
  minRating: number;
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
  country: string;
  city: string;
}
