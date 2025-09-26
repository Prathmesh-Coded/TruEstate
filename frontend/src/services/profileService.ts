// User profile service functions
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const updateUserProfile = async (data: UpdateProfileData) => {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important for sending cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = "Failed to update profile";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (jsonError) {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (jsonError) {
    throw new Error("Invalid response from server");
  }
};
