import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getUserProperties,
  getSavedProperties,
  unsaveProperty,
  type Property,
  type SavedProperty,
} from "../../services/propertyService";
import {
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon,
  HeartIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function DashboardProperties() {
  const [searchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "favorites" ? "favorites" : "my-properties";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log("🚀 DashboardProperties: Starting to load data");
      setLoading(true);
      setError("");

      try {
        console.log("📡 DashboardProperties: Making API calls...");
        const [userProps, savedProps] = await Promise.all([
          getUserProperties(),
          getSavedProperties(),
        ]);

        console.log("✅ DashboardProperties: API calls completed");
        console.log("📋 User Properties:", userProps);
        console.log("❤️ Saved Properties:", savedProps);

        setMyProperties(userProps);
        setSavedProperties(savedProps);
      } catch (err: any) {
        console.error("❌ DashboardProperties: Error loading properties:", err);
        setError(err.message || "Failed to load properties");
      } finally {
        setLoading(false);
        console.log("🏁 DashboardProperties: Loading completed");
      }
    };

    loadData();
  }, []);

  const handleUnsaveProperty = async (propertyId: string) => {
    try {
      await unsaveProperty(propertyId);
      setSavedProperties((prev) =>
        prev.filter((saved) => saved.property._id !== propertyId)
      );
    } catch (err: any) {
      setError("Failed to remove property");
    }
  };

  const tabs = [
    { id: "my-properties", name: "My Properties", count: myProperties.length },
    {
      id: "favorites",
      name: "Saved Properties",
      count: savedProperties.length,
    },
  ];

  const PropertyCard = ({
    property,
    type,
  }: {
    property: Property | SavedProperty;
    type: "my-properties" | "favorites";
  }) => {
    // Handle both Property and SavedProperty types
    const prop = "property" in property ? property.property : property;
    const displayPrice = `₹${prop.price.toLocaleString()}`;
    const displayLocation = `${prop.location.city}, ${prop.location.state}`;
    const mainImage =
      prop.images && prop.images.length > 0 ? prop.images[0] : null;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gray-200 relative">
          <img
            src={
              mainImage ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' fill='%23374151'%3EProperty Image%3C/text%3E%3C/svg%3E"
            }
            alt={prop.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' fill='%23374151'%3EProperty Image%3C/text%3E%3C/svg%3E";
            }}
          />
          {type === "my-properties" && (
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  prop.status === "active"
                    ? "bg-green-100 text-green-800"
                    : prop.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : prop.status === "inactive"
                    ? "bg-gray-100 text-gray-800"
                    : prop.status === "under-verification"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {prop.status === "active"
                  ? "Active"
                  : prop.status === "inactive"
                  ? "Inactive"
                  : prop.status === "rejected"
                  ? "Rejected"
                  : prop.status === "under-verification"
                  ? "Under Verification"
                  : "Unknown"}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {prop.title}
          </h3>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">{displayLocation}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-blue-600">
              {displayPrice}
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
              {prop.type}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>{prop.views} views</span>
              </div>
              <div className="flex items-center">
                <HeartIcon className="w-4 h-4 mr-1" />
                <span>{prop.likes} likes</span>
              </div>
            </div>

            {type === "my-properties" ? (
              <span>{new Date(prop.createdAt).toLocaleDateString()}</span>
            ) : (
              <span>by {prop.owner.name}</span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                View Details
              </button>
              {type === "my-properties" ? (
                <button className="bg-gray-50 text-gray-600 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => handleUnsaveProperty(prop._id)}
                  className="bg-red-50 text-red-600 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                      My Properties
                    </h1>
                    <p className="text-sm text-gray-500">
                      Manage your property listings and favorites
                    </p>
                  </div>
                </div>
                <div className="sm:flex-shrink-0">
                  <Link
                    to="/post-property"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Post Property
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.name}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "my-properties" && (
                <div>
                  {myProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myProperties.map((property) => (
                        <PropertyCard
                          key={property._id}
                          property={property}
                          type="my-properties"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No properties posted
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by posting your first property.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/post-property"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Post Property
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favorites" && (
                <div>
                  {savedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedProperties.map((savedProperty) => (
                        <PropertyCard
                          key={savedProperty._id}
                          property={savedProperty}
                          type="favorites"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No favorite properties
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Browse properties and add them to your favorites.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Browse Properties
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
