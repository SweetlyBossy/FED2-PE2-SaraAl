// This page handles the display and management of the user's profile. It securely fetches profile data using the user's name and access token. It also provides a form to update the user's avatar and bio, and displays a list of their bookings.
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Booking, type FullProfileData } from "../types/user";

const ProfilePage: React.FC = () => {
  // Pull user data and authentication state from our global context to ensure we have the necessary credentials to fetch profile data and perform updates. This also allows us to update the global user data when we change the avatar, ensuring consistency across the app.
  const { user, isAuthenticated, accessToken, updateUserData } = useAuth();

  // Local state for profile data, loading, and form management is handled within this component to keep it self-contained and focused on the profile functionality.
  const [profile, setProfile] = useState<FullProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the update form (Bio and Avatar)
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State for managing a selected booking in the modal 
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editDateFrom, setEditDateFrom] = useState("");
  const [editDateTo, setEditDateTo] = useState("");
  const [editGuests, setEditGuests] = useState(1);
  const [isModalProcessing, setIsModalProcessing] = useState(false);

  // Helper function to fetch the fresh data right away so the UI updates without a manual page reload.
  const refreshProfileData = async () => {
    if (!user?.name || !accessToken) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      const response = await fetch(
        `${baseUrl}/holidaze/profiles/${user.name}?_bookings=true&_venues=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (err) {
      console.error("Failed to refresh profile content:", err);
    }
  };

  // Fetch the complete profile data when the component mounts or when the user's name or access token changes. This ensures we have the most up-to-date information, including the user's bookings and venue manager status. We use the ?_bookings=true flag to tell the API to include the user's reservations.
  useEffect(() => {
    const loadInitialProfile = async () => {
      if (!user?.name || !accessToken) return;

      // We pull the base URL and API key from environment variables to keep sensitive information out of our codebase and allow for easy configuration.
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        const response = await fetch(
          `${baseUrl}/holidaze/profiles/${user.name}?_bookings=true&_venues=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch profile data");

        const data = await response.json();
        setProfile(data.data);
        setBio(data.data.bio || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProfile();
  }, [user?.name, accessToken]);

  // Sends a PUT request to the base profile endpoint. It dynamically builds the payload to send the new bio, and only sends avatar data if a new URL was entered. After a successful update, it immediately fetches the fresh profile data to update the UI without a reload, and also updates the global auth context with the new avatar URL so that the header avatar changes as well. We also handle loading state and errors gracefully to ensure a smooth user experience.
  const handleUpdateProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user?.name || !accessToken) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    // Dynamically construct the payload to only include the avatar object if the user has entered a new URL. This way, we avoid accidentally overwriting the existing avatar with an empty value if they only want to update their bio. We also include alt text for accessibility.
    const payload: { bio: string; avatar?: { url: string; alt: string } } = {
      bio: bio,
    };

    // Only add the avatar object if the user typed a URL in the avatar input field. This way, if they only want to update their bio, we won't accidentally overwrite their existing avatar with an empty value. We also include an alt text for accessibility.
    if (avatarUrl.trim() !== "") {
      payload.avatar = {
        url: avatarUrl,
        alt: `${user.name}'s avatar`,
      };
    }

    try {
      setIsUpdating(true);

      // Send the update to the API using the base profile endpoint. This ensures that both the bio and avatar are updated in one request, and we handle any errors that come back from the API gracefully. We also make sure to include the necessary authentication headers.
      const response = await fetch(
        `${baseUrl}/holidaze/profiles/${user.name}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0]?.message || "Failed to update profile",
        );
      }

      // Fetch the fresh data right away so the UI updates without a reload! This ensures the user sees their new avatar and bio immediately after saving. We also update the global auth context with the new avatar URL so that the header avatar changes as well.
      const refreshRes = await fetch(
        `${baseUrl}/holidaze/profiles/${user.name}?_bookings=true&_venues=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      const refreshData = await refreshRes.json();

      // Update local state to reflect changes immediately. This way, the user sees their updated profile info right away without needing to refresh the page. We also update the global auth context with the new avatar URL so that the header avatar changes as well.
      setProfile(refreshData.data);
      setBio(refreshData.data.bio || "");

      // Update the global auth context so the header avatar changes too - we only update it if a new avatar URL was provided to avoid overwriting it with an empty value if they only updated their bio.
      if (refreshData.data.avatar) {
        updateUserData({ avatar: refreshData.data.avatar });
      }

      // Clear the image input after successful update. This provides a nice UX touch, signaling to the user that their new avatar URL has been accepted and they can enter a new one if they want to change it again. We only clear it after a successful update to avoid frustrating the user by clearing their input if there was an error during the update process.
      setAvatarUrl("");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler to open the edit modal with the selected booking's existing data pre-filled in the form. This allows users to easily modify their existing bookings by showing them the current details and letting them make changes as needed. We also set the selected booking in state so we know which booking is being edited when we submit the changes.
  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);

    // Using split("T")[0] directly from the API string prevents timezone shifting bugs where the date could jump backward by a day!
    setEditDateFrom(booking.dateFrom.split("T")[0]);
    setEditDateTo(booking.dateTo.split("T")[0]);
    setEditGuests(booking.guests);
  };

  // Handler to save edited booking changes. It sends a PUT request to the API with the updated booking data. After a successful update, it refreshes the profile data to reflect the changes in the UI immediately. We also handle loading state and errors gracefully to ensure a smooth user experience while editing a booking.
  const handleSaveBookingChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedBooking || !accessToken) return;

    // Build today's date string safely (YYYY-MM-DD) based on local browser time
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // Extract original dates directly from the API string to avoid timezone bugs where the date could shift backward by a day if we create new Date objects from them. This way, we can accurately compare the original booking dates with the edited dates to enforce our strict lock on changing dates for bookings that have already begun.
    const originalDateFrom = selectedBooking.dateFrom.split("T")[0];
    const originalDateTo = selectedBooking.dateTo.split("T")[0];

    const isDateChanged =
      editDateFrom !== originalDateFrom || editDateTo !== originalDateTo;

    // Strict Lock: If the string for the start date is today or earlier, lock it!
    const hasBegun = originalDateFrom <= todayStr;

    // Only block the request if the trip has begun AND they are trying to alter the dates
    if (hasBegun && isDateChanged) {
      alert("You cannot change the dates of a booking that has already begun.");
      return;
    }

    // Secondary safety lock: if it hasn't begun, ensure they don't try to change the start date to the past
    if (!hasBegun && isDateChanged && editDateFrom < todayStr) {
      alert("You cannot select a new check-in date in the past.");
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsModalProcessing(true);
      const response = await fetch(
        `${baseUrl}/holidaze/bookings/${selectedBooking.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateFrom: editDateFrom,
            dateTo: editDateTo,
            guests: Number(editGuests),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0]?.message || "Failed to modify reservation.",
        );
      }

      await refreshProfileData();
      setSelectedBooking(null);
      alert("Reservation updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsModalProcessing(false);
    }
  };

  // Handler to cancel/delete a booking reservation. It sends a DELETE request to the API to remove the booking. After a successful cancellation, it refreshes the profile data to reflect the changes in the UI immediately. We also handle loading state and errors gracefully to ensure a smooth user experience while canceling a booking. Additionally, we include a confirmation prompt to prevent accidental cancellations, ensuring that users are making an informed decision before removing their reservation.
  const handleCancelBooking = async () => {
    if (!selectedBooking || !accessToken) return;

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking reservation?",
    );
    if (!confirmCancel) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      setIsModalProcessing(true);
      const response = await fetch(
        `${baseUrl}/holidaze/bookings/${selectedBooking.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        },
      );

      if (!response.ok)
        throw new Error("Could not drop the booking reservation.");

      await refreshProfileData();
      setSelectedBooking(null);
      alert("Booking canceled successfully.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to cancel reservation.",
      );
    } finally {
      setIsModalProcessing(false);
    }
  };

  // If the user is not authenticated, we redirect them to the login page. This ensures that only logged-in users can access the profile page and its functionalities, maintaining security and a proper user flow.
  if (!isAuthenticated) return <Navigate to="/login" />;

  // While the profile data is loading, we show a centered spinner to indicate that the content is being fetched. This provides feedback to the user and improves the overall experience by preventing confusion or frustration during loading times. The spinner is styled to match the overall design of the app and is displayed in a way that keeps it visually appealing and unobtrusive while still clearly indicating that loading is in progress.
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-green"></div>
      </div>
    );
  }

  // If there's an error or the profile data is missing, we show a user-friendly error message with a link to return home. This ensures that users aren't left with a broken page and can easily navigate back to safety. We also handle the case where the profile might not be found gracefully.
  if (error || !profile) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center bg-slate-100">
        <div className="text-red-400 bg-white shadow-lg p-6 rounded-lg text-center">
          <p className="text-xl mb-4 text-slate-800">
            ⚠️ {error || "Profile not found"}
          </p>
          <Link to="/" className="text-mint-green font-bold hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Separate upcoming and past bookings based on the current date. This allows us to display them in different sections of the profile page, providing a clear distinction between future plans and past experiences. We also handle the case where there may be no bookings gracefully.
  const todayDateObj = new Date();
  const upcoming: Booking[] =
    profile.bookings?.filter((b) => new Date(b.dateTo) >= todayDateObj) || [];
  const past: Booking[] =
    profile.bookings?.filter((b) => new Date(b.dateTo) < todayDateObj) || [];

  // We calculate if the currently selected booking is locked right before rendering the HTML.
  // This guarantees React always has the correct true/false value when opening the modal!
  let isModalLocked = false;
  if (selectedBooking) {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const bookingStartStr = selectedBooking.dateFrom.split("T")[0];
    isModalLocked = bookingStartStr <= todayStr;
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Hero Header Section */}
      <div
        className="h-80 w-full bg-cover bg-center shadow-inner relative z-0"
        style={{ backgroundImage: "url('/box-filler.png')" }}
      >
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Profile Details & Settings */}
          <aside className="lg:col-span-1">
            <div className="bg-deep-navy/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <img
                  src={profile.avatar?.url || "/fallback-avatar.png"}
                  alt={profile.name}
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-mint-green shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-avatar.png";
                  }}
                />
              </div>

              {/* Profile Name */}
              <h1 className="text-3xl font-extrabold text-white mb-6">
                {profile.name}
              </h1>

              <hr className="border-white/10 mb-6" />

              {/* Unified Bio & Avatar Update Form */}
              <div className="text-left space-y-4">
                <form
                  onSubmit={handleUpdateProfile}
                  className="flex flex-col gap-4"
                >
                  {/* Bio Input Section */}
                  <div>
                    <label
                      htmlFor="bio"
                      className="text-white/70 font-semibold mb-1 block text-sm"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-black/30 border border-white/20 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm outline-none focus:border-mint-green resize-none h-24"
                    />
                  </div>

                  {/* Update Avatar Section */}
                  <div>
                    <label
                      htmlFor="avatarUrl"
                      className="text-white/70 font-semibold mb-1 block text-sm"
                    >
                      Update Avatar
                    </label>
                    <input
                      id="avatarUrl"
                      type="url"
                      placeholder="Image URL..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-black/30 border border-white/20 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm outline-none focus:border-mint-green"
                    />
                  </div>

                  {/* Unified Save Button */}
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-mint-green text-deep-navy font-bold py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-colors mt-2"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-1 lg:col-span-3 space-y-10 mt-12 lg:mt-24">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-white/50 inline-block px-4 py-1 rounded backdrop-blur-sm">
                My Bookings
              </h2>
              {upcoming.length > 0 ? (
                <div className="space-y-6">
                  {upcoming.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 flex flex-col relative group"
                    >
                      <img
                        src={b.venue?.media[0]?.url || "/fallback-image.jpg"}
                        className="w-full h-64 object-cover bg-slate-200"
                        alt={b.venue?.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/fallback-image.jpg";
                        }}
                      />

                      {/* Interactive Edit Management Button */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <button
                          onClick={() => openEditModal(b)}
                          className="bg-mint-green text-deep-navy font-bold px-6 py-2 rounded-full hover:bg-emerald-400 transition-colors shadow-md text-sm"
                        >
                          ⚙️ Edit / Cancel
                        </button>
                      </div>

                      {/* Venue Details Routing Button */}
                      <div className="absolute bottom-4 right-4 z-20">
                        <Link
                          to={`/venues/${b.venue?.id}`}
                          className="bg-slate-400/90 backdrop-blur-sm text-white font-bold px-8 py-2 rounded-full shadow-md text-sm hover:bg-slate-500 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
                  No upcoming bookings.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Past Bookings
              </h2>
              <div className="bg-slate-200/50 rounded-2xl p-6 min-h-37.5">
                {past.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {past.map((b) => (
                      <Link
                        to={`/venues/${b.venue?.id}`}
                        key={b.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden flex h-24 border border-slate-100 p-2 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <img
                          src={b.venue?.media[0]?.url || "/fallback-image.jpg"}
                          className="h-full w-1/3 object-cover rounded"
                          alt={b.venue?.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                        <div className="w-2/3 pl-3 flex flex-col justify-center">
                          <h4 className="font-bold text-slate-800 text-sm truncate">
                            {b.venue?.name || "Unknown"}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(b.dateFrom).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No past bookings found.
                  </p>
                )}
              </div>
            </section>

            {profile.venueManager && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  My Venues
                </h2>
                <div className="bg-slate-200/50 rounded-2xl p-6 min-h-62.5">
                  {profile.venues && profile.venues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile.venues.map((v) => (
                        <Link
                          to={`/venues/${v.id}`}
                          key={v.id}
                          className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-slate-100 pb-16 relative cursor-pointer"
                        >
                          <img
                            src={v.media[0]?.url || "/fallback-image.jpg"}
                            alt={v.name}
                            className="w-full h-40 object-cover absolute top-0 left-0 right-0 z-0 rounded-2xl m-3 bg-slate-200"
                            style={{ width: "calc(100% - 24px)" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/fallback-image.jpg";
                            }}
                          />
                          <div className="h-44"></div>
                          <div className="px-6 pb-4">
                            <h4 className="font-bold text-slate-800">
                              {v.name}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-10">
                      You haven't created any venues yet.
                    </p>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Overlay Edit/Cancel Modal Popup */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold truncate max-w-70">
                  Manage Reservation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {selectedBooking.venue?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/70 hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Actions Form */}
            <form onSubmit={handleSaveBookingChange} className="p-6 space-y-5">
              {/* DATE INPUTS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="editCheckIn"
                    className="block text-xs font-bold text-slate-600 mb-1"
                  >
                    Check-In{" "}
                    {isModalLocked && (
                      <span className="text-red-500">(Locked)</span>
                    )}
                  </label>
                  <input
                    id="editCheckIn"
                    type="date"
                    disabled={isModalLocked} // Disable if started to prevent changing dates on active trips
                    required
                    value={editDateFrom}
                    onChange={(e) => setEditDateFrom(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-sm ${isModalLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-slate-800 border-slate-200 focus:border-mint-green"}`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="editCheckOut"
                    className="block text-xs font-bold text-slate-600 mb-1"
                  >
                    Check-Out{" "}
                    {isModalLocked && (
                      <span className="text-red-500">(Locked)</span>
                    )}
                  </label>
                  <input
                    id="editCheckOut"
                    type="date"
                    disabled={isModalLocked} // Disable if started to prevent changing dates on active trips
                    required
                    value={editDateTo}
                    onChange={(e) => setEditDateTo(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-sm ${isModalLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-slate-800 border-slate-200 focus:border-mint-green"}`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="editGuests"
                  className="block text-xs font-bold text-slate-600 mb-1"
                >
                  Number of Guests
                </label>
                <input
                  id="editGuests"
                  type="number"
                  min="1"
                  max={selectedBooking.venue?.maxGuests || 99}
                  required
                  value={editGuests}
                  onChange={(e) => setEditGuests(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:border-mint-green"
                />
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Form Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={isModalProcessing}
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isModalProcessing ? "Saving..." : "Save Date Changes"}
                </button>

                <button
                  type="button"
                  disabled={isModalProcessing}
                  onClick={handleCancelBooking}
                  className="w-full bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isModalProcessing
                    ? "Processing..."
                    : "Cancel Booking Entirely"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
