// This Register component provides a user registration form with client-side validation and error handling. It uses React's useState hook to manage form data and UI states, and it makes an API call to register the user when the form is submitted. The component also includes styling using Tailwind CSS to create a visually appealing and responsive design that fits the Nordic Stay theme.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Buttons";

// We define the Register component as a default export. This component will be rendered when the user navigates to the /register route in our app. It contains all the logic and UI for the registration form, including state management, form validation, API calls, and error handling.
export default function Register() {
  const navigate = useNavigate();

  // 1. Native Form State - We use a single state object to hold all form fields for simplicity. Each field is initialized to an empty string. This allows us to easily manage and update the form data as the user types.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 2. UI States - We have separate states for form validation errors, server errors, and loading status. This helps us provide clear feedback to the user at each step of the registration process.
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes dynamically by using the `name` attribute of each input field to update the corresponding value in our formData state. This way, we can use a single handler for all fields instead of writing separate handlers for each one. Additionally, we clear any existing error for that specific field as soon as the user starts typing again, providing immediate feedback and improving the user experience.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the specific error for this field when the user starts typing again to provide immediate feedback and improve UX. We check if there's an existing error for this field, and if so, we create a new errors object that clears the error for this field while keeping any other existing errors intact.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 3. Custom Validation Logic - We have a dedicated function to validate the form data before submission. This function checks each field against our defined validation rules (e.g., required fields, email format, password length, password match) and populates an errors object with any validation messages. If there are no errors, it returns true, allowing the form submission to proceed. If there are errors, it updates the errors state to display the messages to the user and prevents the form from being submitted.
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation - We check if the name field is empty, if it exceeds 50 characters, or if it contains invalid characters (only letters, numbers, and underscores are allowed). If any of these conditions are true, we add an appropriate error message to the newErrors object under the 'name' key.
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 25) {
      newErrors.name = "Name must be less than 25 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name =
        "Name can only contain letters, numbers, and underscores (_)";
    }

    // Email validation - We check if the email field is empty or if it does not end with '@stud.noroff.no'. If either of these conditions is true, we add an appropriate error message to the newErrors object under the 'email' key. This ensures that users provide a valid student email address from Noroff.
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith("@stud.noroff.no")) {
      newErrors.email = "You must use a @stud.noroff.no email address";
    }

    // Password validation - We check if the password field is empty or if it is less than 8 characters long. If either of these conditions is true, we add an appropriate error message to the newErrors object under the 'password' key. This ensures that users create a strong password that meets our security requirements.
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm Password validation - We check if the confirmPassword field matches the password field. If they do not match, we add an appropriate error message to the newErrors object under the 'confirmPassword' key. This ensures that users correctly confirm their password to avoid typos and ensure they know their password.
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // Return true if the newErrors object is empty (meaning no errors) or false if there are any errors. This allows the form submission handler to determine whether to proceed with the API call or to stop and display validation errors to the user.
    return Object.keys(newErrors).length === 0;
  };

  // 4. Submit Handler - This function is called when the user submits the form. It first prevents the default form submission behavior, then clears any existing server errors. It calls the validateForm function to check if the form data is valid. If validation fails, it stops execution and displays the validation errors to the user.
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    // Stop and display errors if validation fails
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // API call using the base URL from your .env file and the /auth/register endpoint. We send a POST request with the form data (name, email, password) in the request body as JSON. We also set the appropriate headers to indicate that we are sending JSON data.
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // We only send the name, email, and password fields to the API. The confirmPassword field is only used for client-side validation and is not needed by the API. We convert the formData object into a JSON string to send in the request body. This allows the API to receive the data in the expected format and process the registration request accordingly.
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        },
      );
      // We parse the response from the API as JSON to access any data or error messages returned by the server. If the response is not ok (i.e., the status code indicates an error), we throw a new error with a message extracted from the response data (if available) or a generic error message. This allows us to handle server-side errors gracefully and provide feedback to the user if something goes wrong during registration.
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.errors?.[0]?.message ||
            "Registration failed. Please try again.",
        );
      }

      // Success! Redirect the user to the login page so they can authenticate with their new account. We use the navigate function from react-router-dom to programmatically navigate to the /login route after a successful registration. This provides a smooth user experience by automatically taking them to the next step in the process without requiring them to click a link or button.
      navigate("/login");
    } catch (error) {
      // We check if the caught error is actually an instance of the Error class to ensure we can safely access the message property. If it is an Error, we set the serverError state to the error message, which will then be displayed to the user in the UI. If it's not an Error (which is an edge case), we set a generic error message to inform the user that something unexpected went wrong during registration. This ensures that we handle all types of errors gracefully and provide feedback to the user regardless of the error type.
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        // Fallback for unexpected edge cases where a non-error is thrown to ensure we still provide feedback to the user.
        setServerError("An unexpected error occurred during registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    // The main container for the registration page. We use Tailwind CSS classes to create a full-screen background with a centered card for the registration form. The background image is set using inline styles to ensure it covers the entire screen and is centered properly. The card itself has a glassmorphism effect with a semi-transparent background, rounded corners, and a shadow to make it stand out against the background while still fitting the overall aesthetic of the Nordic Stay theme.
    <div
      className="min-h-screen flex items-center justify-center p-4 font-inter bg-cover bg-center bg-no-repeat "
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* Glassmorphism Card Container */}
      <div className="w-full max-w-md bg-[rgba(177,197,211,0.15)] backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create an Account
          </h1>
          <p className="text-slate-300 text-sm">
            Join Nordic Stay to book your next adventure.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {serverError}
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name Field */}
          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1"
              htmlFor="name"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-colors"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1"
              htmlFor="email"
            >
              Stud Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Example@stud.noroff.no"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-colors"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-colors"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 outline-none focus:border-mint-green focus:ring-1 focus:ring-mint-green transition-colors"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button using the Custom Component */}
          <Button
            type="submit"
            variant="action"
            disabled={isLoading}
            className="w-full mt-6 flex justify-center items-center shadow-lg shadow-mint-green/20 disabled:opacity-70 disabled:cursor-not-allowed"
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
              "Sign Up"
            )}
          </Button>
        </form>

        {/* Redirect to Login */}
        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-mint-green hover:text-white font-semibold transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
