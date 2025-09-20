import React from "react";

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <div className="rounded border p-4 bg-white">
        <p className="text-gray-600 text-sm">
          Configure admin preferences and application settings here.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
