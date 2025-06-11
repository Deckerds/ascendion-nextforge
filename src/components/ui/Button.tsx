import React from "react";
import { cn } from "../../lib/utils";
import { LoaderCircle } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}) => {
  const baseClasses =
    "cursor-pointer inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-sky-700 text-white hover:bg-sky-800 focus:ring-0",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-0",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-0",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm md:text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className || "",
      )}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {loading && (
        <LoaderCircle data-testid="spinner" className="animate-spin ms-2" />
      )}
    </button>
  );
};

export default Button;
