import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import { ModalProps } from "../../components/ui/BasicModal";
import { InputProps } from "../../components/ui/Input";
import { ButtonProps } from "../../components/ui/Button";
import UsernameForm, {
  UsernameFormProps,
} from "../../app/(main)/login/components/UsernameForm";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("../../components/ui/Input", () => {
  const MockInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => (
      <div>
        <label>{label}</label>
        <input data-testid="input-test-id" ref={ref} {...props} />
        {error && <span data-testid="error-message">{error}</span>}
      </div>
    ),
  );
  MockInput.displayName = "MockInput";
  return MockInput;
});

jest.mock("../../components/ui/Button", () => {
  const MockButton = ({
    children,
    loading,
    disabled,
    onClick,
    type = "button",
    ...props
  }: ButtonProps) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
        data-testid={`button-${children!
          .toString()
          .toLowerCase()
          .replace(" ", "-")}`}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  };
  MockButton.displayName = "MockButton";
  return MockButton;
});

jest.mock("../../components/ui/BasicModal", () => {
  const MockBasicModal = ({ children, isOpen, onClose, title }: ModalProps) => {
    if (!isOpen) return null;
    return (
      <div data-testid="basic-modal">
        <h2 data-testid="modal-title">{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    );
  };
  MockBasicModal.displayName = "MockBasicModal";
  return MockBasicModal;
});

global.fetch = jest.fn();

describe("UsernameForm", () => {
  const mockProps: UsernameFormProps = {
    nextStep: jest.fn(),
    secureWord: "",
    setSecureWord: jest.fn(),
    setUsername: jest.fn(),
    setExpiresAt: jest.fn(),
  };

  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it("should render form elements correctly", () => {
    render(<UsernameForm {...mockProps} />);

    expect(screen.getByText("Username Input Step")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your username"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("button-secure-word")).toBeInTheDocument();
    expect(screen.getByTestId("button-next")).toBeInTheDocument();
  });

  it("should disable next button when secure word is empty", () => {
    render(<UsernameForm {...mockProps} />);

    const nextButton = screen.getByTestId("button-next");
    expect(nextButton).toBeDisabled();
  });

  it("should enable next button when secure word is provided", () => {
    const propsWithSecureWord = {
      ...mockProps,
      secureWord: "test-secure-word",
    };
    render(<UsernameForm {...propsWithSecureWord} />);

    const nextButton = screen.getByTestId("button-next");
    expect(nextButton).not.toBeDisabled();
  });

  it("should show validation error when username is empty", async () => {
    render(<UsernameForm {...mockProps} />);

    const form = screen
      .getByText("Username Input Step")
      .closest("div")
      ?.querySelector("form");

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Username is required",
      );
    });
  });

  it("should call nextStep when next button is clicked", async () => {
    const propsWithSecureWord = {
      ...mockProps,
      secureWord: "test-secure-word",
    };
    render(<UsernameForm {...propsWithSecureWord} />);

    const nextButton = screen.getByTestId("button-next");
    await user.click(nextButton);

    expect(mockProps.nextStep).toHaveBeenCalledTimes(1);
  });

  it("should submit form successfully and show modal", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: { secureWord: "test-secure-word" },
      }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const form = usernameInput.closest("form");

    await user.type(usernameInput, "testuser");

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/getSecureWord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("basic-modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Security Information",
      );
      expect(screen.getByTestId("secure-word")).toBeInTheDocument();
    });

    expect(mockProps.setUsername).toHaveBeenCalledWith("testuser");
    expect(mockProps.setSecureWord).toHaveBeenCalledWith("test-secure-word");
    expect(mockProps.setExpiresAt).toHaveBeenCalledWith(expect.any(Number));
  });

  it("should show error toast when API returns error", async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: "User not found",
      }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const form = usernameInput.closest("form");

    await user.type(usernameInput, "invaliduser");

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("User not found");
    });

    expect(screen.queryByTestId("basic-modal")).not.toBeInTheDocument();
  });

  it("should show generic error toast when fetch fails", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const form = usernameInput.closest("form");

    await user.type(usernameInput, "testuser");

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Internal server error");
    });
  });

  it("should show loading state during form submission", async () => {
    let resolvePromise: (value: {
      ok: boolean;
      json: () => Promise<{ data: { secureWord: string } }>;
    }) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (fetch as jest.Mock).mockReturnValueOnce(pendingPromise);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const form = usernameInput.closest("form");

    await user.type(usernameInput, "testuser");

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    resolvePromise!({
      ok: true,
      json: async () => ({ data: { secureWord: "test" } }),
    });
  });

  it("should close modal when close button is clicked", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: { secureWord: "test-secure-word" },
      }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const secureWordButton = screen.getByTestId("button-secure-word");

    await user.type(usernameInput, "testuser");
    await user.click(secureWordButton);

    await waitFor(() => {
      expect(screen.getByTestId("basic-modal")).toBeInTheDocument();
    });

    const modalCloseButton = screen.getByTestId("modal-close");
    await user.click(modalCloseButton);

    await waitFor(() => {
      expect(screen.queryByTestId("basic-modal")).not.toBeInTheDocument();
    });
  });

  it("should close modal when Ok button is clicked", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: { secureWord: "test-secure-word" },
      }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const secureWordButton = screen.getByTestId("button-secure-word");

    await user.type(usernameInput, "testuser");
    await user.click(secureWordButton);

    await waitFor(() => {
      expect(screen.getByTestId("basic-modal")).toBeInTheDocument();
    });

    const okButton = screen.getByTestId("button-ok");
    await user.click(okButton);

    await waitFor(() => {
      expect(screen.queryByTestId("basic-modal")).not.toBeInTheDocument();
    });
  });

  it("should display security information correctly in modal", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: { secureWord: "my-secure-word" },
      }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const secureWordButton = screen.getByTestId("button-secure-word");

    await user.type(usernameInput, "testuser");
    await user.click(secureWordButton);

    await waitFor(() => {
      expect(screen.getByTestId("basic-modal")).toBeInTheDocument();
    });

    expect(screen.getByTestId("secure-word")).toBeInTheDocument();
    expect(screen.getByText("Secure word expires after")).toBeInTheDocument();
    expect(screen.getByText("60 seconds")).toBeInTheDocument();
  });

  it("should not show modal when API response has no data", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: null,
      }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UsernameForm {...mockProps} />);

    const usernameInput = screen.getByTestId("input-test-id");
    const form = usernameInput.closest("form");

    await user.type(usernameInput, "testuser");

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId("basic-modal")).not.toBeInTheDocument();
    expect(mockProps.setUsername).not.toHaveBeenCalled();
    expect(mockProps.setSecureWord).not.toHaveBeenCalled();
  });
});
