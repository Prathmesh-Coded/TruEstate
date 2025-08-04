import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import { useUserLocation } from "../hooks/useUserLocation";

export default function Header(): React.ReactElement {
  const { location, updateUserLocation, isLoading } = useUserLocation();
  const [activeType, setActiveType] = useState<string>("buy");

  return (
    <header
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
        <Navbar />
        <Hero
          location={location}
          onLocationChange={updateUserLocation}
          isLocationLoading={isLoading}
          activeType={activeType}
          setActiveType={setActiveType}
        />
      </div>
    </header>
  );
}
