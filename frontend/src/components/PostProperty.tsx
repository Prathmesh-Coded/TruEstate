import React, { useState } from "react";
import VerifyPhoneNumber from "../components/VerifyPhoneNumber";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PropertyLoadingScreen from "./PropertyLoadingScreen";

// Types for the property listing form
interface PropertyFormData {
  // Step 1: Basic Information
  listingType: "buy" | "rent" | "pg";
  propertyType: "apartment" | "house" | "villa" | "plot" | "commercial";

  // Step 2: Property & Location Details
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    locality: string;
    country: string;
  };

  // Step 3: Features & Amenities (Dynamic)
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  furnished?: boolean;
  parking?: boolean;

  // PG Specific
  roomSharing?: "single" | "double" | "triple";
  foodIncluded?: boolean;
  pgFor?: "boys" | "girls" | "co-ed";

  // Plot Specific
  plotArea?: number;
  plotAreaUnit?: "sqft" | "sqyd" | "sqm" | "bigha" | "acre";
  zoning?: "residential" | "commercial" | "agricultural";

  // Commercial Specific
  propertyStatus?: "ready" | "under-construction";
  washrooms?: number;

  // Step 4: Photos & Documents
  photos: File[];
  ownerId: File | null;
  ownershipDoc: File | null;
  buildingPlan?: File | null;
}

// Validation error interface
interface ValidationErrors {
  [key: string]: string;
}

const PostProperty: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    listingType: "buy",
    propertyType: "apartment",
    title: "",
    description: "",
    price: 0,
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      locality: "",
      country: "India",
    },
    photos: [],
    ownerId: null,
    ownershipDoc: null,
  });

  // File upload refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Helper functions
  const formatIndianPrice = (price: number): string => {
    if (price === 0) return "";
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Crore`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString("en-IN")}`;
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.listingType) {
      errors.listingType = "Please select a listing type";
    }
    if (!formData.propertyType) {
      errors.propertyType = "Please select a property type";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Property title is required";
    } else if (formData.title.trim().length < 10) {
      errors.title = "Title must be at least 10 characters long";
    }

    if (!formData.description.trim()) {
      errors.description = "Property description is required";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters long";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    } else if (formData.price > 999999999) {
      errors.price = "Price cannot exceed 999,99,99,999";
    }

    if (!formData.address.street.trim()) {
      errors.street = "Street address is required";
    }
    if (!formData.address.locality.trim()) {
      errors.locality = "Locality is required";
    }
    if (!formData.address.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.address.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.address.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: ValidationErrors = {};
    const isResidential = ["apartment", "house", "villa"].includes(
      formData.propertyType
    );
    const isPG = formData.listingType === "pg";
    const isPlot = formData.propertyType === "plot";
    const isCommercial = formData.propertyType === "commercial";

    if (isResidential) {
      if (!formData.bedrooms) {
        errors.bedrooms =
          "Number of bedrooms is required for residential properties";
      }
      if (!formData.bathrooms) {
        errors.bathrooms =
          "Number of bathrooms is required for residential properties";
      }
    }

    if (isPG) {
      if (!formData.roomSharing) {
        errors.roomSharing = "Room sharing type is required for PG listings";
      }
      if (!formData.pgFor) {
        errors.pgFor = "PG type (boys/girls/co-ed) is required";
      }
    }

    if (isPlot) {
      if (!formData.plotArea || formData.plotArea <= 0) {
        errors.plotArea = "Plot area must be greater than 0";
      }
      if (!formData.zoning) {
        errors.zoning = "Zoning type is required for plot listings";
      }
    }

    if (isCommercial) {
      if (!formData.propertyStatus) {
        errors.propertyStatus =
          "Property status is required for commercial properties";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: ValidationErrors = {};

    if (formData.photos.length === 0) {
      errors.photos = "At least one property photo is required";
    }

    if (!formData.ownerId) {
      errors.ownerId = "Owner's government ID is required";
    }

    if (formData.listingType !== "pg" && !formData.ownershipDoc) {
      errors.ownershipDoc = "Property ownership document is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep4()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        listingType: formData.listingType,
        propertyType: formData.propertyType,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        address: formData.address,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floors: formData.floors,
        furnished: formData.furnished,
        parking: formData.parking,
        roomSharing: formData.roomSharing,
        foodIncluded: formData.foodIncluded,
        pgFor: formData.pgFor,
        plotArea: formData.plotArea,
        plotAreaUnit: formData.plotAreaUnit,
        zoning: formData.zoning,
        propertyStatus: formData.propertyStatus,
        washrooms: formData.washrooms,
        documents: {
          // Placeholder: later implement file uploads and use returned URLs
          ownerId: formData.ownerId ? "uploaded-owner-id" : undefined,
          ownershipDoc: formData.ownershipDoc
            ? "uploaded-ownership-doc"
            : undefined,
          buildingPlan: formData.buildingPlan
            ? "uploaded-building-plan"
            : undefined,
        },
      };

      const res = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }
      const status = data?.verification?.status;
      let msg = "Property submitted successfully!";
      if (status === "PENDING_AUTO") {
        msg += "Pending Validation";
      } else if (status === "AUTO_VALID") {
        msg += " Passed automatic validation.";
      } else if (status === "AUTO_INVALID") {
        msg += " Automatic checks found issues; you'll get details shortly.";
      } else if (status === "FLAGGED") {
        msg += " Needs manual review by our team.";
      }
      alert(msg);
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting property:", error);
      alert(error.message || "Failed to submit property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const nextStep = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      clearValidationErrors();
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    clearValidationErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          Let's start with the fundamental details of your property listing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.listingType}
            onChange={(e) => handleInputChange("listingType", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.listingType
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="pg">PG (Paying Guest)</option>
          </select>
          {validationErrors.listingType && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.listingType}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Choose how you want to list your property
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleInputChange("propertyType", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.propertyType
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot/Land</option>
            <option value="commercial">Commercial</option>
          </select>
          {validationErrors.propertyType && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.propertyType}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Select the type of property you're listing
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button
          onClick={nextStep}
          disabled={!formData.listingType || !formData.propertyType}
          size="lg"
          className="px-8 py-3"
        >
          Next: Property Details
        </Button>
      </div>
    </motion.div>
  );

  // Step 2: Property & Location Details
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property & Location Details
        </h2>
        <p className="text-gray-600">
          Provide detailed information about your property and its location
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="e.g., Beautiful 2BHK Apartment in City Center"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.title && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            placeholder="Describe your property in detail. Include key features, amenities, and what makes it special..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.description
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {validationErrors.description && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.price || ""}
              onChange={(e) =>
                handleInputChange("price", Number(e.target.value))
              }
              placeholder="5000000"
              min="1"
              max="999999999"
              className={`w-full px-3 py-2 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.price ? "border-red-500" : "border-gray-300"
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
              {formData.price > 0 && formatIndianPrice(formData.price)}
            </div>
          </div>
          {validationErrors.price && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.price}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter price in Rupees. Will be displayed in Lakhs/Crores format
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Address Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange("street", e.target.value)}
                placeholder="House/Flat Number, Street Name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.street ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.street && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.street}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locality/Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.locality}
                onChange={(e) =>
                  handleAddressChange("locality", e.target.value)
                }
                placeholder="e.g., Koramangala, Bandra West"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.locality
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.locality && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.locality}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                placeholder="e.g., Mumbai, Bangalore"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.city && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                placeholder="e.g., Maharashtra, Karnataka"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.state ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.state && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.state}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) => handleAddressChange("pincode", e.target.value)}
                placeholder="e.g., 400001"
                maxLength={6}
                pattern="[0-9]{6}"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.pincode
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.pincode && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.pincode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.address.country}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Defaulted to India for Indian market
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-3 pt-6">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="px-8 py-3"
        >
          ← Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={
            !formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.address.street ||
            !formData.address.locality ||
            !formData.address.city ||
            !formData.address.state ||
            !formData.address.pincode
          }
          size="lg"
          className="px-8 py-3"
        >
          Next: Features & Amenities
        </Button>
      </div>
    </motion.div>
  );

  // Step 3: Features & Amenities (Dynamic Fields)
  const renderStep3 = () => {
    const isResidential = ["apartment", "house", "villa"].includes(
      formData.propertyType
    );
    const isPG = formData.listingType === "pg";
    const isPlot = formData.propertyType === "plot";
    const isCommercial = formData.propertyType === "commercial";

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Features & Amenities
          </h2>
          <p className="text-gray-600">
            Tell us about the features and amenities of your property
          </p>
        </div>

        <div className="space-y-6">
          {/* Residential Properties */}
          {isResidential && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Residential Features
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bedrooms || ""}
                    onChange={(e) =>
                      handleInputChange("bedrooms", Number(e.target.value))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.bedrooms
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select bedrooms</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} BHK
                      </option>
                    ))}
                  </select>
                  {validationErrors.bedrooms && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.bedrooms}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bathrooms || ""}
                    onChange={(e) =>
                      handleInputChange("bathrooms", Number(e.target.value))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.bathrooms
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select bathrooms</option>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Bathroom{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  {validationErrors.bathrooms && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.bathrooms}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floors
                  </label>
                  <input
                    type="number"
                    value={formData.floors || ""}
                    onChange={(e) =>
                      handleInputChange("floors", Number(e.target.value))
                    }
                    placeholder="e.g., 2"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.furnished || false}
                      onChange={(e) =>
                        handleInputChange("furnished", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 accent-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Furnished
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.parking || false}
                      onChange={(e) =>
                        handleInputChange("parking", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 accent-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Alloted Parking Available
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PG Specific Fields */}
          {isPG && (
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                PG Specific Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Sharing <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roomSharing || ""}
                    onChange={(e) =>
                      handleInputChange("roomSharing", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.roomSharing
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select room sharing</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                  </select>
                  {validationErrors.roomSharing && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.roomSharing}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PG For <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pgFor || ""}
                    onChange={(e) => handleInputChange("pgFor", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.pgFor
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select PG type</option>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                    <option value="co-ed">Co-ed</option>
                  </select>
                  {validationErrors.pgFor && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.pgFor}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.foodIncluded || false}
                      onChange={(e) =>
                        handleInputChange("foodIncluded", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Food Included
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Plot Specific Fields */}
          {isPlot && (
            <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Plot/Land Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Area <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.plotArea || ""}
                      onChange={(e) =>
                        handleInputChange("plotArea", Number(e.target.value))
                      }
                      placeholder="e.g., 1000"
                      min="1"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.plotArea
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <select
                      value={formData.plotAreaUnit || "sqft"}
                      onChange={(e) =>
                        handleInputChange("plotAreaUnit", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sqft">Sq Ft</option>
                      <option value="sqyd">Sq Yd (Gaj)</option>
                      <option value="sqm">Sq M</option>
                      <option value="bigha">Bigha</option>
                      <option value="acre">Acre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoning <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.zoning || ""}
                    onChange={(e) =>
                      handleInputChange("zoning", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.zoning
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select zoning</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="agricultural">Agricultural</option>
                  </select>
                  {validationErrors.zoning && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.zoning}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Commercial Specific Fields */}
          {isCommercial && (
            <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Commercial Property Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertyStatus || ""}
                    onChange={(e) =>
                      handleInputChange("propertyStatus", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.propertyStatus
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select status</option>
                    <option value="ready">Ready to Move</option>
                    <option value="under-construction">
                      Under Construction
                    </option>
                  </select>
                  {validationErrors.propertyStatus && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.propertyStatus}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Washrooms
                  </label>
                  <input
                    type="number"
                    value={formData.washrooms || ""}
                    onChange={(e) =>
                      handleInputChange("washrooms", Number(e.target.value))
                    }
                    placeholder="e.g., 2"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between space-x-3 pt-6">
          <Button
            onClick={prevStep}
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            ← Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={false}
            size="lg"
            className="px-8 py-3"
          >
            Next: Photos & Documents
          </Button>
        </div>
      </motion.div>
    );
  };

  // Step 4: Photos & Verification Documents
  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Photos & Verification Documents
        </h2>
        <p className="text-gray-600">
          Upload property photos and required verification documents
        </p>
      </div>

      <div className="space-y-6">
        {/* Property Photos */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Photos <span className="text-red-500">*</span>
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={photoInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData((prev) => ({
                    ...prev,
                    photos: [...prev.photos, ...files],
                  }));
                }}
                className="hidden"
              />
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Click to upload
                </button>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>

            {formData.photos.length === 0 && (
              <p className="text-sm text-red-600">
                Please upload at least one property photo.
              </p>
            )}
            {validationErrors.photos && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.photos}
              </p>
            )}

            {/* Display uploaded photos */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.photos.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== index),
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verification Documents */}
        <div className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Documents
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These documents are required for verification and to ensure the
            authenticity of your listing.
          </p>

          <div className="space-y-4">
            {/* Owner's Government ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner's Government ID <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleInputChange("ownerId", file);
                  }}
                  className="hidden"
                />
                {!formData.ownerId ? (
                  <div>
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Upload ID Document
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Aadhaar Card, PAN Card, Passport, etc.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formData.ownerId.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInputChange("ownerId", null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {validationErrors.ownerId && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.ownerId}
                  </p>
                )}
              </div>
            </div>

            {/* Property Ownership Document */}
            {formData.listingType !== "pg" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Ownership Document{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleInputChange("ownershipDoc", file);
                    }}
                    className="hidden"
                    id="ownership-doc"
                  />
                  {!formData.ownershipDoc ? (
                    <div>
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <label
                          htmlFor="ownership-doc"
                          className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
                        >
                          Upload Ownership Document
                        </label>
                      </p>
                      <p className="text-xs text-gray-500">
                        Sale Deed, Title Deed, etc.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {formData.ownershipDoc.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInputChange("ownershipDoc", null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {validationErrors.ownershipDoc && (
                    <p className="text-sm text-red-600 mt-1">
                      {validationErrors.ownershipDoc}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Building Plan for Commercial */}
            {formData.propertyType === "commercial" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building/Layout Approval Plan
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleInputChange("buildingPlan", file);
                    }}
                    className="hidden"
                    id="building-plan"
                  />
                  {!formData.buildingPlan ? (
                    <div>
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <label
                          htmlFor="building-plan"
                          className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
                        >
                          Upload Building Plan
                        </label>
                      </p>
                      <p className="text-xs text-gray-500">
                        Building approval, layout plan, etc.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {formData.buildingPlan.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInputChange("buildingPlan", null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-3 pt-6">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="px-8 py-3"
        >
          ← Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={
            !formData.ownerId ||
            (formData.listingType !== "pg" && !formData.ownershipDoc) ||
            formData.photos.length === 0
          }
          size="lg"
          className="px-8 py-3"
        >
          Next: Review & Submit
        </Button>
      </div>
    </motion.div>
  );

  // Step 5: Review & Submit
  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Review all the information before submitting your property listing
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information Review */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">
                Listing Type:
              </span>
              <p className="text-gray-900 capitalize">{formData.listingType}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Property Type:
              </span>
              <p className="text-gray-900 capitalize">
                {formData.propertyType}
              </p>
            </div>
          </div>
        </div>

        {/* Property Details Review */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Details
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Title:</span>
              <p className="text-gray-900">{formData.title}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Description:
              </span>
              <p className="text-gray-900">{formData.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Price:</span>
              <p className="text-gray-900 font-semibold">
                {formatIndianPrice(formData.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Address Review */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="space-y-2">
            <p className="text-gray-900">{formData.address.street}</p>
            <p className="text-gray-900">{formData.address.locality}</p>
            <p className="text-gray-900">
              {formData.address.city}, {formData.address.state} -{" "}
              {formData.address.pincode}
            </p>
            <p className="text-gray-900">{formData.address.country}</p>
          </div>
        </div>

        {/* Features Review */}
        {(["apartment", "house", "villa"].includes(formData.propertyType) ||
          formData.listingType === "pg" ||
          formData.propertyType === "plot" ||
          formData.propertyType === "commercial") && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Features & Amenities
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {formData.bedrooms && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Bedrooms:
                  </span>
                  <p className="text-gray-900">{formData.bedrooms} BHK</p>
                </div>
              )}
              {formData.bathrooms && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Bathrooms:
                  </span>
                  <p className="text-gray-900">{formData.bathrooms}</p>
                </div>
              )}
              {formData.plotArea && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Plot Area:
                  </span>
                  <p className="text-gray-900">
                    {formData.plotArea} {formData.plotAreaUnit}
                  </p>
                </div>
              )}
              {formData.roomSharing && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Room Sharing:
                  </span>
                  <p className="text-gray-900 capitalize">
                    {formData.roomSharing}
                  </p>
                </div>
              )}
              {formData.propertyStatus && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Property Status:
                  </span>
                  <p className="text-gray-900 capitalize">
                    {formData.propertyStatus.replace("-", " ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Review */}
        <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Documents Uploaded
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900">
                Owner's Government ID: {formData.ownerId?.name}
              </span>
            </div>
            {formData.ownershipDoc && (
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-900">
                  Property Ownership Document: {formData.ownershipDoc.name}
                </span>
              </div>
            )}
            {formData.buildingPlan && (
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-900">
                  Building Plan: {formData.buildingPlan.name}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900">
                Property Photos: {formData.photos.length} uploaded
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-3 pt-6">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="px-8 py-3"
        >
          ← Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="px-8 py-3 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Submitting..." : "Submit for Verification"}
        </Button>
      </div>
    </motion.div>
  );

  if (loading) {
    return <PropertyLoadingScreen />;
  }

  // 1) Not logged in → show error with redirect button
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Back to Home Button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Authentication Required
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                You need to be logged in to post a property on TruEstate.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Why Login is Required
                </h2>
                <p className="text-gray-600">
                  We require authentication to ensure the quality and
                  trustworthiness of our property listings.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Verified Listings
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ensure all properties are posted by real users
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Secure Platform
                    </h3>
                    <p className="text-sm text-gray-600">
                      Protect against spam and fraudulent listings
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Direct Communication
                    </h3>
                    <p className="text-sm text-gray-600">
                      Connect directly with property owners
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Quality Assurance
                    </h3>
                    <p className="text-sm text-gray-600">
                      Maintain high standards for all listings
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  Sign In to Continue
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Don't have an account?{" "}
                  <Link
                    to="/auth?mode=signup"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2) Logged in with phone provider → allow directly
  const loggedInWithPhone = user.authProvider === "phone";
  const hasLinkedPhone = Boolean(
    user.phoneNumber && user.phoneNumber.trim().length > 0
  );

  const canPost = loggedInWithPhone || hasLinkedPhone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 pt-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Post Your Property
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              List your property on TruEstate and connect with potential buyers
              or tenants. Our platform ensures your listing reaches the right
              audience.
            </p>
          </div>

          {/* 3) Logged in via email/google without phone → show phone verification */}
          <AnimatePresence>
            {!canPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Phone Verification Required
                    </h2>
                    <p className="text-gray-600">
                      To ensure the quality of our listings, we require phone
                      verification for all property posts.
                    </p>
                  </div>
                  <VerifyPhoneNumber
                    onSuccess={() => {
                      /* checkAuth is invoked inside VerifyPhoneNumber */
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {canPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Step Navigation */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Post Your Property
                  </h2>
                  <div className="text-blue-100 text-sm">
                    Step {currentStep} of 5
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mt-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= currentStep
                            ? "bg-white text-blue-600"
                            : "bg-blue-200 text-blue-300"
                        }`}
                      >
                        {step < currentStep ? "✓" : step}
                      </div>
                      <div className="text-xs text-blue-100 mt-1 text-center">
                        {step === 1 && "Basic Info"}
                        {step === 2 && "Details"}
                        {step === 3 && "Features"}
                        {step === 4 && "Documents"}
                        {step === 5 && "Review"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostProperty;
