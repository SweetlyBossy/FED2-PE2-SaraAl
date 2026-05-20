import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Buttons";

export default function Header() {
  // 1. Pull what we need from the global auth vault using our custom useAuth hook. This gives us access to the user's authentication status, their information (like name and avatar), and the logout function to allow users to sign out. We can use this information to conditionally render different UI elements in the header based on whether the user is logged in or not.
  const { isAuthenticated, user, logout } = useAuth();

  // 2. Get the current URL path so we can highlight the active link in the navigation. This allows us to provide visual feedback to users about which page they are currently on, improving navigation and user experience.
  const location = useLocation();

  // Helper function to apply a special class if the user is on this page (used for active link styling)
  const getLinkClass = (path: string) => {
    const baseClass = "font-medium transition-colors ";
    return (
      baseClass +
      (location.pathname === path
        ? "text-[#59C095]"
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
          <Link to="/services" className={getLinkClass("/services")}>
            Services
          </Link>
          <Link to="/contact" className={getLinkClass("/contact")}>
            Contact
          </Link>
        </div>

        {/* Authentication Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            // What logged-in users see
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-white hover:text-[#59C095] transition-colors"
              >
                {/* Fallback avatar if the user doesn't have one */}
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.avatar.alt}
                    className="w-8 h-8 rounded-full object-cover border border-[#59C095]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-[#59C095]">
                    👤
                  </div>
                )}
                <span className="font-medium hidden sm:block">
                  {user?.name}
                </span>
              </Link>

              <Button
                variant="glass"
                onClick={logout}
                className="py-1.5 px-4 text-sm hidden sm:block"
              >
                Sign Out
              </Button>
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
