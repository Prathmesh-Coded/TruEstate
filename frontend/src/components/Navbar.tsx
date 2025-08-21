import { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
// Button removed; using styled Menu.Button for Dashboard
import { Menu, Transition, Dialog } from "@headlessui/react";

const COMPANY_NAME = "TruEstate";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  return (
    <nav
      className={`flex items-center justify-between bg-white/10 backdrop-blur-xl px-4 md:px-8 shadow-md sticky top-0 z-10 transition-all duration-300 isolate ${
        menuOpen ? "rounded-b-none" : "rounded-b-4xl"
      }`}
    >
      {/* Left: Logo + Title */}
      <Link to="/" className="flex items-center no-underline pl-2">
        <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20" />
        <span className="font-bold text-xl md:text-xl tracking-wider text-white">
          {COMPANY_NAME}
        </span>
      </Link>

      {/* Options Icon for Mobile */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 ml-2 mr-4"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-white mb-1 transition-transform duration-300 ${
            menuOpen ? "rotate-45 translate-y-1.5" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-white mb-1 transition-opacity duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        ></span>
      </button>

      {/* Right: Nav Options */}
      <div
        className={`flex-col md:flex-row flex md:flex items-center gap-3 px-6 md:static absolute top-full left-0 w-full md:w-auto md:shadow-none rounded-b-2xl md:rounded-none z-auto pb-6 md:pb-0 bg-inherit backdrop-blur-xl md:backdrop-blur-none md:bg-transparent transition-all duration-300 ease-in-out transform-origin-top isolate ${
          menuOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        } md:opacity-100 md:scale-y-100 md:pointer-events-auto`}
      >
        <Link
          to="/saved"
          className="font-semibold text-base no-underline text-white md:hover:text-blue-300 transition md:py-0 md:px-2 px-5 py-2 w-full md:w-auto md:mt-0 mt-2 text-center rounded-md"
          onClick={() => setMenuOpen(false)}
        >
          Saved Properties
        </Link>

        <Link
          to="/post-property"
          className="relative inline-flex items-center justify-center overflow-hidden font-semibold text-white transition duration-300 ease-out bg-white/20 md:bg-transparent border-black/20 md:hover:border-white/30 border-[1px] md:hover:shadow-xl/15 rounded-md shadow-md group w-full md:w-auto before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full md:hover:before:translate-x-full before:transition-transform before:duration-1000 before:z-10"
          onClick={() => setMenuOpen(false)}
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full md:group-hover:translate-x-0 ease">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-6.101c.02-.03.044-.058.07-.084L12 5.432z" />
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform md:group-hover:translate-x-full ease">
            Post a Property
          </span>
          <span className="relative invisible px-5 py-2">Post a Property</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Desktop: dropdown */}
            <Menu
              as="div"
              className="relative hidden md:inline-block text-left"
            >
              <div>
                <Menu.Button className="relative overflow-hidden group bg-white/20 text-white border border-black/20 rounded-md px-5 py-2 font-semibold text-base transition duration-300 ease-out w-full md:w-auto text-center md:hover:shadow-xl/15 md:hover:border-white/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full md:hover:before:translate-x-full before:transition-transform before:duration-1000">
                  <span className="relative z-10">Dashboard</span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400">
                      Welcome, {user.firstName}
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700 no-underline`}
                          onClick={() => setMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/my-properties"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700 no-underline`}
                          onClick={() => setMenuOpen(false)}
                        >
                          My Properties
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/notifications"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700 no-underline`}
                          onClick={() => setMenuOpen(false)}
                        >
                          Notifications
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="my-1 h-px bg-gray-200" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-red-600`}
                          onClick={() => {
                            onLogout();
                            setMenuOpen(false);
                          }}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            {/* Mobile: full-width Dashboard button that opens slide-over */}
            <button
              type="button"
              className="md:hidden relative overflow-hidden group bg-white/20 text-white border border-black/20 rounded-md px-5 py-2 font-semibold text-base transition duration-300 ease-out w-full text-center hover:shadow-xl/15 hover:border-white/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-1000"
              onClick={() => setDashboardOpen(true)}
            >
              <span className="relative z-10">Dashboard</span>
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="relative overflow-hidden group bg-white/20 text-white border border-black/20 rounded-md px-5 py-2 font-semibold text-base no-underline transition duration-300 ease-out w-full md:w-auto text-center md:hover:shadow-xl/15 md:hover:border-white/30 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:skew-x-[-25deg] before:-translate-x-full md:hover:before:translate-x-full before:transition-transform before:duration-1000"
            onClick={() => setMenuOpen(false)}
          >
            <span className="relative z-10">Login / Sign Up</span>
          </Link>
        )}
      </div>
      {/* Mobile slide-over for Dashboard */}
      {user && (
        <Transition show={dashboardOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-30 md:hidden"
            onClose={setDashboardOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-300"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-xs bg-white shadow-xl">
                      <div className="h-full flex flex-col">
                        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Welcome, {user.firstName}
                          </div>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => setDashboardOpen(false)}
                            aria-label="Close"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          <nav className="p-2 space-y-1">
                            <Link
                              to="/profile"
                              className="block px-4 py-3 text-gray-800 no-underline hover:bg-gray-100 rounded"
                              onClick={() => {
                                setDashboardOpen(false);
                                setMenuOpen(false);
                              }}
                            >
                              Profile
                            </Link>
                            <Link
                              to="/my-properties"
                              className="block px-4 py-3 text-gray-800 no-underline hover:bg-gray-100 rounded"
                              onClick={() => {
                                setDashboardOpen(false);
                                setMenuOpen(false);
                              }}
                            >
                              My Properties
                            </Link>
                            <Link
                              to="/notifications"
                              className="block px-4 py-3 text-gray-800 no-underline hover:bg-gray-100 rounded"
                              onClick={() => {
                                setDashboardOpen(false);
                                setMenuOpen(false);
                              }}
                            >
                              Notifications
                            </Link>
                            <div className="border-t border-gray-200 my-2" />
                            <button
                              type="button"
                              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded"
                              onClick={() => {
                                onLogout();
                                setDashboardOpen(false);
                                setMenuOpen(false);
                              }}
                            >
                              Logout
                            </button>
                          </nav>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </nav>
  );
}
