import Button from "./Button";
import LocationSelector from "./LocationSelector";

interface SearchBarProps {
  location: string;
  onLocationChange: (newLocation: string) => void;
}

export default function SearchBar({
  location,
  onLocationChange,
}: SearchBarProps): React.ReactElement {
  return (
    <div className="mt-4 md:mt-8 max-w-2xl mx-auto w-full px-2">
      {/* Mobile: Location Selector separated and centered */}
      <div className="md:hidden flex justify-center mb-4">
        <div className="md:bg-white bg-black/30 backdrop-blur-lg rounded-full shadow-lg px-3 py-1">
          <LocationSelector
            currentLocation={location}
            onLocationChange={onLocationChange}
          />
        </div>
      </div>

      <form
        className="flex flex-row items-stretch bg-white rounded-full shadow-lg"
        role="search"
        tabIndex={0}
        autoComplete="off"
      >
        {/* Desktop: Location Selector */}
        <div className="hidden md:flex flex-shrink-0 px-2 py-1">
          <LocationSelector
            currentLocation={location}
            onLocationChange={onLocationChange}
          />
        </div>

        {/* Divider for md+ */}
        <div className="hidden md:block self-center h-6 w-px mx-1 bg-gray-200" />

        {/* Text Input */}
        <div className="flex-1">
          <input
            type="text"
            aria-label="Search for locality, landmark, or project"
            placeholder="Search for locality, landmark, or project"
            className="w-full h-full py-3 px-4 text-gray-700 placeholder-gray-400 bg-transparent outline-none"
            spellCheck={false}
          />
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0">
          <Button
            type="submit"
            className="!rounded-full mx-2 my-2 px-4 md:px-6 hover:bg-blue-600 text-white transition-colors duration-300"
          >
            {/* Mobile: Show only search icon */}
            <span className="md:hidden">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {/* Desktop: Show "Search" text */}
            <span className="hidden md:inline">Search</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
