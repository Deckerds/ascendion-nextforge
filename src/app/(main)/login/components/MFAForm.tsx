import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { generateMfaCode } from "../../../../lib/crypto";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import { toast } from "react-toastify";

interface MFAFormProps {
  token: string;
  username: string;
}

const MFAForm: React.FC<MFAFormProps> = ({ token, username }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ mfa: string }>({ mode: "onChange" });

  const handleMFASubmit = handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/verifyMfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: data.mfa }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.error);
        return;
      }

      if (responseData.data) {
        toast.success("Login successful");
        localStorage.setItem("token", token);
        router.push("/dashboard");
      }
    } catch {
      toast.error("Internal server error");
    }
  });

  return (
    <React.Fragment>
      <p className="text-xl font-medium"> MFA Step</p>
      <p className="text-sm text-center">
        Enter the 6-digit MFA code. For demo purposes, use:{" "}
        <span className={"font-medium"}>{generateMfaCode(username)}</span>
      </p>
      <form onSubmit={handleMFASubmit} className="mt-5 space-y-2">
        <Input
          label="MFA Code"
          type="text"
          {...register("mfa", {
            required: "MFA code is required",
            maxLength: {
              value: 6,
              message: "Must be exactly 6 characters",
            },
            minLength: {
              value: 6,
              message: "Must be exactly 6 characters",
            },
          })}
          error={errors.mfa?.message}
          placeholder="Enter 6 digit code"
          maxLength={6}
        />
        <Button
          size="md"
          type="submit"
          loading={isSubmitting}
          className="w-full"
        >
          Submit
        </Button>
      </form>
    </React.Fragment>
  );
};

export default MFAForm;
