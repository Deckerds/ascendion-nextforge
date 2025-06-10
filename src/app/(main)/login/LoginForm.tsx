"use client";
import React from "react";
import UsernameForm from "./components/UsernameForm";
import PasswordForm from "./components/PasswordForm";
import MFAForm from "./components/MFAForm";

export default function LoginForm() {
  const totalSteps = 3;
  const [step, setStep] = React.useState<number>(1);
  const [timeLeft, setTimeLeft] = React.useState<number>(60);
  const [username, setUsername] = React.useState<string>("");
  const [secureWord, setSecureWord] = React.useState<string>("");
  const [token, setToken] = React.useState<string>("");
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step < totalSteps) {
      setStep(step - 1);
    }
  };

  React.useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) setStep(1);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="flex flex-col px-4 py-4 md:py-12 md:px-80 ">
      <div className="w-full p-4 md:p-8 rounded-lg shadow">
        <p className="text-sm font-medium mb-1">
          Step {step} of {totalSteps}
        </p>
        <div className="grid grid-cols-3 w-full gap-2">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-full rounded-lg ${
                index + 1 <= step ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
          ))}
        </div>
        <div className="mt-3">
          {step === 1 && (
            <UsernameForm
              nextStep={nextStep}
              secureWord={secureWord}
              setSecureWord={setSecureWord}
              setUsername={setUsername}
              setExpiresAt={setExpiresAt}
            />
          )}
          {step === 2 && (
            <PasswordForm
              nextStep={nextStep}
              timeLeft={timeLeft}
              username={username}
              secureWord={secureWord}
              prevStep={prevStep}
              setToken={setToken}
            />
          )}
          {step === 3 && <MFAForm username={username} token={token} />}
        </div>
      </div>
    </div>
  );
}
