// This file defines the Login component, which provides the user interface and logic for logging into the Nordic Stay application. It includes form handling, API communication, error management, and integration with our global authentication context to manage user state across the app.
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

    try {
      // Call the Noroff API using our environment variable for the base URL. We send a POST request to the /auth/login endpoint with the email and password as JSON in the request body. We also set the Content-Type header to application/json to indicate that we are sending JSON data.
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      // We parse the JSON response from the server. If the response is not ok, we throw an error with a message extracted from the response or a generic message if no specific error message is provided. This will be caught in our catch block where we handle errors gracefully and provide feedback to the user.
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.errors?.[0]?.message ||
            "Login failed. Please check your email and password.",
        );
      }

      // Success! We save the token and user info into our global state using the login function from our AuthContext. This will allow us to manage the user's authenticated state across the entire app and provide access to protected routes and features based on their login status.
      login(
        result.data.accessToken,
        {
          name: result.data.name,
          email: result.data.email,
          avatar: result.data.avatar,
        },
        result.data.venueManager,
      );

      // Redirect the user to their home after a successful login
      navigate("/");
    } catch (error) {
      // Strictly typed error handling to ensure we can safely access the message property. If the error is an instance of the Error class, we set the serverError state to the error message, which will then be displayed to the user in the UI. If it's not an Error we set a generic error message to inform the user that something unexpected went wrong during login. This ensures that we handle all types of errors gracefully and provide feedback to the user regardless of the error type.
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
    // Background setup matching the Register page exactly
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#144B9F] to-slate-900 p-4 font-inter">
      {/* Glassmorphism Card Container */}
      <section className="w-full max-w-md bg-[rgba(177,197,211,0.15)] backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-300 text-sm">
            Log in to your Nordic Stay account
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="w-full mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {serverError}
          </div>
        )}

        {/* The Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
          noValidate
        >
          {/* Email Input */}
          <div className="text-left">
            <input
              type="email"
              placeholder="Example@stud.noroff.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-[#59C095] focus:ring-1 focus:ring-[#59C095] transition-colors"
              required
            />
          </div>

          {/* Password Input */}
          <div className="text-left">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-[#59C095] focus:ring-1 focus:ring-[#59C095] transition-colors"
              required
            />
          </div>

          {/* Submit Button using the Custom Component */}
          <Button
            type="submit"
            variant="action"
            disabled={isLoading}
            className="w-full mt-2 flex justify-center items-center shadow-lg shadow-mint-green/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg
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
        <p className="mt-6 text-center text-sm text-slate-300">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#59C095] hover:text-white font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </section>
    </div>
  );
}
