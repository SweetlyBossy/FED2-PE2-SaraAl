// this interface is used for the user profile page, it contains all the data needed to display the user's profile, including their bookings and venues they manage. It is used in the UserProfile component to type the profile state and ensure that we have all the necessary data to render the profile page correctly. The Booking interface defines the structure of each booking, while the FullProfileData interface defines the overall structure of the user's profile data, including their basic information, avatar, bookings, and venues they manage. This allows us to have a clear and consistent data structure when working with user profiles in our application.
import { type Venue } from "./venue";

export interface Booking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  venue: { 
    id: string;
    name: string;
    media: { url: string; alt: string }[] 
    maxGuests: number;
  };
}

export interface FullProfileData {
  name: string;
  email: string;
  bio?: string;
  venueManager: boolean;
  avatar: { url: string; alt: string };
  bookings: Booking[];
  venues: Venue[];
}
