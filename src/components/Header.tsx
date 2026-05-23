import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Buttons";

export default function Header() {
  // 1. Pull what we need from the global auth vault using our custom useAuth hook. This gives us access to the user's authentication status, their information (like name and avatar), and the logout function to allow users to sign out. We can use this information to conditionally render different UI elements in the header based on whether the user is logged in or not.
  const { isAuthenticated, user, logout, venueManager } = useAuth();

  // 2. Get the current URL path so we can highlight the active link in the navigation. This allows us to provide visual feedback to users about which page they are currently on, improving navigation and user experience.
  const location = useLocation();

  // State and Ref for the Profile Dropdown Menu. We use useState to manage whether the dropdown is open or closed, and useRef to reference the dropdown element so we can detect clicks outside of it to close the menu when the user clicks elsewhere on the page.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if the user clicks anywhere outside of it - we add a global click listener when the component mounts and clean it up when it unmounts. This ensures that the dropdown menu behaves intuitively and doesn't stay open when the user clicks away, which could lead to a confusing user experience.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper function to apply a special class if the user is on this page (used for active link styling) - this function takes a path as an argument and returns a string of CSS classes. It checks if the current URL path matches the given path, and if so, it adds a class to highlight the link (e.g., changing the text color to mint green). If the paths don't match, it returns a default class that styles the link normally but includes a hover effect to improve interactivity.
  const getLinkClass = (path: string) => {
    const baseClass = "font-medium transition-colors ";
    return (
      baseClass +
      (location.pathname === path
        ? "text-mint-green"
        : "text-white hover:text-slate-300")
    );
  };

  return (
    // Use 'fixed' and 'z-50' to make sure the header always stays at the top of the screen,
    // floating above the content as the user scrolls.
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 transition-all">
      <nav className="flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Nordic Stay Logo" className="w-40 h-auto" />
        </Link>

        {/* Main Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>
          <Link to="/about" className={getLinkClass("/about")}>
            About
          </Link>
          <Link to="/venues" className={getLinkClass("/venues")}>
            Venues
          </Link>
          <Link to="/contact" className={getLinkClass("/contact")}>
            Contact
          </Link>
        </div>

        {/* Authentication Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            // What logged-in users see (The Profile Dropdown) - this includes the user's avatar and name, and a dropdown menu with links to their profile, the manager dashboard (if they are a manager), and a sign-out button. This allows authenticated users to easily access their account settings and log out when they're done.
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 text-white hover:text-mint-green transition-colors focus:outline-none"
              >
                {/* Fallback avatar if the user doesn't have one */}
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.avatar.alt || "User avatar"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-mint-green transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-transparent hover:border-mint-green transition-all">
                    👤
                  </div>
                )}
                <span className="font-medium hidden sm:block">
                  {user?.name}
                </span>
                <span aria-hidden="true" className="text-xs ml-1">
                  {isDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* The Dropdown Panel */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-800 border border-white/10 rounded-lg shadow-xl py-2 flex flex-col z-50">
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <p className="text-sm text-white font-semibold truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors text-left"
                  >
                    Profile
                  </Link>

                  {/* Conditionally render based on Manager status */}
                  {venueManager ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-4 py-2 text-sm text-mint-green hover:bg-slate-700 transition-colors text-left font-medium"
                    >
                      Venue Manager Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/become-host"
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors text-left"
                    >
                      Become a Host
                    </Link>
                  )}

                  <hr className="border-white/10 my-2" />

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors text-left w-full"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // What guests see 
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-white font-medium hover:text-slate-300 transition-colors hidden sm:block"
              >
                Log In
              </Link>
              <Link to="/register">
                <Button variant="action" className="py-1.5 px-5 text-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
