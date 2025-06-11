import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import PasswordForm, {
  PasswordFormProps,
} from "../../app/(main)/login/components/PasswordForm";
import { ButtonProps } from "../../components/ui/Button";
import { InputProps } from "../../components/ui/Input";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("../../lib/crypto", () => ({
  hashPassword: (input: string) => `hashed-${input}`,
}));

jest.mock("../../components/ui/Input", () => {
  const MockInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} data-testid="password-input" />
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
    ...props
  }: ButtonProps) => {
    return (
      <button
        {...props}
        disabled={loading || disabled}
        data-testid={`button-${children!.toString().toLowerCase()}`}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  };
  MockButton.displayName = "MockButton";
  return MockButton;
});

global.fetch = jest.fn();

describe("PasswordForm", () => {
  const mockProps: PasswordFormProps = {
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    secureWord: "secure",
    username: "user",
    timeLeft: 60,
    setToken: jest.fn(),
  };

  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it("renders the form correctly", () => {
    render(<PasswordForm {...mockProps} />);

    expect(screen.getByText("Password Input Step")).toBeInTheDocument();
    expect(screen.getByText(/Secure word expires in/)).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("button-back")).toBeInTheDocument();
    expect(screen.getByTestId("button-next")).toBeInTheDocument();
  });

  it("shows validation error if password is empty", async () => {
    render(<PasswordForm {...mockProps} />);

    fireEvent.submit(screen.getByTestId("password-input").closest("form")!);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Password is required",
      );
    });
  });

  it("submits password and proceeds to next step on success", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: { token: "mock-token" },
      }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<PasswordForm {...mockProps} />);

    await user.type(screen.getByTestId("password-input"), "mypassword");

    fireEvent.submit(screen.getByTestId("password-input").closest("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/login", expect.anything());
      expect(mockProps.setToken).toHaveBeenCalledWith("mock-token");
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });

  it("shows API error when response is not ok", async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: "Invalid credentials",
      }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<PasswordForm {...mockProps} />);
    await user.type(screen.getByTestId("password-input"), "wrong");

    fireEvent.submit(screen.getByTestId("password-input").closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("shows generic error on fetch failure", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network fail"));

    render(<PasswordForm {...mockProps} />);
    await user.type(screen.getByTestId("password-input"), "fail");

    fireEvent.submit(screen.getByTestId("password-input").closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Internal server error");
    });
  });

  it("disables button while submitting", async () => {
    let resolvePromise!: (value: Response) => void;
    const promise = new Promise<Response>((res) => {
      resolvePromise = res;
    });

    (fetch as jest.Mock).mockReturnValueOnce(promise);

    render(<PasswordForm {...mockProps} />);
    await user.type(screen.getByTestId("password-input"), "loading");

    fireEvent.submit(screen.getByTestId("password-input").closest("form")!);

    await waitFor(() => {
      expect(screen.getByTestId("button-next")).toHaveTextContent("Loading...");
    });

    resolvePromise({
      ok: true,
      json: async () => ({ data: { token: "mock" } }),
    } as Response);
  });

  it("calls prevStep when Back is clicked", async () => {
    render(<PasswordForm {...mockProps} />);
    await user.click(screen.getByTestId("button-back"));
    expect(mockProps.prevStep).toHaveBeenCalled();
  });
});
