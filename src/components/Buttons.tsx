import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "action";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "font-semibold px-6 py-2 rounded transition-all flex justify-center items-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-deep-navy hover:bg-hover-navy text-white",
    glass:
      "bg-glass-white hover:border-mint-green hover:shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-white border border-transparent",
    action:
      "bg-mint-green hover:bg-hover-mint border-3 border-neon-mint text-black",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
