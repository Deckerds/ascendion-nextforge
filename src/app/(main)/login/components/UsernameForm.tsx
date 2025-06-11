import React from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import BasicModal from "../../../../components/ui/BasicModal";
import { toast } from "react-toastify";

interface UsernameFormProps {
  nextStep: () => void;
  secureWord: string;
  setSecureWord: React.Dispatch<React.SetStateAction<string>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setExpiresAt: React.Dispatch<React.SetStateAction<number | null>>;
}

const UsernameForm: React.FC<UsernameFormProps> = ({
  nextStep,
  secureWord,
  setSecureWord,
  setUsername,
  setExpiresAt,
}) => {
  const [openModal, setOpenModal] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ username: string }>();

  const handleUsernameSubmit = handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/getSecureWord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.error);
        return;
      }
      if (responseData.data) {
        setUsername(data.username);
        setSecureWord(responseData.data.secureWord);
        setExpiresAt(Date.now() + 60000);
        setOpenModal(true);
      }
    } catch {
      toast.error("Internal server error");
    }
  });

  const closeModal = () => {
    setOpenModal(false);
  };

  return (
    <React.Fragment>
      <p className="text-xl font-medium">Username Input Step</p>
      <form onSubmit={handleUsernameSubmit} className="mt-5 space-y-2">
        <Input
          label="Username"
          type="text"
          {...register("username", { required: "Username is required" })}
          error={errors.username?.message}
          placeholder="Enter your username"
        />
        <div className="flex items-center gap-4">
          <Button
            size="md"
            type="submit"
            loading={isSubmitting}
            className="w-full"
            variant="secondary"
          >
            Secure Word
          </Button>
          <Button
            onClick={nextStep}
            size="md"
            type="button"
            className="w-full"
            disabled={secureWord === ""}
          >
            Next
          </Button>
        </div>
      </form>
      <BasicModal
        onClose={closeModal}
        title="Security Information"
        isOpen={openModal}
      >
        <div className="mt-3 space-y-2">
          <p className="text-base">
            Secure Word: <span className="font-bold">{secureWord}</span>
          </p>
          <p className="text-base"></p>
          <div className="flex items-center gap-1">
            <Info size={14} color="#4a5565" />
            <p className="text-sm text-gray-600">
              Secure word expires after{" "}
              <span className="font-medium">60 seconds</span>
            </p>
          </div>
          <Button
            onClick={closeModal}
            size="md"
            type="button"
            className="w-full mt-2"
          >
            Ok
          </Button>
        </div>
      </BasicModal>
    </React.Fragment>
  );
};

export default UsernameForm;
