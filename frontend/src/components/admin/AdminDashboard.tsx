import React, { useEffect, useMemo, useState } from "react";
import Button from "../Button";

type Summary = {
  pendingCount: number;
  flaggedCount: number;
  approvedCount: number;
  rejectedCount: number;
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      // Reuse properties endpoint to derive quick stats
      const statuses = [
        "PENDING_AUTO,FLAGGED,AUTO_INVALID",
        "APPROVED",
        "REJECTED",
      ];
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all(
        statuses.map((s) =>
          fetch(
            `http://localhost:5000/api/admin/properties?status=${encodeURIComponent(
              s
            )}`,
            { credentials: "include" }
          )
        )
      );

      const [pendingData, approvedData, rejectedData] = await Promise.all([
        pendingRes.json(),
        approvedRes.json(),
        rejectedRes.json(),
      ]);

      if (!pendingRes.ok || !approvedRes.ok || !rejectedRes.ok) {
        throw new Error(
          pendingData.message ||
            approvedData.message ||
            rejectedData.message ||
            "Failed to load summary"
        );
      }

      const pending = pendingData.properties || [];
      const approved = approvedData.properties || [];
      const rejected = rejectedData.properties || [];

      const flaggedCount = pending.filter(
        (p: any) => p.verification?.status === "FLAGGED"
      ).length;
      const autoInvalid = pending.filter(
        (p: any) => p.verification?.status === "AUTO_INVALID"
      ).length;

      setSummary({
        pendingCount: pending.length,
        flaggedCount: flaggedCount + autoInvalid,
        approvedCount: approved.length,
        rejectedCount: rejected.length,
      });
    } catch (e: any) {
      setError(e.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Pending / Review",
        value: summary?.pendingCount ?? 0,
        color: "bg-yellow-50 text-yellow-800",
      },
      {
        label: "Flagged / Invalid",
        value: summary?.flaggedCount ?? 0,
        color: "bg-orange-50 text-orange-800",
      },
      {
        label: "Approved",
        value: summary?.approvedCount ?? 0,
        color: "bg-green-50 text-green-800",
      },
      {
        label: "Rejected",
        value: summary?.rejectedCount ?? 0,
        color: "bg-red-50 text-red-800",
      },
    ],
    [summary]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button size="sm" onClick={fetchSummary}>
          Refresh
        </Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-lg p-4 border ${c.color}`}>
            <div className="text-sm">{c.label}</div>
            <div className="text-3xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
