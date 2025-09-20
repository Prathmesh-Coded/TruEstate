import React, { useEffect, useState } from "react";
import Button from "./Button";
import { useNotifications } from "../contexts/NotificationContext";

interface AdminProperty {
  _id: string;
  title: string;
  listingType: string;
  propertyType: string;
  price: number;
  verification: {
    status: string;
    autoScore?: number;
    reasons: { type: string; field: string; message: string }[];
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING_AUTO: "bg-gray-200 text-gray-800",
  AUTO_VALID: "bg-green-100 text-green-800",
  AUTO_INVALID: "bg-red-100 text-red-700",
  FLAGGED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-200 text-red-800",
};

const AdminVerification: React.FC = () => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING_AUTO,FLAGGED,AUTO_INVALID");
  const { showToast } = useNotifications();

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/properties?status=${encodeURIComponent(
          filter
        )}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setProperties((data.properties || []) as AdminProperty[]);
    } catch (e: any) {
      setError(e.message);
      showToast({
        title: "Error",
        message: e.message,
        type: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const act = async (id: string, action: "APPROVE" | "REJECT") => {
    const reason =
      action === "REJECT"
        ? window.prompt("Enter rejection reason (optional)") || undefined
        : undefined;

    try {
      console.log(`Attempting to ${action} property ${id}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(
        `http://localhost:5000/api/admin/properties/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ action, reason }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log(`Response status: ${res.status}`);

      if (!res.ok) {
        let errorMessage;
        try {
          const data = await res.json();
          errorMessage =
            data.message || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("Action successful:", data);

      // Refresh properties list
      await fetchProperties();

      // Show success toast
      showToast({
        title: "Success",
        message: `Property ${action.toLowerCase()}ed successfully!`,
        type: "SUCCESS",
      });
    } catch (e: any) {
      console.error("Action failed:", e);

      let errorMessage = "Action failed: ";

      if (e.name === "AbortError") {
        errorMessage +=
          "Request timed out. Please check your connection and try again.";
      } else if (e.message === "Failed to fetch") {
        errorMessage +=
          "Cannot connect to server. Please check if the backend is running on http://localhost:5000";
      } else if (e.message.includes("CORS")) {
        errorMessage += "CORS error. Please check server configuration.";
      } else if (
        e.message.includes("401") ||
        e.message.includes("Unauthorized")
      ) {
        errorMessage += "Authentication failed. Please log in again.";
      } else if (e.message.includes("403") || e.message.includes("Forbidden")) {
        errorMessage +=
          "Access denied. You don't have permission to perform this action.";
      } else if (e.message.includes("404")) {
        errorMessage += "Property not found. It may have been deleted.";
      } else if (e.message.includes("500")) {
        errorMessage += "Server error. Please try again later.";
      } else {
        errorMessage += e.message || "Unknown error occurred";
      }

      showToast({
        title: "Error",
        message: errorMessage,
        type: "ERROR",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Property Verification</h1>
      <div className="flex items-center gap-4 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="PENDING_AUTO,FLAGGED,AUTO_INVALID">
            Pending / Flagged / Invalid
          </option>
          <option value="AUTO_VALID">Auto Valid</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <Button onClick={fetchProperties} size="sm">
          Refresh
        </Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-4">
        {properties.map((p) => (
          <div key={p._id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <p className="text-sm text-gray-600">
                  {p.listingType} · {p.propertyType} · ₹
                  {p.price.toLocaleString("en-IN")}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      statusColors[p.verification.status] || "bg-gray-100"
                    }`}
                  >
                    {p.verification.status}
                  </span>
                  {p.verification.autoScore != null && (
                    <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                      Score: {(p.verification.autoScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {p.verification.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    onClick={() => act(p._id, "APPROVE")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                )}
                {p.verification.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => act(p._id, "REJECT")}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
            {p.verification.reasons.length > 0 && (
              <div className="mt-3 space-y-1">
                {p.verification.reasons.map((r, i) => (
                  <p
                    key={i}
                    className={`text-xs ${
                      r.type === "ERROR"
                        ? "text-red-600"
                        : r.type === "WARN"
                        ? "text-yellow-700"
                        : "text-gray-500"
                    }`}
                  >
                    [{r.type}] {r.field}: {r.message}
                  </p>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2">ID: {p._id}</p>
          </div>
        ))}
        {!loading && properties.length === 0 && (
          <p className="text-sm text-gray-500">
            No properties match this filter.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminVerification;
