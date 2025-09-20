import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../Button";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium no-underline ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
          <div className="px-4 py-4 border-b">
            <Link to="/admin" className="no-underline">
              <h1 className="text-xl font-bold text-gray-900">Admin</h1>
              <p className="text-xs text-gray-500">TruEstate</p>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <NavLink to="/admin" end className={navLinkClass}>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/properties" className={navLinkClass}>
              <span>Properties</span>
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
              <span>Users</span>
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClass}>
              <span>Settings</span>
            </NavLink>
          </nav>
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded border border-gray-200"
                onClick={() => {
                  // could add a mobile sidebar toggle later
                }}
              >
                ☰
              </button>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user?.firstName || user?.email}
              </span>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </header>
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
