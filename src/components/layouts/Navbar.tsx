"use client";
import React from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

const navLinks = [
  "Showcase",
  "Docs",
  "Blogs",
  "Analytics",
  "Templates",
  "Enterprise",
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);

  const NavLinks = ({
    className = "",
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <ul className={className}>
      {navLinks.map((link) => (
        <li
          key={link}
          onClick={onClick}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
        >
          {link}
        </li>
      ))}
    </ul>
  );

  const toggleNavbar = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  const isLoginPage = pathname === "/login";

  return (
    <nav className="bg-white px-4 py-3 shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            data-testid="logo"
            onClick={() => router.push("/")}
            className="cursor-pointer shrink-0"
          >
            <p className="font-bold text-2xl">
              Next
              <span className="font-bold text-2xl text-red-800">F</span>
              orge
            </p>
          </div>
          <NavLinks className="hidden md:flex gap-3" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Input
            placeholder="Search transactions..."
            icon={<Search data-testid="search" size={14} color="#99a1af" />}
            hideError
          />
          {!isLoginPage && (
            <Button onClick={redirectToLogin} size="sm">
              Login
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 md:hidden">
          {isSearchOpen ? (
            <div className="w-40">
              <Input
                placeholder="Search..."
                autoFocus
                icon={
                  <Search
                    data-testid="search_mobile_input"
                    size={14}
                    color="#99a1af"
                  />
                }
                onBlur={toggleSearch}
                className="!py-1"
                hideError
              />
            </div>
          ) : (
            <div onClick={toggleSearch} className="cursor-pointer">
              <Search
                data-testid="search_mobile"
                size={20}
                color="#000000"
                strokeWidth={3}
                className="transition-opacity duration-300 ease-in-out"
              />
            </div>
          )}
          <div
            onClick={toggleNavbar}
            className="md:hidden transition-transform duration-300 ease-in-out"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {!isOpen ? (
              <Menu
                size={20}
                color="#000000"
                strokeWidth={3}
                className="transition-opacity duration-300 ease-in-out"
              />
            ) : (
              <X
                size={20}
                color="#000000"
                strokeWidth={3}
                className="transition-opacity duration-300 ease-in-out"
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col gap-2 md:hidden text-sm font-medium text-gray-700 
        transition-all duration-300 ease-in-out overflow-hidden 
        ${isOpen ? "pt-3 max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <NavLinks className="flex flex-col gap-2" />
        {!isLoginPage && (
          <Button onClick={redirectToLogin} className="mt-2" size="sm">
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};
