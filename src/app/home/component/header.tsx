"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useSupabaseAuthStore } from "@/lib/store/useSupabaseAuthStore";

// Check if we're in the preview environment
const isPreview =
  typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app");

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useSupabaseAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const toggleMarketDropdown = () => {
    setMarketDropdownOpen(!marketDropdownOpen);
  };

  const marketLinks = [
    { href: "/exchange-rates", label: "Exchange Rates" },
    { href: "/cryptos", label: "Cryptocurrencies" },
    { href: "/forex", label: "Forex" },
    { href: "/indices", label: "Indices" },
    { href: "/commodities", label: "Commodities" },
  ];

  const navLinks = [
    { href: "/about", label: "ABOUT US" },
    { href: "/faqs", label: "FAQS" },
    { href: "/contact", label: "CONTACT" },
    // { href: "/trade", label: "TRADE" },
    { href: "/auth/signup", label: "INVESTMENT PLAN" },
  ];

  const isActive = (path: string) => pathname === path;

  const firstName = user?.user_metadata?.first_name || "Account";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-sm shadow-md" : "bg-black"
      } border-b border-gray-800`}
    >
      {isPreview && (
        <div className="bg-blue-600 text-white text-center text-xs py-1">
          Preview Mode -{" "}
          <Link href="/dashboard" className="underline font-bold">
            Click here to view Dashboard
          </Link>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Language */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative h-14 w-40">
                <div className="absolute inset-0 flex flex-col justify-center">
                  <div className="text-[#FFCC00] font-bold text-xl">D</div>
                  {/* <div className="text-[#FFCC00] font-bold text-xl">
                    MARKETPIP
                  </div> */}
                </div>
              </div>
            </Link>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 border-gray-700 text-gray-300 hover:text-white"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  English
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative group">
              {/* <button
                className={`text-gray-300 hover:text-white font-medium flex items-center transition-colors ${isActive("/exchange-rates") || isActive("/cryptos") || isActive("/forex") || isActive("/indices") || isActive("/commodities") ? "text-white" : ""}`}
                aria-expanded={marketDropdownOpen}
                aria-haspopup="true"
              >
                MARKETS
                <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" />
              </button> */}
              <div className="absolute left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-800">
                <div className="py-1">
                  {marketLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 text-sm ${isActive(link.href) ? "text-[#FFCC00] bg-gray-800/50" : "text-gray-300 hover:bg-gray-800/50 hover:text-white"} transition-colors`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-300 hover:text-white font-medium transition-colors ${isActive(link.href) ? "text-white" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00]/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {firstName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>
                    <Link
                      href="/dashboard"
                      className="flex w-full items-center"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/profile"
                      className="flex w-full items-center"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/settings"
                      className="flex w-full items-center"
                    >
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00]/10 hover:text-[#FFCC00]"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-[#FFCC00] text-black hover:bg-[#E6B800] font-medium"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-40 lg:hidden transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ top: "80px" }}
      >
        <div className="h-full overflow-y-auto pb-20">
          <div className="px-4 py-6 space-y-1 border-b border-gray-800">
            {!user && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Link href="/auth/signin" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00]/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-[#FFCC00] text-black hover:bg-[#E6B800]">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {user && (
              <div className="mb-6">
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full bg-[#FFCC00] text-black hover:bg-[#E6B800]">
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}

            <button
              className={`flex items-center justify-between w-full py-3 px-4 rounded-md ${marketDropdownOpen ? "bg-gray-800/50 text-white" : "text-gray-300"}`}
              onClick={toggleMarketDropdown}
            >
              <span className="font-medium">MARKETS</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${marketDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {marketDropdownOpen && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-1 mb-2 space-y-1">
                {marketLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center py-2.5 px-4 rounded-md ${isActive(link.href) ? "text-[#FFCC00] bg-gray-800/30" : "text-gray-300"}`}
                  >
                    <span>{link.label}</span>
                    {isActive(link.href) && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between py-3 px-4 rounded-md ${isActive(link.href) ? "bg-gray-800/50 text-white" : "text-gray-300"}`}
              >
                <span className="font-medium">{link.label}</span>
                {isActive(link.href) && <ChevronRight className="h-5 w-5" />}
              </Link>
            ))}
          </nav>

          {user && (
            <div className="px-4 py-6 border-t border-gray-800">
              <div className="flex items-center px-4 py-3">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-white font-medium">{firstName}</span>
              </div>
              <div className="space-y-1 mt-2">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center py-2.5 px-4 rounded-md text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center py-2.5 px-4 rounded-md text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center py-2.5 px-4 rounded-md text-red-500 hover:bg-gray-800/50 w-full text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
