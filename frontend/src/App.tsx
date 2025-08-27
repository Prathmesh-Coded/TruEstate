import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import AuthPage from "./components/AuthPage";
import ForgotPassword from "./components/ForgotPassword";
import PropertyLoadingScreen from "./components/PropertyLoadingScreen";
import PostProperty from "./components/PostProperty";
import { motion, AnimatePresence } from "framer-motion";

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
      <AppContent />
    </AuthProvider>
  );
}

export default App;
