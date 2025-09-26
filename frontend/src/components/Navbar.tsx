import { useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import logo from "../assets/logo.png";

const COMPANY_NAME = "TruEstate";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout: _onLogout }: NavbarProps) {
  // onLogout is handled in the dashboard now
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={`flex items-center justify-between bg-white/90 px-4 md:px-8 shadow-md sticky top-0 z-10 transition-all duration-300 isolate ${
        menuOpen ? "rounded-b-none" : "rounded-b-4xl"
      }`}
    >
      {/* Left: Logo + Title */}
      <Link to="/" className="flex items-center no-underline pl-2">
        <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20" />
        <span className="font-bold text-xl md:text-xl tracking-wider text-black">
          {COMPANY_NAME}
        </span>
      </Link>

      {/* Options Icon for Mobile and Bell positioning */}
      <div className="flex items-center">
        {/* Notification Bell - visible on mobile */}
        {user && (
          <div className="md:hidden">
            <NotificationBell />
          </div>
        )}

        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 ml-2 mr-4"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-black mb-1 transition-transform duration-300 ${
              menuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-black mb-1 transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-black transition-transform duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Right: Nav Options */}
      <div
        className={`flex-col md:flex-row flex md:flex items-center gap-3 px-6 md:static absolute top-full left-0 w-full md:w-auto md:shadow-none rounded-b-2xl md:rounded-none z-auto pb-6 md:pb-0 bg-inherit backdrop-blur-xl md:backdrop-blur-none md:bg-transparent transition-all duration-300 ease-in-out transform-origin-top isolate ${
          menuOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        } md:opacity-100 md:scale-y-100 md:pointer-events-auto`}
      >
        {/* Notification Bell - visible on desktop */}
        {user && (
          <div className="hidden md:block">
            <NotificationBell />
          </div>
        )}
        <Link
          to="/dashboard/properties?tab=favorites"
          className="font-semibold text-base no-underline text-black md:hover:text-blue-700 transition md:py-0 md:px-2 px-5 py-2 w-full md:w-auto md:mt-0 mt-2 text-center rounded-md"
          onClick={() => setMenuOpen(false)}
        >
          Saved Properties
        </Link>

        <Link
          to="/post-property"
          className="relative inline-flex items-center justify-center overflow-hidden font-semibold text-black transition duration-300 ease-out bg-white/20 md:bg-transparent border-black/20 md:hover:border-white/30 border-[1px] md:hover:shadow-xl/15 rounded-md group w-full md:w-auto before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full md:hover:before:translate-x-full before:transition-transform before:duration-1000 before:z-10"
          onClick={() => setMenuOpen(false)}
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-black duration-300 -translate-x-full md:group-hover:translate-x-0 ease">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-6.101c.02-.03.044-.058.07-.084L12 5.432z" />
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-black transition-all duration-300 transform md:group-hover:translate-x-full ease">
            Post a Property
          </span>
          <span className="relative invisible px-5 py-2">Post a Property</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Desktop: Dashboard Link */}
            <Link
              to="/dashboard"
              className="relative overflow-hidden group text-black border border-black/20 rounded-md px-5 py-2 font-semibold text-base transition duration-300 ease-out w-full md:w-auto text-center md:hover:shadow-xl/15 md:hover:border-white/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full md:hover:before:translate-x-full before:transition-transform before:duration-1000 no-underline hidden md:inline-block"
            >
              <span className="relative z-10">Dashboard</span>
            </Link>
            {/* Mobile: Dashboard Link */}
            <Link
              to="/dashboard"
              className="md:hidden relative overflow-hidden group bg-white/20 text-black border border-black/20 rounded-md px-5 py-2 font-semibold text-base transition duration-300 ease-out w-full text-center hover:shadow-xl/15 hover:border-white/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-1000 no-underline"
            >
              <span className="relative z-10">Dashboard</span>
            </Link>
          </div>
        ) : (
          <Link
            to="/auth"
            className="relative overflow-hidden group bg-white/20 text-black border border-black/20 rounded-md px-5 py-2 font-semibold text-base no-underline transition duration-300 ease-out w-full md:w-auto text-center md:hover:shadow-xl/15 md:hover:border-white/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full md:hover:before:translate-x-full before:transition-transform before:duration-1000"
            onClick={() => setMenuOpen(false)}
          >
            <span className="relative z-10">Login / Sign Up</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
