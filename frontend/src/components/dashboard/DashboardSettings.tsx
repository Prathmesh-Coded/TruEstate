import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    propertyAlerts: true,
    marketingEmails: false,
    profileVisibility: "public", // public, private, contacts-only
    showPhoneNumber: false,
    showEmail: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Load settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const response = await fetch("/api/auth/settings", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userSettings = await response.json();
        console.log("Loaded settings from server:", userSettings);
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...userSettings,
        }));
      }
    } catch (error) {
      console.log("Failed to load settings, using defaults");
    }
  };

  const handleSettingChange = async (
    setting: string,
    value: boolean | string
  ) => {
    console.log(`Saving setting: ${setting} = ${value}`);
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));

    try {
      const response = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ [setting]: value }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Setting saved successfully:", responseData);
        setSuccess("Settings saved successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        // Try to get the error message from the response
        let errorMessage = "Failed to save settings";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If we can't parse the JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Settings save error:", error);
      setError(error.message || "Failed to save settings");
      setTimeout(() => setError(""), 3000);
      // Revert the change
      setSettings((prev) => ({
        ...prev,
        [setting]:
          typeof value === "boolean"
            ? !value
            : prev[setting as keyof typeof prev],
      }));
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Account deleted successfully. Redirecting to home page...");
        setTimeout(async () => {
          await logout();
          navigate("/"); // Redirect to home page
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const SettingCard = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          onChange(!enabled);
          (e.target as HTMLButtonElement).blur();
        }}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
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
              <ShieldCheckIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">
                manage your account preferences and privacy settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <SettingCard
        title="Notifications"
        description="Choose how you want to be notified about activities on your account"
      >
        <div className="space-y-1">
          <ToggleSwitch
            enabled={settings.emailNotifications}
            onChange={(value) =>
              handleSettingChange("emailNotifications", value)
            }
            label="Email notifications"
          />
          <ToggleSwitch
            enabled={settings.smsNotifications}
            onChange={(value) => handleSettingChange("smsNotifications", value)}
            label="SMS notifications"
          />
          <ToggleSwitch
            enabled={settings.propertyAlerts}
            onChange={(value) => handleSettingChange("propertyAlerts", value)}
            label="Property alerts and updates"
          />
          <ToggleSwitch
            enabled={settings.marketingEmails}
            onChange={(value) => handleSettingChange("marketingEmails", value)}
            label="Marketing emails and promotions"
          />
        </div>
      </SettingCard>

      {/* Privacy Settings */}
      <SettingCard
        title="Privacy & Visibility"
        description="Control who can see your profile and contact information"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) =>
                handleSettingChange("profileVisibility", e.target.value)
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="public">Public - Anyone can see my profile</option>
              <option value="contacts-only">
                Contacts Only - Only people I've contacted
              </option>
              <option value="private">
                Private - Hide my profile from searches
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <ToggleSwitch
              enabled={settings.showPhoneNumber}
              onChange={(value) =>
                handleSettingChange("showPhoneNumber", value)
              }
              label="Show phone number on profile"
            />
            <ToggleSwitch
              enabled={settings.showEmail}
              onChange={(value) => handleSettingChange("showEmail", value)}
              label="Show email address on profile"
            />
          </div>
        </div>
      </SettingCard>

      {/* Account Information */}
      <SettingCard
        title="Account Information"
        description="Your account details and authentication method"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Account Type
              </span>
              <p className="text-xs text-gray-500 capitalize">
                {user?.authProvider === "phone"
                  ? "Phone Authentication"
                  : user?.authProvider === "google"
                  ? "Google Account"
                  : user?.authProvider === "local"
                  ? "Email Account"
                  : "Unknown"}
              </p>
            </div>
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Member Since
              </span>
              <p className="text-xs text-gray-500">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
            <EyeIcon className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </SettingCard>

      {/* Danger Zone */}
      <SettingCard
        title="Danger Zone"
        description="Irreversible and destructive actions"
      >
        <div className="border border-red-200 rounded-md p-4 bg-red-50">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Delete Account
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Once you delete your account, there is no going back. Please
                  be certain. All your properties, favorites, and data will be
                  permanently removed.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    setShowDeleteConfirm(true);
                    (e.target as HTMLButtonElement).blur();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </SettingCard>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Account
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you absolutely sure? This action cannot be undone and will
                permanently delete your account and all associated data.
              </p>
              <div className="items-center px-4 py-3 mt-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
