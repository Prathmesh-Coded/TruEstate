// This service handles the external API call to get a city from coordinates.

// Type for the expected API response structure from Nominatim
interface NominatimAddress {
  city?: string;
  town?: string;
  state?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
}

export async function getCityFromCoords(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data: NominatimResponse = await response.json();
    // Return the first available option: city, town, or state
    return data.address.city || data.address.town || data.address.state || null;
  } catch (error) {
    console.error("Error fetching city:", error);
    return null;
  }
}
