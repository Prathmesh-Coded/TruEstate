import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserProfile } from "../../services/profileService";
import type { UpdateProfileData } from "../../services/profileService";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function DashboardProfile() {
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Always send complete profile data with current + changed values
      const updateData: UpdateProfileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: user?.phoneNumber || "", // Keep existing phone number
      };

      // Validate required fields on frontend
      if (!updateData.firstName || updateData.firstName.length < 2) {
        setError(
          "First name is required and must be at least 2 characters long"
        );
        setLoading(false);
        return;
      }

      if (!updateData.lastName || updateData.lastName.length < 2) {
        setError(
          "Last name is required and must be at least 2 characters long"
        );
        setLoading(false);
        return;
      }

      // Check if there are actually changes
      const hasChanges =
        updateData.firstName !== user?.firstName ||
        updateData.lastName !== user?.lastName ||
        (updateData.email !== user?.email && user?.authProvider !== "phone");

      if (!hasChanges) {
        setError("No changes to save");
        setLoading(false);
        return;
      }

      await updateUserProfile(updateData);
      await checkAuth(); // Refresh user data
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  My Profile
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your personal information
                </p>
              </div>
            </div>
            <div className="sm:flex-shrink-0">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none not-last:disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none  disabled:opacity-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="block rounded-md py-1.5 px-2 ring-1 ring-inset ring-gray-400 focus:text-gray-800 shadow-sm focus:border-blue-500 w-full sm:text-sm border-gray-300"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {user?.firstName || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="block rounded-md py-1.5 px-2 ring-1 ring-inset ring-gray-400 focus:text-gray-800 shadow-sm focus:border-blue-500 w-full sm:text-sm border-gray-300"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {user?.lastName || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <PhoneIcon className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <div className="mt-1">
                <p className="text-sm text-gray-900">
                  {user?.phoneNumber || "Not provided"}
                </p>
                <p className="text-xs text-gray-500">
                  Phone number cannot be changed
                </p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <div className="mt-1">
                {isEditing && user?.authProvider !== "phone" ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <div>
                    <p className="text-sm text-gray-900">
                      {user?.email || "Not provided"}
                    </p>
                    {user?.authProvider === "phone" && (
                      <p className="text-xs text-gray-500">
                        Email cannot be changed for phone users
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="mt-1">
                <p className="text-sm text-gray-900 capitalize">
                  {user?.authProvider === "phone"
                    ? "Phone Authentication"
                    : user?.authProvider === "google"
                    ? "Google Account"
                    : user?.authProvider === "local"
                    ? "Email Account"
                    : "Unknown"}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member Since
              </label>
              <div className="mt-1">
                <p className="text-sm text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
