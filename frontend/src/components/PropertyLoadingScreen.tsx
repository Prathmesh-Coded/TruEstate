import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const PropertyLoadingScreen = () => {
  const [currentIcon, setCurrentIcon] = useState(0);

  const propertyIcons = [
    {
      name: "House",
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <motion.path
            d="M20 80 L20 45 L50 20 L80 45 L80 80 Z"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.rect
            x="35"
            y="55"
            width="12"
            height="25"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.rect
            x="55"
            y="60"
            width="10"
            height="10"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />
        </svg>
      ),
    },
    {
      name: "Building",
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <motion.rect
            x="25"
            y="20"
            width="50"
            height="60"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          {[0, 1, 2].map((floor) => (
            <g key={floor}>
              {[0, 1, 2].map((window) => (
                <motion.rect
                  key={`${floor}-${window}`}
                  x={32 + window * 12}
                  y={28 + floor * 15}
                  width="8"
                  height="8"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.8 + (floor * 3 + window) * 0.1,
                  }}
                />
              ))}
            </g>
          ))}
        </svg>
      ),
    },
    {
      name: "Apartment",
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <motion.rect
            x="20"
            y="25"
            width="60"
            height="55"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
          <motion.line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            stroke="#8B5CF6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          <motion.rect
            x="30"
            y="60"
            width="8"
            height="15"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
          <motion.rect
            x="45"
            y="35"
            width="6"
            height="6"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
          />
        </svg>
      ),
    },
    {
      name: "Industrial",
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <motion.rect
            x="15"
            y="40"
            width="70"
            height="40"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
          <motion.polygon
            points="15,40 50,20 85,40"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.rect
            x="65"
            y="50"
            width="15"
            height="25"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />
          <motion.circle
            cx="72"
            cy="45"
            r="3"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % propertyIcons.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIcon}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex justify-center"
            >
              {propertyIcons[currentIcon].icon}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold text-gray-800">TruEstate</h2>
          <p className="text-gray-600">
            Loading your perfect property match...
          </p>

          <div className="flex justify-center space-x-1 mt-4">
            {propertyIcons.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIcon ? "bg-blue-600" : "bg-gray-300"
                }`}
                animate={{
                  scale: index === currentIcon ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Discovering {propertyIcons[currentIcon].name.toLowerCase()} properties
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyLoadingScreen;
