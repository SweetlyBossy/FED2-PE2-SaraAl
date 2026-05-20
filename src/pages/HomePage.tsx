// The HomePage component serves as the main landing page for our application. It is designed to provide users with an engaging and informative introduction to our services. The page features a hero section with a captivating background image and a clear call-to-action, followed by a features section that highlights our key offerings, and a call-to-action section that encourages users to take the next step, whether they are logged in or not. The layout is responsive and visually appealing, ensuring a great user experience across all devices.
import { Link } from "react-router-dom";
import Button from "../components/Buttons";
import { useAuth } from "../context/AuthContext";

// The Home component is the main landing page of our application. It serves as the first impression for users and provides an overview of what we offer. The page is designed to be visually appealing and informative, with a hero section that captures attention, a features section that highlights our key offerings, and a call-to-action section that encourages users to take the next step, whether they are logged in or not.
export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* HERO SECTION
        Uses a background image with a rounded bottom. 
      */}
      <section
        className="relative w-full bg-cover bg-center bg-no-repeat rounded-b-[3rem] overflow-hidden flex flex-col"
        style={{
          backgroundImage: "url('/box-filler.png')",
          minHeight: "40vh",
        }}
      >
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 pt-10 pb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Experience the Northern Lights
          </h1>
          <p className="text-lg md:text-xl text-slate-100 mb-8 max-w-2xl">
            Discover the beauty of the Arctic
          </p>

          <div className="flex gap-4">
            {/* The primary variant uses your deep-navy style */}
            <Link to="/venues">
              <Button variant="primary" className="rounded-full px-8">
                Get Started
              </Button>
            </Link>
            <Button variant="glass" className="rounded-full px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION
       */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-12">
          Our Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Card 1 */}
          <div className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1504851149312-7a075b496cc7?q=80&w=600&auto=format&fit=crop"
              alt="Cabins"
              className="h-48 w-full object-cover rounded-t-sm"
            />
            <div className="bg-[#e2e8f0] p-6 flex-grow rounded-b-sm border-t-0">
              <h3 className="text-lg font-bold text-gray-800 text-center">
                Cabins
              </h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1516681100942-77d8e7f9dd97?q=80&w=600&auto=format&fit=crop"
              alt="Local Experiences"
              className="h-48 w-full object-cover rounded-t-sm"
            />
            <div className="bg-[#e2e8f0] p-6 flex-grow rounded-b-sm border-t-0 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Local Experiences
              </h3>
              <p className="text-gray-600 text-sm">
                Immerse in Arctic culture.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop"
              alt="Luxury Stays"
              className="h-48 w-full object-cover rounded-t-sm"
            />
            <div className="bg-[#e2e8f0] p-6 flex-grow rounded-b-sm border-t-0 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Luxury Stays
              </h3>
              <p className="text-gray-600 text-sm">
                Relax in comfort and style.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CALL TO ACTION SECTION */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-[#e2e8f0] rounded-sm p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-gray-200">
          {isAuthenticated ? (
            /* --- WHAT LOGGED IN USERS SEE --- */
            <div className="w-full flex flex-col items-center text-center gap-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Your Next Getaway Awaits!
                </h2>
                <p className="text-gray-600 text-sm">
                  Explore our stunning venues and book your adventure today.
                </p>
              </div>

              <div className="flex w-full md:w-auto">
                <Link to="/venues" className="w-full sm:w-auto">
                  <Button
                    variant="action"
                    className="w-full rounded-full px-12 py-3 text-lg border-3"
                  >
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* --- WHAT GUESTS (LOGGED OUT) SEE --- */
            <>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Ready for an adventure?
                </h2>
                <p className="text-gray-600 text-sm">
                  join us for an unforgettable journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="action"
                    className="w-full rounded-full px-8 py-2.5"
                  >
                    Join Now
                  </Button>
                </Link>

                <button className="w-full sm:w-auto px-8 py-2.5 rounded-full border border-gray-400 text-gray-700 font-semibold hover:bg-gray-300 transition-colors">
                  Contact Us
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
