import React, { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { type Venue } from "../types/venue";

// Define the shape of the data passed from the previous page
interface CheckoutState {
  venue: Venue;
  bookingData: {
    dateFrom: string;
    dateTo: string;
    guests: number;
  };
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Retrieve the hidden state passed from SpecificVenuePage
  const state = location.state as CheckoutState;

  // If a user tries to access /checkout directly without coming from a venue, send them back
  if (!state || !state.venue) {
    return <Navigate to="/venues" />;
  }

  const { venue, bookingData } = state;

  // Calculate the total price based on dates
  const checkIn = new Date(bookingData.dateFrom);
  const checkOut = new Date(bookingData.dateTo);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Default to 1 if same day
  const totalPrice = diffDays * venue.price;

  // The ACTUAL API call to create the booking happens here
  const handleConfirmAndPay = async (e: React.FormEvent) => {
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
        // Booking successful! Send them to their profile to see it.
        alert("Booking Confirmed!");
        navigate("/profile");
      } else {
        const errData = await response.json();
        alert(`Booking failed: ${errData.errors?.[0]?.message || "Check login status."}`);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("A network error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* Hero Header */}
      <div className="h-64 w-full bg-cover bg-center relative flex items-center justify-center rounded-b-[40px] overflow-hidden" style={{ backgroundImage: "url('/box-filler.png')" }}>
        <div className="absolute inset-0 bg-slate-900/40"></div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white tracking-wide shadow-black">
          Your Adventure Checkout
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <form onSubmit={handleConfirmAndPay} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Billing Information Form */}
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-bold mb-8">Billing Information</h2>
            
            <div className="bg-white p-8 shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-100 rounded-lg space-y-6">
              
              {/* Name & Email */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3">👤</span>
                    <input type="text" required placeholder="Full Name" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3">✉️</span>
                    <input type="email" required placeholder="example@stud.noroff.no" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                <div className="flex items-center border-b border-slate-300 py-2">
                  <span className="text-mint-green mr-3">📍</span>
                  <input type="text" required placeholder="Street Address" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3">🏙️</span>
                    <input type="text" required placeholder="City" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Postal Code</label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3">📮</span>
                    <input type="text" required placeholder="Postal code" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <h3 className="text-2xl font-bold pt-6 pb-2">Payment Details</h3>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Card Number</label>
                <div className="flex items-center border-b border-slate-300 py-2">
                  <span className="text-mint-green mr-3">💳</span>
                  <input type="text" required placeholder="XXXX XXXX XXXX XXXX" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Expiry</label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3">📅</span>
                    <input type="text" required placeholder="MM/YY" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">CVC</label>
                  <div className="flex items-center border-b border-slate-300 py-2">
                    <span className="text-mint-green mr-3">🔒</span>
                    <input type="text" required placeholder="XXX" className="appearance-none bg-transparent border-none w-full text-slate-700 leading-tight focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.08)] overflow-hidden sticky top-8">
              
              {/* Venue Image */}
              <div className="p-6 pb-0">
                <img 
                  src={venue.media[0]?.url || "/fallback-image.jpg"} 
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/fallback-image.jpg"; }}
                />
              </div>

              <div className="p-6 space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                  {venue.name}
                </h3>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Guests:</span>
                  <span className="font-semibold text-slate-900">{bookingData.guests} Guest(s)</span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Dates:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(bookingData.dateFrom).toLocaleDateString()} - {new Date(bookingData.dateTo).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Price:</span>
                  <span className="font-semibold text-slate-900">${venue.price} x {diffDays} night(s)</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                  <span className="text-lg font-bold text-slate-900">Total:</span>
                  <span className="text-xl font-extrabold text-slate-900">${totalPrice}</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
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