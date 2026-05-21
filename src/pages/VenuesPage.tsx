// This page is responsible for displaying a list of venues with advanced search and filtering capabilities, along with pagination for better user experience. The UI is designed to be visually appealing and user-friendly, with a focus on performance and accessibility. The code is structured to be maintainable and scalable for future enhancements.
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { type Venue, type FilterState } from "../types/venue";

// This component fetches and displays a list of venues with advanced search and filtering capabilities, along with pagination for better user experience. The UI is designed to be visually appealing and user-friendly, with a focus on performance and accessibility. The code is structured to be maintainable and scalable for future enhancements.
const VenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State - showing 25 venues per page for better performance and user experience. This allows users to navigate through the list of venues without being overwhelmed by too much information at once, and it also improves the loading times by only rendering a subset of venues at a time.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 30; // Adjust this number based on how many venues you want to show per page

  // Search and Filter States - allowing users to dynamically search by name and apply multiple filters simultaneously. The filters include price range, guest capacity, rating, amenities, and location (country and city). This provides a comprehensive way for users to find venues that best match their preferences and needs.
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 10000,
    maxGuests: 1,
    minRating: 0,
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
    country: "",
    city: "",
  });

  //Fetch Data Fetching venues from the API on component mount, with error handling and loading state management for a smooth user experience
  useEffect(() => {
    const fetchVenues = async () => {
      // Using environment variables for API configuration to keep sensitive information secure and allow for easy configuration across different environments (development, staging, production).
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;
      // The API call is made to fetch the list of venues, with appropriate headers for authentication and content type. We handle the response by checking if it's ok, and if not, we throw an error to be caught in our catch block. This ensures that we can provide feedback to the user if something goes wrong during the data fetching process.
      try {
        setIsLoading(true);
        const response = await fetch(
          `${baseUrl}/holidaze/venues?sort=created&sortOrder=desc`,
          {
            headers: {
              "X-Noroff-API-Key": apiKey,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch venues");

        const data = await response.json();
        setVenues(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // --- Search & Filter Logic --- Using useMemo to apply search and filter logic whenever the search query, filters, or venues data changes. This ensures that the displayed venues are always up-to-date with the user's criteria.
  const filteredVenues = useMemo(() => {
    let result = venues;

    // 1. Dynamic Search (by name) - allowing users to quickly find venues by typing keywords, with case-insensitive matching for better usability
    if (searchQuery) {
      result = result.filter((venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // 2. Apply Filters (Price, Guests, Rating, Amenities, Location) - allowing users to narrow down their search based on multiple criteria, with safe handling of potential null values from the API for location fields
    result = result.filter((venue) => {
      const meetsPrice =
        venue.price >= filters.minPrice && venue.price <= filters.maxPrice;
      const meetsGuests = venue.maxGuests >= filters.maxGuests;
      const meetsRating = venue.rating >= filters.minRating;
      const meetsWifi = filters.wifi ? venue.meta.wifi : true;
      const meetsParking = filters.parking ? venue.meta.parking : true;
      const meetsBreakfast = filters.breakfast ? venue.meta.breakfast : true;
      const meetsPets = filters.pets ? venue.meta.pets : true;

      // Safely check location fields (handling potential nulls from the API) - allowing users to filter by country and city with case-insensitive matching for better usability
      const meetsCountry =
        filters.country === "" ||
        (venue.location?.country || "")
          .toLowerCase()
          .includes(filters.country.toLowerCase());
      const meetsCity =
        filters.city === "" ||
        (venue.location?.city || "")
          .toLowerCase()
          .includes(filters.city.toLowerCase());
      // The venue must meet all criteria to be included in the final filtered results. This ensures that users see only the venues that match all of their specified filters, providing a more relevant and personalized experience. 
      return (
        meetsPrice &&
        meetsGuests &&
        meetsRating &&
        meetsWifi &&
        meetsParking &&
        meetsBreakfast &&
        meetsPets &&
        meetsCountry &&
        meetsCity
      );
    });

    return result;
  }, [searchQuery, filters, venues]);

  // --- Pagination Logic --- Calculating total pages based on the number of filtered venues and slicing the filtered venues array to get only the venues for the current page. This improves performance by only rendering a subset of venues at a time, especially when dealing with large datasets.
  const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
  const currentVenues = filteredVenues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // --- Handlers --- A single handler for all filter changes, which updates the filters state based on the input type (checkbox, number/range, or text). This simplifies the code and ensures that all filter inputs are handled consistently. The handler also safely converts number inputs to numbers and handles checkbox inputs correctly.
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number" || type === "range"
            ? Number(value)
            : value,
    }));
    // Reset to the first page whenever filters change to ensure users see the most relevant results immediately. This prevents confusion that could arise if they were on a later page that no longer exists after applying new filters.
    setCurrentPage(1);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/box-filler.png')" }}
    >
      <div className="absolute inset-0 bg-deep-navy/60 z-0 pointer-events-none"></div>

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative">
            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-wide w-full text-center absolute left-0 pointer-events-none">
              VENUES
            </h1>

            <div className="flex flex-col gap-3 w-full md:w-auto md:ml-auto z-20 mt-16 md:mt-0">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset page on search
                  }}
                  className="w-full md:w-64 bg-white/25 border border-white/50 text-white placeholder-white rounded-full py-1.5 pl-10 pr-4 outline-none focus:bg-white/40 transition-colors backdrop-blur-sm"
                />
                <svg
                  className="w-4 h-4 text-white absolute left-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full md:w-64 bg-white/25 border border-white/50 text-white font-semibold rounded-full py-1.5 px-4 hover:bg-white/40 transition-colors backdrop-blur-sm"
                >
                  Filter {isFilterOpen ? "▲" : "▼"}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-deep-navy/95 border border-white/20 rounded-lg p-5 shadow-xl backdrop-blur-md text-white z-50 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold mb-4 border-b border-white/20 pb-2">
                      Filter Venues
                    </h3>

                    {/* Location Filters */}
                    <div className="mb-4 space-y-3 border-b border-white/20 pb-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          placeholder="e.g. Norway"
                          value={filters.country}
                          onChange={handleFilterChange}
                          className="w-full bg-white/10 border border-white/30 rounded px-2 py-1 text-sm outline-none focus:border-mint-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          placeholder="e.g. Tromsø"
                          value={filters.city}
                          onChange={handleFilterChange}
                          className="w-full bg-white/10 border border-white/30 rounded px-2 py-1 text-sm outline-none focus:border-mint-green"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">
                        Max Price: ${filters.maxPrice}
                      </label>
                      <input
                        type="range"
                        name="maxPrice"
                        min="0"
                        max="10000"
                        step="100"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        className="w-full accent-mint-green"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">
                        Min Guests: {filters.maxGuests}
                      </label>
                      <input
                        type="range"
                        name="maxGuests"
                        min="1"
                        max="20"
                        value={filters.maxGuests}
                        onChange={handleFilterChange}
                        className="w-full accent-mint-green"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">
                        Min Rating: {filters.minRating}★
                      </label>
                      <input
                        type="range"
                        name="minRating"
                        min="0"
                        max="5"
                        step="1"
                        value={filters.minRating}
                        onChange={handleFilterChange}
                        className="w-full accent-mint-green"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="wifi"
                          checked={filters.wifi}
                          onChange={handleFilterChange}
                          className="rounded text-mint-green ring-mint-green"
                        />{" "}
                        WiFi
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="parking"
                          checked={filters.parking}
                          onChange={handleFilterChange}
                          className="rounded text-mint-green ring-mint-green"
                        />{" "}
                        Parking
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="breakfast"
                          checked={filters.breakfast}
                          onChange={handleFilterChange}
                          className="rounded text-mint-green ring-mint-green"
                        />{" "}
                        Breakfast
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="pets"
                          checked={filters.pets}
                          onChange={handleFilterChange}
                          className="rounded text-mint-green ring-mint-green"
                        />{" "}
                        Pets
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-green"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-deep-navy/80 p-4 rounded-lg">
              {error}
            </div>
          ) : currentVenues.length === 0 ? (
            <div className="text-center text-white text-xl mt-20">
              No venues found matching your criteria.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentVenues.map((venue) => (
                  <Link
                    to={`/venues/${venue.id}`}
                    key={venue.id}
                    className="bg-deep-navy/25 border border-white/10 rounded-lg p-4 flex flex-col backdrop-blur-sm hover:bg-deep-navy/35 transition-all duration-300 shadow-lg"
                  >
                    <h2 className="text-white font-bold text-lg mb-1 truncate">
                      {venue.name}
                    </h2>
                    <p className="text-white/70 text-xs mb-3 truncate">
                      {venue.location?.city ? `${venue.location.city}, ` : ""}
                      {venue.location?.country || "Location unavailable"}
                    </p>
                    <div className="w-full h-40 bg-gray-200 rounded mb-4 overflow-hidden">
                      {venue.media && venue.media.length > 0 ? (
                        <img
                          src={venue.media[0].url}
                          alt={venue.media[0].alt || venue.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-deep-navy/50 flex items-center justify-center text-white/50 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="mt-auto flex flex-col items-center">
                      <p className="text-mint-green font-semibold text-sm">
                        {venue.rating > 0
                          ? `${venue.rating} / 5 Rating`
                          : "Not rated"}
                      </p>
                      <p className="text-mint-green font-semibold text-sm mt-1">
                        ${venue.price}{" "}
                        <span className="text-xs text-white/70 font-medium">
                          / night
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-12 mb-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl flex items-center justify-center hover:bg-mint-green disabled:opacity-30 transition-all shadow-lg backdrop-blur-sm"
                  >
                    &lt;
                  </button>
                  <span className="text-white font-semibold tracking-wide">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl flex items-center justify-center hover:bg-mint-green disabled:opacity-30 transition-all shadow-lg backdrop-blur-sm"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default VenuesPage;
