import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MFAForm, {
  MFAFormProps,
} from "../../app/(main)/login/components/MFAForm";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ButtonProps } from "../../components/ui/Button";
import { InputProps } from "../../components/ui/Input";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("../../lib/crypto", () => ({
  generateMfaCode: () => "123456",
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../components/ui/Input", () => {
  const MockInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} data-testid="mfa-input" />
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
        data-testid="button-submit"
      >
        {loading ? "Loading..." : children}
      </button>
    );
  };
  MockButton.displayName = "MockButton";
  return MockButton;
});

global.fetch = jest.fn();

describe("MFAForm", () => {
  const mockPush = jest.fn();

  const props: MFAFormProps = {
    username: "testuser",
    token: "mock-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders the form with MFA code display", () => {
    render(<MFAForm {...props} />);
    expect(screen.getByText("MFA Step")).toBeInTheDocument();
    expect(screen.getByText(/123456/)).toBeInTheDocument();
    expect(screen.getByTestId("mfa-input")).toBeInTheDocument();
    expect(screen.getByTestId("button-submit")).toBeInTheDocument();
  });

  it("shows validation error when input is empty", async () => {
    render(<MFAForm {...props} />);
    fireEvent.submit(screen.getByTestId("mfa-input").closest("form")!);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "MFA code is required",
      );
    });
  });

  it("shows validation error for incorrect length", async () => {
    render(<MFAForm {...props} />);
    await userEvent.type(screen.getByTestId("mfa-input"), "123");

    fireEvent.submit(screen.getByTestId("mfa-input").closest("form")!);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Must be exactly 6 characters",
      );
    });
  });

  it("submits and navigates to dashboard on success", async () => {
    const response = {
      ok: true,
      json: async () => ({ data: true }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(response);

    render(<MFAForm {...props} />);
    await userEvent.type(screen.getByTestId("mfa-input"), "123456");

    fireEvent.submit(screen.getByTestId("mfa-input").closest("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/verifyMfa", expect.anything());
      expect(toast.success).toHaveBeenCalledWith("Login successful");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(localStorage.getItem("token")).toBe("mock-token");
    });
  });

  it("shows error on failed API response", async () => {
    const response = {
      ok: false,
      json: async () => ({ error: "Invalid MFA code" }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(response);

    render(<MFAForm {...props} />);
    await userEvent.type(screen.getByTestId("mfa-input"), "123456");

    fireEvent.submit(screen.getByTestId("mfa-input").closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid MFA code");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("shows generic error on fetch failure", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Server crash"));

    render(<MFAForm {...props} />);
    await userEvent.type(screen.getByTestId("mfa-input"), "123456");

    fireEvent.submit(screen.getByTestId("mfa-input").closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Internal server error");
    });
  });

  it("disables the button while submitting", async () => {
    let resolveFetch!: (value: {
      ok: boolean;
      json: () => Promise<{ data: boolean }>;
    }) => void;
    const fetchPromise = new Promise((resolve) => (resolveFetch = resolve));
    (fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

    render(<MFAForm {...props} />);
    await userEvent.type(screen.getByTestId("mfa-input"), "123456");

    fireEvent.submit(screen.getByTestId("mfa-input").closest("form")!);

    await waitFor(() => {
      expect(screen.getByTestId("button-submit")).toHaveTextContent(
        "Loading...",
      );
    });

    resolveFetch({
      ok: true,
      json: async () => ({ data: true }),
    });
  });
});
