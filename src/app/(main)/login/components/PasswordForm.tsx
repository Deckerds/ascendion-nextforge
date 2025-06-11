import React from "react";
import { useForm } from "react-hook-form";
import { hashPassword } from "../../../../lib/crypto";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { toast } from "react-toastify";

interface PasswordFormProps {
  nextStep: () => void;
  prevStep: () => void;
  timeLeft: number;
  secureWord: string;
  username: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  nextStep,
  timeLeft,
  secureWord,
  username,
  prevStep,
  setToken,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string }>();

  const handlePasswordSubmit = handleSubmit(async (data) => {
    try {
      const hashedPassword = hashPassword(data.password);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, hashedPassword, secureWord }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.error);
        return;
      }

      if (responseData.data) {
        setToken(responseData.data.token);
        nextStep();
      }
    } catch {
      toast.error("Internal server error");
    }
  });

  return (
    <React.Fragment>
      <p className="text-xl font-medium">Password Input Step</p>
      <p className="text-sm text-center">
        Secure word expires in :{" "}
        <span
          className={`font-medium ${
            timeLeft < 10 ? "text-red-500" : "text-black"
          }`}
        >
          {timeLeft}
        </span>{" "}
        seconds
      </p>
      <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-2">
        <Input
          label="Password"
          type="password"
          {...register("password", { required: "Password is required" })}
          error={errors.password?.message}
          placeholder="Enter your password"
        />
        <div className="flex items-center gap-4">
          <Button
            onClick={prevStep}
            size="md"
            className="w-full"
            variant="outline"
          >
            Back
          </Button>
          <Button
            size="md"
            type="submit"
            loading={isSubmitting}
            className="w-full"
          >
            Next
          </Button>
        </div>
      </form>
    </React.Fragment>
  );
};

export default PasswordForm;
