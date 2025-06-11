import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import LoginForm from "../../app/(main)/login/LoginForm";
import { MFAFormProps } from "../../app/(main)/login/components/MFAForm";
import { PasswordFormProps } from "../../app/(main)/login/components/PasswordForm";
import { UsernameFormProps } from "../../app/(main)/login/components/UsernameForm";

jest.mock("../../app/(main)/login/components/UsernameForm", () => {
  return function MockUsernameForm({
    nextStep,
    setSecureWord,
    setUsername,
    setExpiresAt,
  }: UsernameFormProps) {
    return (
      <div data-testid="username-form">
        <button
          onClick={() => {
            setUsername("testuser");
            setSecureWord("testsecure");
            setExpiresAt(Date.now() + 60000);
            nextStep();
          }}
          data-testid="username-next"
        >
          Next Step
        </button>
      </div>
    );
  };
});

jest.mock("../../app/(main)/login/components/PasswordForm", () => {
  return function MockPasswordForm({
    nextStep,
    prevStep,
    timeLeft,
    username,
    secureWord,
    setToken,
  }: PasswordFormProps) {
    return (
      <div data-testid="password-form">
        <span data-testid="time-left">{timeLeft}</span>
        <span data-testid="username-display">{username}</span>
        <span data-testid="secure-word-display">{secureWord}</span>
        <button
          onClick={() => {
            setToken("test-token");
            nextStep();
          }}
          data-testid="password-next"
        >
          Next Step
        </button>
        <button onClick={prevStep} data-testid="password-prev">
          Previous Step
        </button>
      </div>
    );
  };
});

jest.mock("../../app/(main)/login/components/MFAForm", () => {
  return function MockMFAForm({ username, token }: MFAFormProps) {
    return (
      <div data-testid="mfa-form">
        <span data-testid="mfa-username">{username}</span>
        <span data-testid="mfa-token">{token}</span>
      </div>
    );
  };
});

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render initial step correctly", () => {
    render(<LoginForm />);

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("username-form")).toBeInTheDocument();
    expect(screen.queryByTestId("password-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mfa-form")).not.toBeInTheDocument();
  });

  it("should show correct progress indicators", () => {
    render(<LoginForm />);

    const progressBars = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("h-1.5"));

    expect(progressBars[0]).toHaveClass("bg-green-600");
    expect(progressBars[1]).toHaveClass("bg-gray-200");
    expect(progressBars[2]).toHaveClass("bg-gray-200");
  });

  it("should navigate to step 2 when username form is completed", () => {
    render(<LoginForm />);

    const nextButton = screen.getByTestId("username-next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("password-form")).toBeInTheDocument();
    expect(screen.queryByTestId("username-form")).not.toBeInTheDocument();
  });

  it("should pass correct props to password form", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));

    expect(screen.getByTestId("username-display")).toHaveTextContent(
      "testuser",
    );
    expect(screen.getByTestId("secure-word-display")).toHaveTextContent(
      "testsecure",
    );
    expect(screen.getByTestId("time-left")).toHaveTextContent("60");
  });

  it("should navigate to step 3 when password form is completed", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));

    fireEvent.click(screen.getByTestId("password-next"));

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("mfa-form")).toBeInTheDocument();
    expect(screen.queryByTestId("password-form")).not.toBeInTheDocument();
  });

  it("should pass correct props to MFA form", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));

    fireEvent.click(screen.getByTestId("password-next"));

    expect(screen.getByTestId("mfa-username")).toHaveTextContent("testuser");
    expect(screen.getByTestId("mfa-token")).toHaveTextContent("test-token");
  });

  it("should allow navigation back to step 1 from step 2", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("password-prev"));
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("username-form")).toBeInTheDocument();
  });

  it("should update progress indicators correctly as user progresses", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));

    const progressBars = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("h-1.5"));

    expect(progressBars[0]).toHaveClass("bg-green-600");
    expect(progressBars[1]).toHaveClass("bg-green-600");
    expect(progressBars[2]).toHaveClass("bg-gray-200");
  });

  it("should handle timer countdown correctly", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("time-left")).toHaveTextContent("30");
    });
  });

  it("should reset to step 1 when timer expires", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    await waitFor(() => {
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
      expect(screen.getByTestId("username-form")).toBeInTheDocument();
    });
  });

  it("should not proceed beyond step 3", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("username-next"));
    fireEvent.click(screen.getByTestId("password-next"));

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();

    expect(screen.getByTestId("mfa-form")).toBeInTheDocument();
  });
});
