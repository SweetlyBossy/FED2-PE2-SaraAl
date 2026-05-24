// This page is structurally very similar to the CreateVenuePage, but with key differences to support editing an existing venue. The main differences include:
// 1. We use the venue ID from the URL to fetch the existing venue data when the page loads, and pre-fill the form with that data.
// 2. The form submission handler sends a PUT request to update the existing venue instead of a POST request to create a new one.
// 3. We have added loading and error states to handle the asynchronous data fetching and submission processes, providing feedback to the user.
// 4. The UI and form structure are kept consistent with the CreateVenuePage for a cohesive user experience.
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// We define the EditVenuePage component, which is a functional component that uses React hooks for state management and side effects. It also utilizes the useAuth hook to access authentication information and the useNavigate and useParams hooks from react-router-dom for navigation and accessing URL parameters.
const EditVenuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Grab the venue ID from the URL
  const { accessToken, isAuthenticated, venueManager } = useAuth();
  const navigate = useNavigate();

  // State to hold the form data, structurally identical to the Create page
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    maxGuests: 1,
    mediaUrl: "",
    address: "",
    phone: "", // UI only, just like the Create page
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false,
    },
  });
  // Additional state for loading and error handling. isLoading is used to indicate whether the existing venue data is being fetched, while isSubmitting indicates whether the form submission is in progress. The error state holds any error messages that may occur during data fetching or submission, which can be displayed to the user for feedback.
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the existing venue data when the page loads. We use the useEffect hook to perform this side effect. Inside the effect, we define an asynchronous function fetchVenueData that makes a GET request to the API to retrieve the venue data based on the ID from the URL. If the request is successful, we pre-fill the formData state with the fetched data. If there is an error during fetching, we set the error state with an appropriate message. Finally, we set isLoading to false to indicate that the loading process has completed.
  useEffect(() => {
    const fetchVenueData = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
        // We construct the API endpoint URL using the base URL from environment variables and the venue ID from the URL parameters. We then make a GET request to this endpoint to fetch the existing venue data.
      try {
        const response = await fetch(`${baseUrl}/holidaze/venues/${id}`);
        if (!response.ok) throw new Error("Could not load venue data.");

        const data = await response.json();
        const venue = data.data;

        // Pre-fill the form with the fetched data. We map the relevant fields from the fetched venue data to our formData state structure. This includes handling cases where certain fields may be missing or undefined in the API response, ensuring that we provide default values to prevent any issues with uncontrolled inputs in the form.
        setFormData({
          name: venue.name || "",
          description: venue.description || "",
          price: venue.price || 0,
          maxGuests: venue.maxGuests || 1,
          mediaUrl: venue.media?.[0]?.url || "",
          address: venue.location?.address || "",
          phone: "", // API doesn't store this, so we leave it blank
          meta: {
            wifi: venue.meta?.wifi || false,
            parking: venue.meta?.parking || false,
            breakfast: venue.meta?.breakfast || false,
            pets: venue.meta?.pets || false,
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load venue.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchVenueData();
  }, [id]);

  // Standard input handlers. handleChange is a generic handler for text and number inputs, which updates the formData state based on the input's name and value. It also checks the input type to ensure that number inputs are stored as numbers in the state. handleMetaChange is specifically designed for handling changes to the amenities checkboxes, updating the nested meta object in the formData state accordingly.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  // Handler for amenities checkboxes, which updates the nested meta object in the formData state based on the checkbox name and whether it is checked or not.
  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [name]: checked },
    }));
  };

  // Submission handler (PUT request to update). This code will handle the form submission when the user attempts to save their changes. 
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!accessToken || !id) return;
    // Reset error state and set submitting state to true to indicate that the submission process has started. This will allow us to disable the submit button and provide feedback to the user that their changes are being saved.
    setError(null);
    setIsSubmitting(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    // Construct the media array based on the mediaUrl input. If the user has entered a URL, we create an array with one object containing the URL and an alt text. If the input is empty, we send an empty array to the API. This ensures that our payload is correctly structured regardless of whether the user has provided an image URL or not.
    const mediaArray = formData.mediaUrl.trim() !== "" 
      ? [{ url: formData.mediaUrl.trim(), alt: `${formData.name} image` }]
      : [];
    // We construct the payload for the API request based on the formData state. This payload includes all the necessary fields that the API expects for updating a venue, structured according to the API's requirements.
    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      maxGuests: formData.maxGuests,
      media: mediaArray,
      location: {
        address: formData.address,
      },
      meta: formData.meta,
    };
    // We make a PUT request to the API endpoint for updating the venue, including the necessary headers for authentication and content type. The body of the request is the JSON stringified payload we constructed from the form data.
    try {
      const response = await fetch(`${baseUrl}/holidaze/venues/${id}`, {
        method: "PUT", // Important: PUT instead of POST for updates
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // Handle the response from the API, checking if the request was successful. If the response is not ok, we attempt to parse the error message from the response and throw an error with that message. If the request is successful, we alert the user and navigate them to the dashboard page. This provides immediate feedback to the user that their venue has been updated, and takes them back to the dashboard where they can see their updated venue.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to update venue.");
      }

      alert("Venue updated successfully!");
      navigate("/dashboard"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Security barrier. Access control: If the user is not authenticated, we redirect them to the login page. If they are authenticated but do not have the venue manager role, we redirect them to their profile page. This ensures that only authorized users can access the edit venue page and attempt to edit a venue.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  // Initial Loading State. While the existing venue data is being fetched, we display a loading spinner to indicate to the user that the data is being loaded. This provides feedback to the user and improves the user experience by preventing confusion or frustration while waiting for the data to load.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center" role="status" aria-label="Loading venue data">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" aria-hidden="true"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter pb-20" role="main">
      
      {/* Curved Hero Section (Matches Create Page) */}
      <div 
        className="relative h-64 md:h-80 w-full bg-cover bg-center rounded-b-[4rem] md:rounded-b-[6rem] shadow-md flex items-center justify-center pt-16"
        style={{ backgroundImage: "url('/background.png')" }} 
        role="banner"
      >
        <div className="absolute inset-0 bg-slate-900/40 rounded-b-[4rem] md:rounded-b-[6rem]" aria-hidden="true"></div>
        <h1 className="relative z-10 text-3xl md:text-5xl font-bold text-white tracking-wide">
          Edit Venue
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-12 text-black">
        {error && (
          <div className="bg-red-100 p-4 rounded text-red-600 text-center mb-6 border border-red-300" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10" aria-label="Edit Venue Form">
          
          {/* SECTION 1: Venue Information */}
          <section aria-labelledby="section1-heading">
            <h2 id="section1-heading" className="text-xl font-bold mb-6">1. Venue Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-end border-b border-slate-800 pb-1 w-full md:w-2/3">
                <span className="text-teal-600 mr-2 mb-1" aria-hidden="true">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </span>
                <input 
                  type="text" name="name" required placeholder="Venue Name" aria-label="Venue Name"
                  value={formData.name} onChange={handleChange}
                  className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label htmlFor="maxGuests" className="block text-xs font-semibold mb-1">Capacity</label>
                <div className="flex items-end border-b border-slate-800 pb-1 w-32">
                  <span className="text-teal-600 mr-2 mb-1" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </span>
                  <input 
                    id="maxGuests"
                    type="number" name="maxGuests" min="1" required placeholder="Capacity"
                    value={formData.maxGuests || ""} onChange={handleChange}
                    className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-semibold mb-1">Address</label>
                <div className="flex items-end border-b border-slate-800 pb-1 w-full md:w-2/3">
                  <span className="text-teal-600 mr-2 mb-1" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </span>
                  <input 
                    id="address"
                    type="text" name="address" placeholder="Location"
                    value={formData.address} onChange={handleChange}
                    className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-semibold mb-1">Description</label>
                <textarea 
                  id="description"
                  name="description" required placeholder="Enter wanted description here"
                  value={formData.description} onChange={handleChange}
                  className="w-full md:w-2/3 bg-transparent border border-blue-100 rounded p-2 text-sm focus:outline-none focus:border-teal-400 h-24 resize-none placeholder-slate-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: Images & Price */}
          <section aria-labelledby="section2-heading">
            <h2 id="section2-heading" className="text-xl font-bold mb-4">2. Images</h2>
            <div className="space-y-6">
              <input 
                type="url" name="mediaUrl" placeholder="Enter a public URL" aria-label="Image URL"
                value={formData.mediaUrl} onChange={handleChange}
                className="w-full md:w-1/2 bg-transparent border border-blue-100 rounded p-2 text-sm focus:outline-none focus:border-teal-400 placeholder-slate-500"
              />
              
              <div className="w-32">
                <div className="flex items-end border-b border-slate-800 pb-1">
                  <span className="text-sm font-semibold mr-2 text-slate-800" aria-hidden="true">Price</span>
                  <input 
                    type="number" name="price" min="1" required aria-label="Price per night"
                    value={formData.price || ""} onChange={handleChange}
                    className="w-full appearance-none bg-transparent border-none text-sm text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Contact */}
          <section aria-labelledby="section3-heading">
            <h2 id="section3-heading" className="text-xl font-bold mb-4">3. Contact</h2>
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold mb-1">Contact Number</label>
              <div className="flex items-end border-b border-slate-800 pb-1 w-48">
                <span className="text-teal-600 mr-2 mb-1" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </span>
                <input 
                  id="phone"
                  type="tel" name="phone" placeholder="Telefon"
                  value={formData.phone} onChange={handleChange}
                  className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION 4: Amenities */}
          <section aria-labelledby="section4-heading">
            <h2 id="section4-heading" className="text-xl font-bold mb-4">4. Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="group" aria-labelledby="section4-heading">
              {['wifi', 'parking', 'breakfast', 'pets'].map((amenity) => (
                <label 
                  key={amenity} 
                  htmlFor={`amenity-${amenity}`}
                  className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <input 
                    id={`amenity-${amenity}`}
                    type="checkbox" 
                    name={amenity}
                    checked={formData.meta[amenity as keyof typeof formData.meta]}
                    onChange={handleMetaChange}
                    className="w-4 h-4 accent-teal-600 cursor-pointer"
                  />
                  <span className="capitalize text-sm font-medium text-slate-700">{amenity}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
            <button 
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-slate-500 font-bold py-3 px-8 rounded-full text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="bg-mint-green text-slate-900 font-bold py-3 px-8 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditVenuePage;