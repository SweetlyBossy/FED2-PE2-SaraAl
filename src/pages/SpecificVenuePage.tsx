// This page is responsible for displaying the details of a specific venue when a user clicks on it from the list of venues. It fetches the venue details from the API using the venue ID from the URL parameters and displays them in a visually appealing way. It also includes error handling and loading states to enhance the user experience.
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { type Venue } from "../types/venue";

// The SpecificVenuePage component is defined as a functional component. It uses the useParams hook to extract the venue ID from the URL, and it manages local state for the venue details, loading status, and any errors that may occur during data fetching. The useEffect hook is used to fetch the venue details from the API when the component mounts or when the venue ID changes. The component renders different UI states based on whether it's loading, if there's an error, or if the venue data is successfully fetched.
const SpecificVenuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking state to capture user input
  const [bookingData, setBookingData] = useState({
    dateFrom: "",
    dateTo: "",
    guests: 1,
  });

  // The useEffect hook is used to perform side effects in the component, in this case, fetching data from the API. We define an asynchronous function fetchVenueDetails that makes a GET request to the API endpoint for the specific venue using the ID from the URL parameters. We include error handling to catch any issues that may arise during the fetch operation, and we update the local state accordingly to reflect the loading status and any errors. This ensures that the user receives feedback while the data is being fetched and if any issues occur.
  useEffect(() => {
    const fetchVenueDetails = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/holidaze/venues/${id}`, {
          headers: {
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch venue details");

        const data = await response.json();
        setVenue(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchVenueDetails();
    }
  }, [id]);

  // Handler for booking submission that sends a POST request to the API to create a new booking for the venue. It includes the necessary headers for authentication and content type, and it sends the booking data in the request body. If the booking is successful, it redirects the user to a booking confirmation page. If there is an error during the booking process, it alerts the user to ensure they are logged in.
  const handleBooking = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${baseUrl}/holidaze/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          guests: Number(bookingData.guests),
          venueId: id,
        }),
      });

      if (response.ok) {
        window.location.href = "/booking-confirmation";
      } else {
        alert("Booking failed. Please ensure you are logged in.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  // Conditional rendering based on the loading state, error state, and whether the venue data is available. If the component is currently loading data, it displays a loading message. If there was an error during the fetch operation, it displays the error message. If the venue data was successfully fetched but is not found (e.g., if the ID is invalid), it displays a "Venue not found" message. Finally, if the venue data is successfully fetched and available, it renders the details of the venue in a structured and visually appealing layout.
  if (isLoading)
    return (
      <div className="text-center text-white mt-20">
        Loading venue details...
      </div>
    );
  if (error)
    return <div className="text-center text-red-400 mt-20">{error}</div>;
  if (!venue)
    return <div className="text-center text-white mt-20">Venue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        to="/venues"
        aria-label="Go back to the list of venues"
        className="text-mint-green hover:text-white transition-colors flex items-center gap-2 mb-8"
      >
        &larr; Back to Venues
      </Link>

      <div className="bg-deep-navy/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          {venue.name}
        </h1>
        <p className="text-mint-green text-xl font-semibold mb-6">
          ${venue.price} / night
        </p>

        {venue.media && venue.media.length > 0 && (
          <img
            src={venue.media[0].url}
            alt={venue.media[0].alt || venue.name}
            className="w-full h-80 object-cover rounded-xl mb-8 shadow-lg"
          />
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-white/80 leading-relaxed">{venue.description}</p>
          </div>

          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Amenities</h2>
            <ul className="space-y-2 text-white/90">
              <li>{venue.meta.wifi ? "✅ WiFi" : "❌ WiFi"}</li>
              <li>{venue.meta.parking ? "✅ Parking" : "❌ Parking"}</li>
              <li>{venue.meta.breakfast ? "✅ Breakfast" : "❌ Breakfast"}</li>
              <li>{venue.meta.pets ? "✅ Pets Allowed" : "❌ No Pets"}</li>
            </ul>
            <p className="mt-6 text-mint-green font-bold">
              Max Guests: {venue.maxGuests}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <form
          onSubmit={handleBooking}
          className="bg-white/10 p-6 rounded-lg mt-8 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Book this Venue</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="checkInDate"
                className="text-xs text-white/60 mb-1"
              >
                Check-in Date
              </label>
              <input
                id="checkInDate"
                type="date"
                required
                aria-label="Select your check-in date"
                onChange={(e) =>
                  setBookingData({ ...bookingData, dateFrom: e.target.value })
                }
                className="bg-deep-navy/50 p-2 rounded text-white"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="checkOutDate"
                className="text-xs text-white/60 mb-1"
              >
                Check-out Date
              </label>
              <input
                id="checkOutDate"
                type="date"
                required
                aria-label="Select your check-out date"
                onChange={(e) =>
                  setBookingData({ ...bookingData, dateTo: e.target.value })
                }
                className="bg-deep-navy/50 p-2 rounded text-white"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="guestCount"
                className="text-xs text-white/60 mb-1"
              >
                Number of Guests
              </label>
              <input
                id="guestCount"
                type="number"
                min="1"
                max={venue.maxGuests}
                placeholder="How many guests?"
                required
                aria-label={`Enter number of guests, maximum allowed is ${venue.maxGuests}`}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    guests: parseInt(e.target.value),
                  })
                }
                className="bg-deep-navy/50 p-2 rounded text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full bg-mint-green text-deep-navy font-bold py-2 rounded hover:opacity-90 transition"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default SpecificVenuePage;
