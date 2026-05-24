// This page is responsible for displaying the details of a specific venue when a user clicks on it from the list of venues. It fetches the venue details from the API using the venue ID from the URL parameters and displays them in a visually appealing way. It also includes error handling and loading states to enhance the user experience.
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 
import { type Venue } from "../types/venue";



// The SpecificVenuePage component is defined as a functional component. It uses the useParams hook to extract the venue ID from the URL, and it manages local state for the venue details, loading status, and any errors that may occur during data fetching. The useEffect hook is used to fetch the venue details from the API when the component mounts or when the venue ID changes. The component renders different UI states based on whether it's loading, if there's an error, or if the venue data is successfully fetched. It also includes a booking form that allows users to select check-in and check-out dates, as well as the number of guests, and then navigate to the checkout page with the booking details passed via React Router state.
const SpecificVenuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking state to capture user input
  const [bookingData, setBookingData] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    guests: 1,
  });

  // The useEffect hook is used to perform side effects in the component, in this case, fetching data from the API. We define an asynchronous function fetchVenueDetails that makes a GET request to the API endpoint for the specific venue using the ID from the URL parameters. We include error handling to catch any issues that may arise during the fetch operation, and we update the local state accordingly to reflect the loading status and any errors. This ensures that the user receives feedback while the data is being fetched and if any issues occur. The dependency array [id] ensures that the effect runs whenever the venue ID changes, allowing for dynamic fetching of different venues without needing to reload the page.
  useEffect(() => {
    const fetchVenueDetails = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        setIsLoading(true);
        // Added `&_bookings=true` to the fetch URL so the API returns the reservations we need to block out on the calendar.
        const response = await fetch(`${baseUrl}/holidaze/venues/${id}?_bookings=true`, {
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

  // This function takes all existing bookings for the venue and generates an array of every single Date object that falls within those booked ranges.
  const getExcludedDates = () => {
    if (!venue?.bookings || venue.bookings.length === 0) return [];
    
    const excludedDates: Date[] = [];
    venue.bookings.forEach((booking) => {
      const start = new Date(booking.dateFrom);
      const end = new Date(booking.dateTo);
      // Ensure timezones don't shift the dates incorrectly. This sets the time to the start of the day for both start and end dates, so we only deal with the date part when generating the excluded dates.
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        excludedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return excludedDates;
  };

  // Handler for booking submission that sends a POST request to the API to create a new booking for the venue. It includes the necessary headers for authentication and content type, and it sends the booking data in the request body. If the booking is successful, it redirects the user to a booking confirmation page. If there is an error during the booking process, it alerts the user to ensure they are logged in.
  const handleBooking = (e: React.SyntheticEvent) => {
    e.preventDefault();

    // Ensure dates are selected before allowing booking submission.
    if (!bookingData.dateFrom || !bookingData.dateTo) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    // Convert the Date objects back to ISO strings before passing to checkout
    const formattedBookingData = {
      dateFrom: bookingData.dateFrom.toISOString(),
      dateTo: bookingData.dateTo.toISOString(),
      guests: bookingData.guests,
    };

    // Pass the state to the new checkout route so we can display the booking summary there before final confirmation.
    navigate("/checkout", {
      state: {
        venue: venue,
        bookingData: formattedBookingData,
      },
    });
  };

  // Conditional rendering based on the loading state, error state, and whether the venue data is available. If the component is currently loading data, it displays a loading message. If there was an error during the fetch operation, it displays the error message. If the venue data was successfully fetched but is not found (e.g., if the ID is invalid), it displays a "Venue not found" message. Finally, if the venue data is successfully fetched and available, it renders the details of the venue in a structured and visually appealing layout.
  if (isLoading) {
    return (
      <div className="text-center text-white mt-20" role="status" aria-label="Loading venue details">
        Loading venue details...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 mt-20" role="alert" aria-live="assertive">{error}</div>;
  }

  if (!venue) {
    return <div className="text-center text-white mt-20" role="alert">Venue not found.</div>;
  }

  const excludedDates = getExcludedDates();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" role="main">
      <Link
        to="/venues"
        aria-label="Go back to the list of venues"
        className="text-mint-green hover:text-white transition-colors flex items-center gap-2 mb-8"
      >
        &larr; Back to Venues
      </Link>

      <div className="bg-deep-navy/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl" aria-labelledby="venue-heading">
        <h1 id="venue-heading" className="text-4xl font-extrabold text-white mb-2">
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
          {/* Venue Description and Amenities Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-white/80 leading-relaxed">{venue.description}</p>
          </div>

          <div className="bg-white/5 p-6 rounded-lg" aria-labelledby="amenities-heading">
            <h2 id="amenities-heading" className="text-xl font-bold text-white mb-4">Amenities</h2>
            <ul className="space-y-2 text-white/90" aria-label="Amenities list">
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
          aria-labelledby="booking-heading"
        >
          <h3 id="booking-heading" className="text-xl font-bold text-white mb-4">Book this Venue</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="checkInDate"
                className="text-xs text-white/60 mb-1"
              >
                Check-in Date
              </label>
              <DatePicker
                id="checkInDate"
                selected={bookingData.dateFrom}
                onChange={(date: Date | null) => 
                  setBookingData({ ...bookingData, dateFrom: date })
                }
                selectsStart
                startDate={bookingData.dateFrom}
                endDate={bookingData.dateTo}
                minDate={new Date()}
                excludeDates={excludedDates}
                placeholderText="Select Date"
                required
                aria-label="Select your check-in date"
                className="bg-deep-navy/50 p-2 rounded text-white w-full outline-none focus:ring-2 focus:ring-mint-green"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="checkOutDate"
                className="text-xs text-white/60 mb-1"
              >
                Check-out Date
              </label>
              <DatePicker
                id="checkOutDate"
                selected={bookingData.dateTo}
                onChange={(date: Date | null) => 
                  setBookingData({ ...bookingData, dateTo: date })
                }
                selectsEnd
                startDate={bookingData.dateFrom}
                endDate={bookingData.dateTo}
                minDate={bookingData.dateFrom || new Date()}
                excludeDates={excludedDates}
                placeholderText="Select Date"
                required
                aria-label="Select your check-out date"
                className="bg-deep-navy/50 p-2 rounded text-white w-full outline-none focus:ring-2 focus:ring-mint-green"
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
                className="bg-deep-navy/50 p-2 rounded text-white outline-none focus:ring-2 focus:ring-mint-green w-full"
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