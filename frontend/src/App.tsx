import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Header from "./components/Header";
import AuthPage from "./components/AuthPage";
import ForgotPassword from "./components/ForgotPassword";
import PropertyLoadingScreen from "./components/PropertyLoadingScreen";
import PostProperty from "./components/PostProperty";
import { motion, AnimatePresence } from "framer-motion";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminVerification from "./components/AdminVerification";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminUsers from "./components/admin/AdminUsers";
import AdminSettings from "./components/admin/AdminSettings";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardNotifications from "./components/dashboard/DashboardNotifications";
import DashboardProfile from "./components/dashboard/DashboardProfile";
import DashboardProperties from "./components/dashboard/DashboardProperties";
import DashboardSettings from "./components/dashboard/DashboardSettings";

function HomePage() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      {user ? (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {user.firstName?.trim() || "User"}!
          </h1>
          <p className="text-gray-600">
            You are logged in to TruEstate. Explore properties and find your
            dream home.
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to TruEstate
          </h1>
          <p className="text-gray-600">
            Discover your perfect home. Browse properties, save favorites, and
            connect with real estate professionals.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/post-property" element={<PostProperty />} />
        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="properties" element={<DashboardProperties />} />
          <Route path="notifications" element={<DashboardNotifications />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
        {/* Admin public route: login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminVerification />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route
          path="/"
          element={
            <div>
              <Header />
              <HomePage />
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <PropertyLoadingScreen />;
  }

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        {/* ToastContainer disabled - no floating notifications */}
        {/* <ToastContainer /> */}
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
