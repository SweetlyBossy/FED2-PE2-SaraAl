import { type Venue } from "./venue";

// Define the shape of the data passed from the venue specific page to the checkout page. This includes the venue details and the booking data (check-in/check-out dates and number of guests). This type definition helps us ensure that we are working with the correct data structure and provides better type safety throughout the component.
export interface CheckoutState {
  venue: Venue;
  bookingData: {
    dateFrom: string;
    dateTo: string;
    guests: number;
  };
}

// Define the shape of the data we expect to receive from the Checkout page. This includes the venue details and the booking data (check-in/check-out dates and number of guests). This type definition helps us ensure that we are working with the correct data structure and provides better type safety throughout the component.
export interface ConfirmationState {
  venue: Venue;
  bookingData: {
    dateFrom: string;
    dateTo: string;
    guests: number;
  };
  contactEmail?: string;
}
