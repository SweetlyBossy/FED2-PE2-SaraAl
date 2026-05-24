import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { type BecomeAHostProps } from "../types/user";

export const BecomeAHost: React.FC<BecomeAHostProps> = ({ onSuccess }) => {
  const { user, accessToken, updateUserData } = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBecomeManager = async () => {
    if (!isChecked || !user?.name || !accessToken) return;

    setIsProcessing(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      const response = await fetch(
        `${baseUrl}/holidaze/profiles/${user.name}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ venueManager: true }),
        },
      );

      if (!response.ok) throw new Error("Failed to update profile.");

      const data = await response.json();

      // Update global context so the Header updates automatically
      updateUserData({ venueManager: data.data.venueManager });

      if (onSuccess) onSuccess();
      alert("Success! You are now a Venue Manager.");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="bg-[#8b9ba4] border-4 border-blue-400 p-8 rounded-sm shadow-2xl max-w-lg w-full mx-auto"
      role="region"
      aria-labelledby="become-manager-heading"
    >
      <h2 id="become-manager-heading" className="text-2xl font-bold text-black text-center mb-8">
        Becoming a venue manager
      </h2>

      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => setIsChecked(!isChecked)}
          role="switch"
          aria-checked={isChecked}
          aria-labelledby="terms-text"
          className={`w-20 h-6 rounded-full transition-colors flex items-center border-2 ${
            isChecked
              ? "bg-mint-green border-mint-green"
              : "bg-slate-300 border-slate-400"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${isChecked ? "translate-x-6" : "translate-x-0"}`}
            aria-hidden="true"
          />
        </button>
        <p id="terms-text" className="text-black text-lg leading-snug font-medium">
          I have read and accept the terms & conditions for becoming a venue
          manager.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleBecomeManager}
          disabled={!isChecked || isProcessing}
          aria-busy={isProcessing}
          className="bg-[#4ade80] text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-[#3bcf71] disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Become a venue manager"}
        </button>
      </div>
    </div>
  );
};