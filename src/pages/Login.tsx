// This file defines the Login component, which provides the user interface and logic for logging into the Nordic Stay application. It includes form handling, API communication, error management, and integration with our global authentication context to manage user state across the app. The component is designed to be user-friendly and visually consistent with the rest of the application, using a glassmorphism style for the login card and providing clear feedback during the login process. It also ensures that after a successful login, the user's authentication state is updated globally and they are redirected to their home page. Additionally, it includes error handling to display any issues that arise during the login attempt, such as incorrect credentials or server errors.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Buttons";
import { useAuth } from "../context/AuthContext";

// We define the Login component as a default export. This component will be rendered when the user navigates to the /login route in our app. It contains all the logic and UI for the login form, including state management, form handling, API calls, and error handling.
export default function Login() {
  const navigate = useNavigate();

  // Extract the login function from our global state using the useAuth hook. This function will be used to update our global authentication state with the user's token and information after a successful login.
  const { login } = useAuth();

  // Local state for the form inputs and UI feedback such as server errors and loading state. We use the useState hook to manage the email and password input values, any server error messages that may occur during login, and a loading state to indicate when the login request is in progress.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setIsLoading(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      // 1. Call the Noroff API to authenticate.
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.errors?.[0]?.message ||
            "Login failed. Please check your email and password.",
        );
      }

      // The login endpoint doesn't always return the updated manager status. To ensure we have the most accurate information about the user's role, we make an additional API call to fetch the user's profile after a successful login. This allows us to verify whether the user is a venue manager or not, which is crucial for determining what parts of the app they should have access to.
      const profileResponse = await fetch(
        `${baseUrl}/holidaze/profiles/${result.data.name}`,
        {
          headers: {
            Authorization: `Bearer ${result.data.accessToken}`,
            "X-Noroff-API-Key": import.meta.env.VITE_API_KEY,
          },
        },
      );

      const profileResult = await profileResponse.json();
      const isManager = profileResult.data.venueManager;

      // Update the global authentication state with the user's token and information, including the verified manager status. This allows the rest of the app to know that the user is logged in and whether they have manager privileges, which can be used to conditionally render certain features or pages.
      login(
        result.data.accessToken,
        {
          name: result.data.name,
          email: result.data.email,
          avatar: result.data.avatar,
        },
        isManager, // Pass the verified status from the profile fetch
      );

      // Redirect the user to their home after a successful login
      navigate("/");
    } catch (error) {
      // Strictly typed error handling to ensure we can safely access the message property.
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="main"
      className="min-h-screen flex items-center justify-center p-4 font-inter bg-cover bg-center bg-no-repeat "
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* Glassmorphism Card Container */}
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-md bg-[rgba(177,197,211,0.15)] backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="mb-8">
          <h1 id="login-heading" className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300 text-sm">
            Log in to your Nordic Stay account
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="w-full mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
          >
            {serverError}
          </div>
        )}

        {/* The Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
          noValidate
          aria-label="Login form"
        >
          {/* Email Input */}
          <div className="text-left">
            <input
              type="email"
              placeholder="Example@stud.noroff.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-colors"
              required
              aria-label="Email Address"
            />
          </div>

          {/* Password Input */}
          <div className="text-left">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-colors"
              required
              aria-label="Password"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="action"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full mt-2 flex justify-center items-center shadow-lg shadow-mint-green/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg
                aria-hidden="true"
                className="animate-spin h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        {/* Redirect to Register */}
        <p className="mt-6 text-center text-sm text-black">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-neon-mint hover:text-white font-semibold transition-colors"
            aria-label="Sign up for a new account"
          >
            Sign up
          </Link>
        </p>
      </section>
    </div>
  );
}
