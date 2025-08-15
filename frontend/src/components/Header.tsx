import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import { useUserLocation } from "../hooks/useUserLocation";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

export default function Header(): React.ReactElement {
  const { location, updateUserLocation, isLoading } = useUserLocation();
  const [activeType, setActiveType] = useState<string>("buy");
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
      style={{
        backgroundImage: `url('/src/assets/headerbg.jpg')`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <Navbar user={user} onLogout={logout} />
        <Hero
          location={location}
          onLocationChange={updateUserLocation}
          isLocationLoading={isLoading}
          activeType={activeType}
          setActiveType={setActiveType}
        />
      </div>
    </motion.header>
  );
}
