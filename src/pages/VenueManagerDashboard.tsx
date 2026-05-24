// The VenueManagerDashboard component provides a comprehensive dashboard for venue managers to oversee their listed venues and manage bookings. It fetches the manager's venues along with associated bookings, displays them in an organized manner, and allows the manager to decline or cancel upcoming bookings directly from the dashboard. The component also includes a summary section that highlights key metrics such as total venues, active bookings, and past bookings. It ensures that only authenticated venue managers can access the dashboard, redirecting others to the appropriate pages.
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Venue } from "../types/venue";
import { type Booking } from "../types/user";

// Extend the Booking type to include the venue name for easier display in the dashboard. This allows us to show which venue each booking is associated with without needing to cross-reference the venue data separately when rendering the bookings list.
export interface ExtendedBooking extends Booking {
  venueName: string;
}
// The DashboardPage component is the main component for the venue manager's dashboard. It handles data fetching, state management, and rendering of the dashboard UI. It ensures that only authenticated venue managers can access the page and provides functionality to manage venues and bookings effectively.
const DashboardPage: React.FC = () => {
  const { user, accessToken, isAuthenticated, venueManager } = useAuth();
  // State variables to hold the list of venues, all bookings, any error messages, a trigger for refreshing data, and a loading state to manage the UI while data is being fetched.
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allBookings, setAllBookings] = useState<ExtendedBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  // The refreshTrigger state is used to trigger a re-fetch of the dashboard data after certain actions, such as declining a booking. By incrementing this value, we can cause the useEffect hook to run again and fetch the latest data without needing to manually call the data fetching function.
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // The isLoading state is initialized based on whether the user is authenticated and is a venue manager. This ensures that the loading spinner is shown while the dashboard data is being fetched for authenticated venue managers, and it prevents unnecessary loading states for unauthenticated users or those who are not venue managers.
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!(isAuthenticated && venueManager);
  });

  // The useEffect hook is responsible for fetching the dashboard data when the component mounts and whenever the dependencies change (such as user name, access token, authentication status, venue manager status, or the refresh trigger). It checks if the user is authenticated and is a venue manager before attempting to fetch the data. If the conditions are not met, it sets the loading state to false and exits early. If the conditions are met, it makes an API call to fetch the venues and their associated bookings, processes the data, and updates the state accordingly. It also handles any errors that may occur during the fetch process.
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !venueManager || !user?.name || !accessToken) {
        setIsLoading(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;
      // Reset error state and set loading to true before starting the fetch process.
      try {
        const response = await fetch(
          `${baseUrl}/holidaze/profiles/${user.name}/venues?_bookings=true&_customer=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
            },
          },
        );
        // If the response is not OK, throw an error to be caught in the catch block. This ensures that any issues with the API call are properly handled and communicated to the user.
        if (!response.ok) throw new Error("Failed to load dashboard data.");
        // Parse the response data and extract the venues and their associated bookings. The bookings are then transformed into an array of ExtendedBooking objects, which include the venue name for easier display in the dashboard. The bookings are also sorted by their start date to ensure they are displayed in chronological order.
        const data = await response.json();
        const fetchedVenues: Venue[] = data.data;
        setVenues(fetchedVenues);
        // Extract bookings from all venues and create an array of ExtendedBooking objects that include the venue name for easier display in the dashboard. This allows us to show which venue each booking is associated with without needing to cross-reference the venue data separately when rendering the bookings list.
        const extractedBookings: ExtendedBooking[] = [];
        fetchedVenues.forEach((venue) => {
          if (venue.bookings && venue.bookings.length > 0) {
            venue.bookings.forEach((booking) => {
              extractedBookings.push({
                ...booking,
                venueName: venue.name,
              } as ExtendedBooking);
            });
          }
        });
        // Sort the extracted bookings by their start date (dateFrom) to ensure they are displayed in chronological order in the dashboard. This enhances the user experience by allowing venue managers to easily see upcoming bookings in the order they will occur.
        extractedBookings.sort(
          (a, b) =>
            new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime(),
        );
        setAllBookings(extractedBookings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    // Call the function to load the dashboard data when the component mounts and whenever the dependencies change. This ensures that the dashboard always displays the most up-to-date information, especially after actions that may modify the data, such as declining a booking.
    loadDashboardData();
    // The dependencies for this useEffect include user name, access token, authentication status, venue manager status, and the refresh trigger. This ensures that the dashboard data is re-fetched whenever any of these values change, allowing for dynamic updates to the dashboard based on user actions or changes in authentication state.
  }, [user?.name, accessToken, isAuthenticated, venueManager, refreshTrigger]);

  // The handleDeleteVenue function allows a venue manager to permanently delete one of their listed venues. It prompts for confirmation to prevent accidental deletions. If confirmed, it makes a DELETE request to the API. On success, it alerts the user and increments the refreshTrigger to immediately update the dashboard UI, removing the deleted venue from the list.
  const handleDeleteVenue = async (venueId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this venue? This cannot be undone.");
    if (!confirmDelete || !accessToken) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsLoading(true); 

      const response = await fetch(`${baseUrl}/holidaze/venues/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
        },
      });

      if (!response.ok) throw new Error("Could not delete the venue.");
      
      alert("Venue deleted successfully.");
      
      // Increment the trigger to instantly refresh the dashboard data and reflect the deletion without needing to wait for a manual refresh or navigation.
      setRefreshTrigger((prev) => prev + 1); 
      
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete venue.");
      setIsLoading(false);
    }
  };

  // The handleDeclineBooking function is responsible for handling the decline or cancellation of a booking. It prompts the user for confirmation before proceeding with the cancellation. If the user confirms, it makes an API call to delete the booking. If the API call is successful, it alerts the user that the booking has been declined and triggers a refresh of the dashboard data to reflect the change. If there is an error during the API call, it alerts the user with the error message. This function ensures that venue managers can manage their bookings directly from the dashboard and that any changes are immediately reflected in the UI.
  const handleDeclineBooking = async (bookingId: string) => {
    const confirmDecline = window.confirm(
      "Are you sure you want to decline and cancel this booking?",
    );
    if (!confirmDecline || !accessToken) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsLoading(true);

      const response = await fetch(
        `${baseUrl}/holidaze/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        },
      );

      if (!response.ok) throw new Error("Could not delete the booking.");

      alert("Booking declined successfully.");

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline booking.");
      setIsLoading(false);
    }
  };
  // Redirect users who are not authenticated to the login page, and users who are authenticated but not venue managers to their profile page. This ensures that only authorized users can access the dashboard and that others are directed to the appropriate pages based on their authentication and role status.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  // If the data is still loading, display a loading spinner to indicate that the dashboard is being prepared. This provides feedback to the user while the necessary data is being fetched and processed before the dashboard can be displayed.
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center bg-slate-900" role="status" aria-label="Loading dashboard data">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-green" aria-hidden="true"></div>
      </div>
    );
  }

  // Separate upcoming bookings from past bookings based on the current date. This allows the dashboard to display active bookings in a dedicated section, while past bookings can be shown in a summary or history section. The separation is done by comparing the end date of each booking (dateTo) with the current date, categorizing them accordingly.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Filter the allBookings array to create two separate arrays: one for upcoming bookings (where the end date is today or in the future) and one for past bookings (where the end date is before today). This categorization allows the dashboard to display active bookings prominently while still keeping a record of past bookings for reference.
  const upcomingBookings = allBookings.filter(
    (b) => new Date(b.dateTo) >= today,
  );
  const pastBookings = allBookings.filter((b) => new Date(b.dateTo) < today);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat font-inter relative pb-20 pt-28"
      style={{ backgroundImage: "url('/background.png')" }}
      role="main"
    >
      <div className="absolute inset-0 bg-slate-900/60 z-0" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
        <h1 id="dashboard-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-8 sm:mb-10 tracking-wider shadow-black drop-shadow-md">
          VENUE MANAGER DASHBOARD
        </h1>

        {error && (
          <div className="bg-red-500/80 p-4 rounded-lg text-white text-center mb-6 backdrop-blur-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-[rgba(177,197,211,0.2)] backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl" aria-labelledby="manage-venues-heading">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
              <h2 id="manage-venues-heading" className="text-xl font-bold text-white">
                Manage Your Venues
              </h2>
              <Link
                to="/create-venue"
                aria-label="Create a New Venue"
                className="bg-mint-green text-slate-900 font-bold px-4 py-2 rounded-full text-sm hover:bg-emerald-400 transition-colors shadow-lg w-full sm:w-auto text-center"
              >
                + Create New Venue
              </Link>
            </div>

            {venues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar" role="list">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    role="listitem"
                    className="bg-slate-800/60 rounded-xl flex flex-col sm:flex-row overflow-hidden border border-white/10 hover:border-mint-green/50 transition-colors"
                  >
                    <img
                      src={venue.media[0]?.url || "/fallback-image.jpg"}
                      alt={venue.name}
                      className="w-full sm:w-1/3 h-32 sm:h-auto object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/fallback-image.jpg";
                      }}
                    />
                    <div className="w-full sm:w-2/3 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm truncate">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <span aria-hidden="true">📍</span>{" "}
                          {venue.location.address ||
                            venue.location.city ||
                            "Unknown"}
                          {venue.location.country ||
                            venue.location.continent}{" "}
                        </p>
                        <span className="inline-block mt-2 text-sm font-bold px-2 py-0.5 bg-mint-green/20 text-mint-green rounded-full">
                          Active
                        </span>
                      </div>
                      
                      {/* Edit and Delete buttons */}
                      <div className="flex flex-col gap-1.5 mt-3">
                        <Link
                          to={`/edit-venue/${venue.id}`}
                          aria-label={`Edit details for ${venue.name}`}
                          className="bg-mint-green/90 text-slate-900 text-xs font-bold py-1.5 px-3 rounded text-center hover:bg-mint-green transition-colors"
                        >
                          Edit Details
                        </Link>
                        <button 
                          onClick={() => handleDeleteVenue(venue.id)}
                          aria-label={`Delete venue ${venue.name}`}
                          className="bg-red-500/20 text-red-400 text-xs font-bold py-1.5 px-3 rounded text-center hover:bg-red-500 hover:text-white transition-colors border border-red-500/50"
                        >
                          Delete Venue
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-300 text-center py-10">
                You haven't listed any venues yet.
              </p>
            )}
          </div>

          <div className="lg:col-span-1 bg-[rgba(177,197,211,0.2)] backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl h-fit" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              Summary
            </h2>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Venues:</span>
                <span className="text-white text-lg" aria-label={`${venues.length} Total Venues`}>{venues.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Active Bookings:</span>
                <span className="text-white text-lg" aria-label={`${upcomingBookings.length} Active Bookings`}>
                  {upcomingBookings.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Past Bookings:</span>
                <span className="text-white text-lg" aria-label={`${pastBookings.length} Past Bookings`}>
                  {pastBookings.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(177,197,211,0.2)] backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl overflow-hidden" aria-labelledby="manage-bookings-heading">
          <h2 id="manage-bookings-heading" className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
            Manage Upcoming Bookings
          </h2>

          <div>
            {upcomingBookings.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap" aria-label="Upcoming Bookings Table">
                    <thead>
                      <tr className="text-slate-300 border-b border-white/10">
                        <th className="pb-3 font-semibold" scope="col">Venue</th>
                        <th className="pb-3 font-semibold" scope="col">Guest</th>
                        <th className="pb-3 font-semibold" scope="col">Dates</th>
                        <th className="pb-3 font-semibold text-center" scope="col">Guests</th>
                        <th className="pb-3 font-semibold text-right" scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {upcomingBookings.map((booking) => {
                        const fromDate = new Date(
                          booking.dateFrom,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        const toDate = new Date(booking.dateTo).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        );

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 pr-4">
                              <p className="font-bold text-white truncate max-w-37.5">
                                {booking.venueName}
                              </p>
                            </td>
                            <td className="py-4 pr-4">
                              <p className="text-slate-300">
                                {booking.customer?.name || "Unknown Guest"}
                              </p>
                            </td>
                            <td className="py-4 pr-4">
                              <p className="text-slate-300">
                                {fromDate} — {toDate}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <p className="text-slate-300">{booking.guests}</p>
                            </td>
                            <td className="py-4 pl-4 text-right flex justify-end gap-2">
                              <span className="bg-mint-green/20 text-mint-green font-bold px-4 py-1.5 rounded-full text-xs flex items-center">
                                Confirmed
                              </span>
                              <button
                                onClick={() => handleDeclineBooking(booking.id)}
                                aria-label={`Decline or cancel booking for ${booking.customer?.name || "Unknown Guest"} at ${booking.venueName}`}
                                className="bg-red-500/80 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded-full text-xs transition-colors border border-red-400"
                              >
                                Decline / Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile version of the bookings table */}
                <div className="md:hidden flex flex-col gap-4">
                  {upcomingBookings.map((booking) => {
                    const fromDate = new Date(booking.dateFrom).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const toDate = new Date(booking.dateTo).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <div key={booking.id} className="bg-slate-800/60 rounded-xl p-4 border border-white/10 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white text-sm truncate">{booking.venueName}</h3>
                          <span className="bg-mint-green/20 text-mint-green font-bold px-2 py-1 rounded-full text-xs whitespace-nowrap shrink-0">
                            Confirmed
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div className="text-slate-400 text-xs">Guest</div>
                          <div className="text-white text-right truncate">{booking.customer?.name || "Unknown Guest"}</div>
                          
                          <div className="text-slate-400 text-xs">Dates</div>
                          <div className="text-white text-right text-xs whitespace-nowrap">{fromDate}
                          <div className="text-white text-right text-xs whitespace-nowrap">{toDate}</div>
                          </div>
                          
                          <div className="text-slate-400 text-xs">Guests</div>
                          <div className="text-white text-right">{booking.guests}</div>
                        </div>

                        <button
                          onClick={() => handleDeclineBooking(booking.id)}
                          aria-label={`Decline or cancel booking for ${booking.customer?.name || "Unknown Guest"} at ${booking.venueName}`}
                          className="mt-2 w-full bg-red-500/80 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-full text-xs transition-colors border border-red-400 text-center"
                        >
                          Decline / Cancel
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-300">
                <p>You have no upcoming bookings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;