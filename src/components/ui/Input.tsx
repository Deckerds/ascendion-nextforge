import React from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hideError?: boolean;
}

const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  hideError = false,
  id,
  icon,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the actual input type
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          className={cn(
            "block w-full border px-3 py-2 border-gray-300 rounded-md text-sm shadow-sm placeholder:text-sm placeholder-gray-400 focus:outline-none focus:ring-gray-800 focus:border-gray-800",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "",
            icon ? "pl-8" : "",
            className || "",
          )}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <Eye color="#99a1af" size={18} />
            ) : (
              <EyeOff color="#99a1af" size={18} />
            )}
          </button>
        )}
      </div>
      {!hideError && (
        <div className="h-4">
          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Input;
