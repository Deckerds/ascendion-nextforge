import Input from "@/components/ui/Input";
import { render, screen, fireEvent } from "@testing-library/react";

describe("Input component", () => {
  it("renders the label when provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows the error message if error is passed", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("does not show error message when hideError is true", () => {
    render(<Input label="Email" error="Invalid email" hideError />);
    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
  });

  it("renders a password toggle button and toggles visibility", () => {
    render(<Input type="password" label="Password" />);

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleButton = screen.getByRole("button");

    expect(input.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(input.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(input.type).toBe("password");
  });

  it("passes placeholder prop to input", () => {
    render(<Input placeholder="Enter something" />);
    expect(screen.getByPlaceholderText("Enter something")).toBeInTheDocument();
  });

  it("renders icon if provided", () => {
    const DummyIcon = () => <span data-testid="input-icon">🔍</span>;
    render(<Input icon={<DummyIcon />} />);
    expect(screen.getByTestId("input-icon")).toBeInTheDocument();
  });
});
