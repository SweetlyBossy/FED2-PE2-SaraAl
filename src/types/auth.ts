// Define the exact shape of our user and authentication data using TypeScript interfaces.
// This helps prevent bugs by ensuring we always pass the correct data structure.
export interface UserProfile {
  name: string;
  email: string;
  avatar?: {
    url: string;
    alt: string;
  };
}

// Defines what functions and data will be available to the rest of the application.
export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  venueManager: boolean;
  isAuthenticated: boolean;
  login: (token: string, profile: UserProfile, isManager: boolean) => void;
  logout: () => void;
  updateUserData: (data: {
    venueManager?: boolean;
    avatar?: { url: string; alt: string };
  }) => void;
}
