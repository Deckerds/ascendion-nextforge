import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import userEvent from "@testing-library/user-event";
import { ButtonProps } from "../../components/ui/Button";
import Dashboard from "../../app/dashboard/DashboardPage";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../lib/utils", () => ({
  formatCurrency: (n: number) => `$${n.toFixed(2)}`,
  formatDate: (d: string) => `Formatted(${d})`,
}));

jest.mock("../../components/ui/Button", () => {
  const MockButton = ({ children, onClick, ...props }: ButtonProps) => {
    return (
      <button {...props} onClick={onClick}>
        {children}
      </button>
    );
  };
  MockButton.displayName = "MockButton";
  return MockButton;
});

global.fetch = jest.fn();

describe("Dashboard", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("shows loading spinner initially", async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByTestId("initial-loader")).toBeInTheDocument();
  });

  it("renders transactions after fetch", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: "tx001",
            date: "2023-01-01",
            description: "Payment Received",
            amount: 150,
            type: "credit",
            balance: 1000,
          },
          {
            id: "tx002",
            date: "2023-01-02",
            description: "Purchase",
            amount: -50,
            type: "debit",
            balance: 950,
          },
        ],
      }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Transaction History")).toBeInTheDocument();
      expect(screen.getByText("tx001")).toBeInTheDocument();
      expect(screen.getByText("tx002")).toBeInTheDocument();
      expect(screen.getByText("+$150.00")).toBeInTheDocument();
      expect(screen.getByText("$-50.00")).toBeInTheDocument();
    });
  });

  it("shows toast error on failed fetch", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Failed to fetch",
      }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to fetch");
    });
  });

  it("shows toast on internal error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network issue"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Internal server error");
    });
  });

  it("clears token and navigates to home on logout", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    localStorage.setItem("token", "mockToken");

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Log out"));

    expect(localStorage.getItem("token")).toBe(null);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
