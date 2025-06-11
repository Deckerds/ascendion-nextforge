import React from "react";
import * as nextNavigation from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("Navbar", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (nextNavigation.usePathname as jest.Mock).mockReturnValue("/");
  });

  it("should render logo correctly", () => {
    render(<Navbar />);
    expect(screen.getByTestId("logo")).toHaveTextContent("NextForge");
  });

  it("should toggle mobile menu", () => {
    render(<Navbar />);
    const toggleBtn = screen.getByLabelText(/Open menu/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByLabelText(/Close menu/i)).toBeInTheDocument();
  });

  it("should toggle search input on mobile", () => {
    render(<Navbar />);
    const searchIcon = screen.getByTestId("search_mobile");
    fireEvent.click(searchIcon);
    expect(screen.getByPlaceholderText(/Search\.\.\./i)).toBeInTheDocument();
  });

  it("should redirect to login when login button clicked", () => {
    render(<Navbar />);
    const loginBtn = screen.getAllByText(/Login/i)[0];
    fireEvent.click(loginBtn);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("should not show login button on login page", () => {
    (nextNavigation.usePathname as jest.Mock).mockReturnValue("/login");
    render(<Navbar />);
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });
});
