import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { indianCities } from "../data/cities";

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (newLocation: string) => void;
}

export default function LocationSelector({
  currentLocation,
  onLocationChange,
}: LocationSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    onLocationChange(city);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Custom Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[180px] h-full px-4 py-3 border-none md:text-black text-white md:bg-transparent focus:outline-none focus:ring-0 transition-all duration-300 flex items-center justify-between relative ${
          isOpen ? "rounded-b-xl" : "rounded-lg" // Changes border on open
        }`}
        aria-label="Select location"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{ minWidth: 0 }}
      >
        <span className="truncate pr-2 flex-1 text-left overflow-ellipsis">
          {currentLocation}
        </span>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-1 top-1/2 -translate-y-1/2 flex-shrink-0 pointer-events-none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full -left-2 w-[200px] z-[9999] mt-1 bg-black/30 text-white md:bg-white md:text-black rounded-b-lg shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="max-h-[200px] md:bg-white bg-black/30 overflow-y-auto">
              {indianCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full px-4 py-3 text-left pl-6 hover:bg-blue-50 transition-colors ${
                    currentLocation === city
                      ? "bg-blue-100 text-blue-700"
                      : "md:text-black text-white"
                  }`}
                  role="option"
                  aria-selected={currentLocation === city}
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
