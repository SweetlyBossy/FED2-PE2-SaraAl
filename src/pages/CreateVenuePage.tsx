// This is a comprehensive form for creating a new venue, now including a section for amenities with checkboxes. The form state is structured to accommodate all necessary fields, and the submission handler is updated to send the amenities data to the API. The UI is designed to be user-friendly and visually appealing, with clear sections and input fields for each aspect of the venue creation process.
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Initial state for the form is now more comprehensive, including all fields and a nested meta object for amenities. This ensures we have a consistent shape for our form data and can easily manage the state of each input, including the checkboxes for amenities.
const CreateVenuePage: React.FC = () => {
  const { accessToken, isAuthenticated, venueManager } = useAuth();
  const navigate = useNavigate();

  // Meta state for amenities - initialized with all false and default values for the form. This ensures we have a consistent shape for the payload when sending to the API.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    maxGuests: 1,
    mediaUrl: "",
    address: "", 
    phone: "",   
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false,
    }
  });
  // State for handling submission status and errors, providing feedback to the user during the form submission process. This allows us to disable the submit button while the request is in progress and display any errors that may occur.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This is a handler that simply updates the form state for all text and number inputs. It checks the type of the input to ensure that number fields are stored as numbers in the state, while text fields are stored as strings. This keeps our form data consistent and ready for submission.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Specifically for toggling the boolean meta values. This handler updates the nested meta object in the form state whenever a checkbox is toggled, ensuring that the amenities data is correctly captured and sent to the API.
  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [name]: checked },
    }));
  };
  // The submission handler now constructs a payload that includes all the form data, including the amenities from the meta object. It sends this data to the API and handles the response, providing feedback to the user based on whether the venue creation was successful or if there were any errors.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
        // Reset error state and set submitting state to true to provide feedback to the user. This ensures that any previous errors are cleared when the user attempts to submit the form again, and that the submit button is disabled while the request is in progress.
    setError(null);
    setIsSubmitting(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
        // Construct the media array based on the mediaUrl input. If the user has entered a URL, we create an array with one object containing the URL and an alt text. If the input is empty, we send an empty array to the API. This ensures that our payload is correctly structured regardless of whether the user has provided an image URL or not.
    const mediaArray = formData.mediaUrl.trim() !== "" 
      ? [{ url: formData.mediaUrl.trim(), alt: `${formData.name} image` }]
      : [];
        // Construct the payload to be sent to the API, including all form data and the meta object for amenities. This ensures that we are sending a complete and correctly structured request to the API for creating a new venue.
    const payload = { // The payload is structured to match the expected format of the API, with all necessary fields included. This allows us to successfully create a new venue with all the provided information.
      name: formData.name, // This will be the name of the venue, as entered by the user in the form.
      description: formData.description, // This will be the description of the venue, as entered by the user in the form.
      price: formData.price, // This will be the price of the venue, as entered by the user in the form.
      maxGuests: formData.maxGuests, // This will be the maximum number of guests allowed at the venue, as entered by the user in the form.
      media: mediaArray, // This will be an array of media objects, constructed from the mediaUrl input. If the user has entered a URL, it will contain one object with the URL and alt text. If the input is empty, it will be an empty array.
      location: { // The location object contains the address of the venue, which is required by the API. This will be the address of the venue, as entered by the user in the form.
        address: formData.address, // This will be the address of the venue, as entered by the user in the form.
      },
      meta: formData.meta // This will be the meta object containing the amenities, which is constructed from the state of the checkboxes in the form. Each amenity (wifi, parking, breakfast, pets) will be a boolean value indicating whether it is available at the venue or not.
    };
    // Make the API request to create the venue, including the access token for authentication and the API key in the headers. The request is sent as a POST request to the /holidaze/venues endpoint, with the payload containing all the necessary information about the venue.
    try {
      const response = await fetch(`${baseUrl}/holidaze/venues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // Handle the response from the API, checking if the request was successful. If the response is not ok, we attempt to parse the error message from the response and throw an error with that message. If the request is successful, we alert the user and navigate them to the dashboard page.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to create venue.");
      }
      // If the venue is created successfully, we alert the user and navigate them to the dashboard page. This provides immediate feedback to the user that their venue has been created, and takes them to the dashboard where they can see their newly created venue.
      alert("Venue created successfully!");
      navigate("/dashboard"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
 // Access control: If the user is not authenticated, we redirect them to the login page. If they are authenticated but do not have the venue manager role, we redirect them to their profile page. This ensures that only authorized users can access the create venue page and attempt to create a new venue.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!venueManager) return <Navigate to="/profile" />;

  return (
    <div className="min-h-screen bg-white font-inter pb-20">
      
      {/* Curved Hero Section */}
      <div 
        className="relative h-64 md:h-80 w-full bg-cover bg-center rounded-b-[4rem] md:rounded-b-[6rem] shadow-md flex items-center justify-center pt-16"
        style={{ backgroundImage: "url('/background.png')" }} 
      >
        <div className="absolute inset-0 bg-slate-900/40 rounded-b-[4rem] md:rounded-b-[6rem]"></div>
        <h1 className="relative z-10 text-3xl md:text-5xl font-bold text-white tracking-wide">
          Create New Venue
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-12 text-black">
        {error && (
          <div className="bg-red-100 p-4 rounded text-red-600 text-center mb-6 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SECTION 1: Venue Information */}
          <section>
            <h2 className="text-xl font-bold mb-6">1. Venue Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-end border-b border-slate-800 pb-1 w-full md:w-2/3">
                <span className="text-teal-600 mr-2 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </span>
                <input 
                  type="text" name="name" required placeholder="Venue Name"
                  value={formData.name} onChange={handleChange}
                  className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Capacity</label>
                <div className="flex items-end border-b border-slate-800 pb-1 w-32">
                  <span className="text-teal-600 mr-2 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </span>
                  <input 
                    type="number" name="maxGuests" min="1" required placeholder="Capacity"
                    value={formData.maxGuests || ""} onChange={handleChange}
                    className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <div className="flex items-end border-b border-slate-800 pb-1 w-full md:w-2/3">
                  <span className="text-teal-600 mr-2 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </span>
                  <input 
                    type="text" name="address" placeholder="Location"
                    value={formData.address} onChange={handleChange}
                    className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea 
                  name="description" required placeholder="Enter wanted description here"
                  value={formData.description} onChange={handleChange}
                  className="w-full md:w-2/3 bg-transparent border border-blue-100 rounded p-2 text-sm focus:outline-none focus:border-teal-400 h-24 resize-none placeholder-slate-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: Images & Price */}
          <section>
            <h2 className="text-xl font-bold mb-4">2. Images</h2>
            <div className="space-y-6">
              <input 
                type="url" name="mediaUrl" placeholder="Enter a public URL"
                value={formData.mediaUrl} onChange={handleChange}
                className="w-full md:w-1/2 bg-transparent border border-blue-100 rounded p-2 text-sm focus:outline-none focus:border-teal-400 placeholder-slate-500"
              />
              
              <div className="w-32">
                <div className="flex items-end border-b border-slate-800 pb-1">
                  <span className="text-sm font-semibold mr-2 text-slate-800">Price</span>
                  <input 
                    type="number" name="price" min="1" required
                    value={formData.price || ""} onChange={handleChange}
                    className="w-full appearance-none bg-transparent border-none text-sm text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Contact */}
          <section>
            <h2 className="text-xl font-bold mb-4">3. Contact</h2>
            <div>
              <label className="block text-xs font-semibold mb-1">Contact Number</label>
              <div className="flex items-end border-b border-slate-800 pb-1 w-48">
                <span className="text-teal-600 mr-2 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </span>
                <input 
                  type="tel" name="phone" placeholder="Telefon"
                  value={formData.phone} onChange={handleChange}
                  className="w-full appearance-none bg-transparent border-none text-sm focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION 4: Amenities */}
          <section>
            <h2 className="text-xl font-bold mb-4">4. Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['wifi', 'parking', 'breakfast', 'pets'].map((amenity) => (
                <label 
                  key={amenity} 
                  className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <input 
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

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-mint-green text-slate-900 font-bold py-3 px-8 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
            >
              {isSubmitting ? "Processing..." : "Create & Publish Venue"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateVenuePage;