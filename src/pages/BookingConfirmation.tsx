// This page displays a success message and order summary after a user successfully completes a booking. It retrieves the booking details passed from the Checkout page via React Router's location state and displays them in a visually appealing layout. If the necessary booking data is not available (e.g., if the user navigates to this page directly without going through the checkout process), it redirects them back to the venues listing page to ensure a proper flow and prevent confusion.
import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type ConfirmationState } from "../types/booking";
// The BookingConfirmationPage component is responsible for displaying a confirmation message and order summary after a successful booking. It retrieves the booking details from the location state passed from the Checkout page, and if the necessary data is not available, it redirects the user back to the venues listing page. The component also calculates the total price based on the booking dates and venue price, and displays all relevant information in a structured and visually appealing layout.
const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as ConfirmationState;

  // If the state or venue data is missing (e.g., if the user navigates directly to this page without going through the checkout process), redirect them back to the venues listing page. This ensures that the page is only accessible with valid booking data and prevents confusion for users who might land here without completing a booking. It also helps maintain a logical flow in the user experience, guiding them back to the starting point where they can select a venue and go through the proper booking process.
  if (!state || !state.venue) {
    return <Navigate to="/venues" />;
  }
  // Extract the venue and booking data from the state for easier access throughout the component. This allows us to display the relevant information in the confirmation message and order summary without having to repeatedly access the state object. It also improves readability and maintainability of the code by giving meaningful variable names to the data we are working with.
  const { venue, bookingData } = state;

  // Recalculate the total price for the summary card based on the booking dates and venue price. This ensures that the total price displayed in the order summary is accurate and reflects any changes that may have been made to the booking details during the checkout process. It also allows us to provide a clear breakdown of the costs for the user, enhancing transparency and trust in the booking process. The calculation is based on the number of days between the check-in and check-out dates multiplied by the venue's price per night.
  const checkIn = new Date(bookingData.dateFrom);
  const checkOut = new Date(bookingData.dateTo);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = diffDays * venue.price;

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20" role="main">
      {/* Hero Header */}
      <div
        className="h-64 w-full bg-cover bg-center relative flex items-center justify-center rounded-b-[40px] overflow-hidden"
        style={{ backgroundImage: "url('/box-filler.png')" }}
        role="banner"
      >
        <div
          className="absolute inset-0 bg-slate-900/40"
          aria-hidden="true"
        ></div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white tracking-wide shadow-black">
          Your Adventure Checkout
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Confirmation & Info */}
          <div
            className="lg:col-span-8 pt-4"
            role="region"
            aria-labelledby="confirmation-heading"
          >
            <div className="bg-white p-10 shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-100 rounded-lg space-y-10 relative overflow-hidden">
              {/* Decorative green accent line */}
              <div
                className="absolute top-0 left-0 w-2 h-full bg-mint-green"
                aria-hidden="true"
              ></div>

              <div>
                <h2
                  id="confirmation-heading"
                  className="text-3xl font-extrabold mb-2"
                >
                  Booking Confirmation
                </h2>
                <p className="text-lg font-semibold text-slate-800">
                  Success! Your reservation is confirmed
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Important Information
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span
                      className="text-mint-green text-xl mr-4 mt-1"
                      aria-hidden="true"
                    >
                      ✉️
                    </span>
                    <p className="text-slate-700 text-lg">
                      A confirmation email has been sent to
                      <br />
                      <span className="font-semibold text-slate-900">
                        {state.contactEmail ||
                          user?.email ||
                          "your registered email"}
                      </span>
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span
                      className="text-mint-green text-xl mr-4 mt-1"
                      aria-hidden="true"
                    >
                      👤
                    </span>
                    <p className="text-slate-700 text-lg">
                      Manage your booking via your profile
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div
            className="lg:col-span-4"
            role="region"
            aria-labelledby="summary-heading"
          >
            <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="p-6 text-center border-b border-slate-100">
                <h2
                  id="summary-heading"
                  className="text-2xl font-extrabold text-slate-900"
                >
                  Order Summary
                </h2>
              </div>

              {/* Venue Image */}
              <div className="px-6 pt-6">
                <img
                  src={venue.media[0]?.url || "/fallback-image.jpg"}
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-full shadow-inner"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-image.jpg";
                  }}
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <span className="text-slate-500 text-sm">trip: </span>
                  <span className="font-extrabold text-slate-900">
                    {venue.name}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Guests:</span>
                  <span className="font-semibold text-slate-900">
                    {bookingData.guests} Adults
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span className="font-semibold text-slate-900">
                    {checkIn.toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {checkOut.toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Price:</span>
                  <span className="font-semibold text-slate-900">
                    ${venue.price}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4 mb-8">
                  <span className="text-base font-bold text-slate-900">
                    Total:
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ${totalPrice}
                  </span>
                </div>

                <Link
                  to="/venues"
                  aria-label="Next Adventure"
                  className="block w-full text-center bg-mint-green text-deep-navy font-bold text-lg py-3 rounded hover:bg-emerald-400 transition-colors shadow-md"
                >
                  Next Adventure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
