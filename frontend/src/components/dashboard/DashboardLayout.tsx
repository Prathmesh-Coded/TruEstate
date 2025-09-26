import { useState, Fragment } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon as UserIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  BellIcon as BellIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import { Transition, TransitionChild } from "@headlessui/react";
import logo from "../../assets/logo.png";

const navigation = [
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: UserIcon,
    iconSolid: UserIconSolid,
  },
  {
    name: "My Properties",
    href: "/dashboard/properties",
    icon: BuildingOfficeIcon,
    iconSolid: BuildingOfficeIconSolid,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: BellIcon,
    iconSolid: BellIconSolid,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/"); // Redirect to home page after logout
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen} as={Fragment}>
        <div
          className="relative z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </TransitionChild>

                {/* Mobile sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center">
                    <Link to="/" className="flex items-center">
                      <img className="h-10 w-10" src={logo} alt="TruEstate" />
                      <span className="ml-2 text-xl font-bold text-gray-900">
                        TruEstate
                      </span>
                    </Link>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = isActive ? item.iconSolid : item.icon;
                            return (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                                    isActive
                                      ? "bg-blue-50 text-blue-600"
                                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                  }`}
                                >
                                  <Icon
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                      <li className="-mx-6 mt-auto">
                        <div className="flex items-center gap-x-4 px-6 text-sm font-semibold leading-6 text-gray-900 border-t border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-x-3 px-6 py-3 text-sm leading-6 font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <ArrowLeftIcon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="flex items-center">
              <img className="w-16 h-16" src={logo} alt="TruEstate" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                TruEstate
              </span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = isActive ? item.iconSolid : item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <Icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <div className="flex items-center gap-x-4 px-6 text-sm font-semibold leading-6 text-gray-900 border-t border-gray-200"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-x-3 px-6 py-3 text-sm leading-6 font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowLeftIcon
                    className="h-6 w-6 shrink-0"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <h1 className="text-xl font-semibold leading-6 text-gray-900">
                {navigation.find((item) => item.href === location.pathname)
                  ?.name || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Back to main site link */}
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                ← Back to TruEstate
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
