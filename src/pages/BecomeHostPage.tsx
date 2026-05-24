import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BecomeAHost } from "../components/BecomeAHost";

const BecomeHostPage: React.FC = () => {
  const { isAuthenticated, venueManager } = useAuth();
  const navigate = useNavigate();

  // Security: If they aren't logged in, send them to login.
  // If they are ALREADY a manager, send them to their profile/dashboard.
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (venueManager) return <Navigate to="/profile" />;

  return (
    <div
      className="min-h-screen bg-slate-100 flex items-center justify-center p-4 pt-24"
      role="main"
      aria-label="Become a Host"
    >
      {/* When the API succeeds, we instantly navigate them to their new dashboard */}
      <BecomeAHost onSuccess={() => navigate("/profile")} />
    </div>
  );
};

export default BecomeHostPage;
