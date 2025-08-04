import { AnimatePresence, motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { heroTabs } from "../data/heroConfig";

interface HeroProps {
  location: string;
  onLocationChange: (newLocation: string) => void;
  isLocationLoading: boolean;
  activeType: string;
  setActiveType: (type: string) => void;
}

export default function Hero({
  location,
  onLocationChange,
  isLocationLoading,
  activeType,
  setActiveType,
}: HeroProps): React.ReactElement {
  const activeTabData = heroTabs.find((tab) => tab.id === activeType)!;

  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 text-center h-[45vh] md:h-[42vh] flex flex-col justify-center">
      <div className="w-full md:max-w-lg max-w-screen md:mx-auto flex justify-center rounded-full bg-black/20 backdrop-blur-sm p-1 h-12">
        {heroTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className="relative w-full rounded-full px-2 md:px-4 py-2 text-sm font-semibold transition h-10"
          >
            {activeType === tab.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-blue-600"
                style={{ borderRadius: 9999 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 transition ${
                activeType === tab.id
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.id.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeType}
          variants={textVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="md:h-[13vh] h-[8vh] mb-12 mt-7 md:mb-0"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            {isLocationLoading
              ? "Finding Your Location..."
              : activeTabData.title(location)}
          </h1>
          <p className="mt-2 text-base md:text-lg text-white/90 drop-shadow-md">
            {activeTabData.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      <SearchBar location={location} onLocationChange={onLocationChange} />
    </div>
  );
}
