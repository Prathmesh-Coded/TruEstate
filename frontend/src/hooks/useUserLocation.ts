import { useState, useEffect } from "react";
import { getCityFromCoords } from "../services/locationService";

const DEFAULT_LOCATION = "Mumbai";

interface UseUserLocationReturn {
  location: string;
  updateUserLocation: (newLocation: string) => void;
  isLoading: boolean;
}

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<string>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setLocation(savedLocation);
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const city = await getCityFromCoords(latitude, longitude);
          const newLocation = city || DEFAULT_LOCATION;
          setLocation(newLocation);
          localStorage.setItem("userLocation", newLocation);
        } catch (error) {
          setLocation(DEFAULT_LOCATION);
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setIsLoading(false);
        setLocation(DEFAULT_LOCATION);
      }
    );
  }, []);

  const updateUserLocation = (newLocation: string): void => {
    setLocation(newLocation);
    localStorage.setItem("userLocation", newLocation);
  };

  return { location, updateUserLocation, isLoading };
}
