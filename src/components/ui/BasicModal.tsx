import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  closeOnOutsideClick?: boolean;
}

const BasicModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black opacity-50"></div>

      <div className="relative w-auto min-w-xs md:min-w-xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none p-4">
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold">{title}</p>
            <div
              aria-label="Close modal"
              data-testid="close-button"
              tabIndex={0}
              onClick={onClose}
            >
              <X size={20} color="#000000" strokeWidth={3} />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BasicModal;
