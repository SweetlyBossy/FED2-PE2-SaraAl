// This page handles the checkout process for a booking. It retrieves the venue and booking data passed from the SpecificVenuePage through the location state, displays a form for the user to enter their billing and payment information, and calculates the total price based on the selected dates and venue price. When the user submits the form, it makes an API call to create the booking and then navigates to the BookingConfirmation page with the relevant data.
import React, { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type CheckoutState } from "../types/booking";

// The CheckoutPage component is responsible for rendering the checkout form and handling the booking process. It retrieves the venue and booking data passed from the SpecificVenuePage through the location state, displays a form for the user to enter their billing and payment information, and calculates the total price based on the selected dates and venue price. When the user submits the form, it makes an API call to create the booking and then navigates to the BookingConfirmation page with the relevant data.
const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Local state to manage the contact email input, initialized with the user's email if available. This allows the user to easily confirm or update their contact email during the checkout process. The value of this state is bound to the email input field in the form, and it updates as the user types, ensuring that we have the most current email address when they submit their booking.
  const [contactEmail, setContactEmail] = useState(user?.email || "");

  // Retrieve the hidden state passed from SpecificVenuePage that contains the venue and booking details. This state is essential for displaying the correct information in the checkout form and for making the API call to create the booking. If this state is not available ( if a user tries to access the checkout page directly without going through the venue selection), we will redirect them back to the venues listing page to ensure a proper flow in the user experience.
  const state = location.state as CheckoutState;

  // If a user tries to access /checkout directly without coming from a venue, send them back to the venues listing page. This ensures that the checkout page is only accessible with valid booking data and prevents confusion for users who might land here without completing a booking. It also helps maintain a logical flow in the user experience, guiding them back to the starting point where they can select a venue and go through the proper booking process.
  if (!state || !state.venue) {
    return <Navigate to="/venues" />;
  }
  // Extract the venue and booking data from the state for easier access throughout the component. This allows us to display the relevant information in the confirmation message and order summary without having to repeatedly access the state object. It also improves readability and maintainability of the code by giving meaningful variable names to the data we are working with.
  const { venue, bookingData } = state;

  // Calculate the total price based on dates
  const checkIn = new Date(bookingData.dateFrom);
  const checkOut = new Date(bookingData.dateTo);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Ensure at least 1 night is counted. This handles cases where check-in and check-out are the same day, which should still count as a 1-night stay.
  const totalPrice = diffDays * venue.price;

  // API call to create the booking happens here. When the user submits the form, we set the isProcessing state to true to indicate that the booking is being processed. We then make a POST request to the /holidaze/bookings endpoint with the necessary headers for authentication and content type, and we include the booking details in the request body. If the booking is successful, we navigate to the BookingConfirmation page and pass the relevant data through state. If there is an error during the booking process, we alert the user with an appropriate message. Finally, we reset the isProcessing state to false regardless of the outcome to allow for further interactions if needed.
  const handleConfirmAndPay = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    const token = localStorage.getItem("accessToken"); // Fallback if not using AuthContext

    try {
      const response = await fetch(`${baseUrl}/holidaze/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateFrom: bookingData.dateFrom,
          dateTo: bookingData.dateTo,
          guests: Number(bookingData.guests),
          venueId: venue.id,
        }),
      });

      if (response.ok) {
        navigate("/booking-confirmation", {
          state: {
            venue: venue,
            bookingData: bookingData,
            contactEmail: contactEmail,
          },
        });
      } else {
        const errData = await response.json();
        alert(
          `Booking failed: ${errData.errors?.[0]?.message || "Check login status."}`,
        );
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("A network error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20" role="main">
      {/* Hero Header */}
      <div
        className="h-64 w-full bg-cover bg-center relative flex items-center justify-center rounded-b-[40px] overflow-hidden"
        style={{ backgroundImage: "url('/box-filler.png')" }}
        role="banner"
      >
        <div className="absolute inset-0 bg-slate-900/40" aria-hidden="true"></div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white tracking-wide shadow-black">
          Your Adventure Checkout
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <form
          onSubmit={handleConfirmAndPay}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          aria-label="Checkout form"
        >
          {/* Billing Information Form */}
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-bold mb-8">Billing Information</h2>

            <div className="bg-white p-8 shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-100 rounded-lg space-y-6">
              {/* Name & Email */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">
                    Name
                  </label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3" aria-hidden="true">👤</span>
                    <input
                      id="name"
                      type="text"
                      required
                      defaultValue={user?.name || ""}
                      placeholder="Full Name"
                      className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3" aria-hidden="true">✉️</span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="example@stud.noroff.no"
                      className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-1">
                  Address
                </label>
                <div className="flex items-center border-b border-slate-300 py-2">
                  <span className="text-mint-green mr-3" aria-hidden="true">📍</span>
                  <input
                    id="address"
                    type="text"
                    required
                    placeholder="Street Address"
                    className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3" aria-hidden="true">🏙️</span>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="City"
                      className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-bold text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3" aria-hidden="true">📮</span>
                    <input
                      id="postalCode"
                      type="text"
                      required
                      placeholder="Postal code"
                      className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <h3 className="text-2xl font-bold pt-6 pb-2">Payment Details</h3>
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-bold text-slate-700 mb-1">
                  Card Number
                </label>
                <div className="flex items-center border-b border-slate-300 py-2">
                  <span className="text-mint-green mr-3" aria-hidden="true">💳</span>
                  <input
                    id="cardNumber"
                    type="text"
                    required
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-bold text-slate-700 mb-1">
                    Expiry
                  </label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3" aria-hidden="true">📅</span>
                    <input
                      id="expiry"
                      type="text"
                      required
                      placeholder="MM/YY"
                      className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-bold text-slate-700 mb-1">
                    CVC
                  </label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3" aria-hidden="true">🔒</span>
                    <input
                      id="cvc"
                      type="text"
                      required
                      placeholder="XXX"
                      className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="lg:col-span-4 mt-12 lg:mt-0" role="region" aria-label="Booking Summary">
            <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.08)] overflow-hidden sticky top-8">
              {/* Venue Image */}
              <div className="p-6 pb-0">
                <img
                  src={venue.media[0]?.url || "/fallback-image.jpg"}
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-image.jpg";
                  }}
                />
              </div>

              <div className="p-6 space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                  {venue.name}
                </h3>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Guests:</span>
                  <span className="font-semibold text-slate-900">
                    {bookingData.guests} Guest(s)
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Dates:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(bookingData.dateFrom).toLocaleDateString()} -{" "}
                    {new Date(bookingData.dateTo).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Price:</span>
                  <span className="font-semibold text-slate-900">
                    ${venue.price} x {diffDays} night(s)
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                  <span className="text-lg font-bold text-slate-900">
                    Total:
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    ${totalPrice}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  aria-busy={isProcessing}
                  className="w-full bg-mint-green text-deep-navy font-bold text-lg py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-400 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "CONFIRM AND PAY"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;