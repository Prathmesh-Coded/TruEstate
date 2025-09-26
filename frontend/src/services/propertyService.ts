// Property service for API calls
export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  type: "apartment" | "house" | "villa" | "commercial";
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  images: string[];
  amenities: string[];
  status: "active" | "inactive" | "under-verification" | "rejected";
  owner: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProperty {
  _id: string;
  property: Property;
  savedAt: string;
}

const API_BASE = "/api";

// Get user's own properties
export const getUserProperties = async (): Promise<Property[]> => {
  try {
    console.log("🌐 PropertyService: Calling /api/properties/my-properties");
    const response = await fetch(`${API_BASE}/properties/my-properties`, {
      credentials: "include",
    });

    console.log("📡 PropertyService: Response status:", response.status);
    console.log("📡 PropertyService: Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ PropertyService: Error response:", errorText);

      if (response.status === 401) {
        throw new Error("Please log in to view your properties");
      }
      throw new Error("Failed to fetch properties");
    }

    const data = await response.json();
    console.log("✅ PropertyService: Response data:", data);
    return data.properties || [];
  } catch (error) {
    console.error("❌ PropertyService: Error fetching user properties:", error);
    throw error;
  }
};

// Get user's saved/liked properties
export const getSavedProperties = async (): Promise<SavedProperty[]> => {
  try {
    const response = await fetch(`${API_BASE}/properties/saved`, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to view saved properties");
      }
      throw new Error("Failed to fetch saved properties");
    }

    const data = await response.json();
    return data.savedProperties || [];
  } catch (error) {
    console.error("Error fetching saved properties:", error);
    throw error;
  }
};

// Save/Like a property
export const saveProperty = async (propertyId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/properties/${propertyId}/save`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to save property");
    }
  } catch (error) {
    console.error("Error saving property:", error);
    throw error;
  }
};

// Unsave/Unlike a property
export const unsaveProperty = async (propertyId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE}/properties/${propertyId}/unsave`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to unsave property");
    }
  } catch (error) {
    console.error("Error unsaving property:", error);
    throw error;
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    const data = await response.json();
    return {
      totalProperties: data.totalProperties || 0,
      totalViews: data.totalViews || 0,
      savedProperties: data.savedProperties || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default values if API fails
    return {
      totalProperties: 0,
      totalViews: 0,
      savedProperties: 0,
    };
  }
};
