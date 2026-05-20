import { createContext, useContext, useState, type ReactNode } from "react";
import { type UserProfile, type AuthContextType } from "../types/auth";

// Create the Context container. This is what we will use to provide and consume authentication data throughout our app. We initialize it with `undefined` to enforce that it must be used within a provider.
// Think of this as an empty box that will eventually hold our authentication state.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider Component. This is the component that will wrap around parts of our app that need access to authentication data. It will hold all the logic for managing authentication state and actions.
export function AuthProvider({ children }: { children: ReactNode }) {
  // We initialize our state by checking the browser's localStorage first.
  // This ensures that if the user refreshes the page, they don't get accidentally logged out.
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("userProfile");
    return savedUser ? JSON.parse(savedUser) : null; // Convert the stored string back into a JavaScript object
  });

  const [venueManager, setVenueManager] = useState<boolean>(() => {
    return localStorage.getItem("venueManager") === "true"; // Convert the stored string 'true' back into a boolean
  });

  // A simple shortcut boolean. If there is an accessToken, we consider the user authenticated.
  const isAuthenticated = !!accessToken;

  // The Login Action: Called when the user successfully logs in via the Noroff API.
  const login = (token: string, profile: UserProfile, isManager: boolean) => {
    // 1. Save to React state (updates the UI immediately to reflect the logged-in status and user info).
    setAccessToken(token);
    setUser(profile);
    setVenueManager(isManager);

    // 2. Save to the browser's local storage (keeps them logged in across page reloads) - we store the token, the user profile as a JSON string, and whether they are a venue manager.
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userProfile", JSON.stringify(profile));
    localStorage.setItem("venueManager", String(isManager));
  };

  // The Logout Action: Called when the user clicks "Sign Out". This will clear all authentication data from both React state and localStorage, effectively logging the user out.
  const logout = () => {
    // 1. Clear the React state so the UI updates immediately to reflect that the user is logged out.
    setAccessToken(null);
    setUser(null);
    setVenueManager(false);

    // 2. Clear the browser's local storage so they are fully logged out and won't be automatically logged back in on page refresh.
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("venueManager");
  };

  // The Update Action: Used to modify specific parts of the user's profile without needing to log in again (e.g., after editing their profile or changing their avatar).
  const updateUserData = (data: {
    venueManager?: boolean;
    avatar?: { url: string; alt: string };
  }) => {
    // If venueManager data was provided, update it in both state and localStorage (we convert the boolean to a string for storage since localStorage only stores strings).
    if (data.venueManager !== undefined) {
      setVenueManager(data.venueManager);
      localStorage.setItem("venueManager", String(data.venueManager));
    }

    // If avatar data was provided (and we currently have a logged-in user), update it in both state and localStorage. We create a new user object that merges the existing user data with the new avatar data, then save it back to state and localStorage.
    if (data.avatar && user) {
      const updatedUser = { ...user, avatar: data.avatar }; // Create a copy of the user with the new avatar
      setUser(updatedUser);
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
    }
  };

  // Pass all the state values and action functions into the Provider so child components can access them. This is what makes the authentication data and functions available throughout the app without needing to pass props down manually at every level.
  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        venueManager,
        isAuthenticated,
        login,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Instead of writing `useContext(AuthContext)` in every file, you just call `useAuth()`. This also adds a safety check to ensure that you don't accidentally use this hook outside of the AuthProvider, which would cause an error. If you do, it will throw a clear error message to help you debug. This makes it much easier and safer to access authentication data and functions from any component in your app.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  // Safety check: Ensure useAuth is only called inside components wrapped by the <AuthProvider> to prevent errors. If someone tries to use this hook outside of the provider, we throw a clear error message.
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
