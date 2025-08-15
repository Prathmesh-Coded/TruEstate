import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

interface AuthProps {
  onAuthSuccess: (user: { email: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthSuccess = (user: { email: string }) => {
    onAuthSuccess(user);
  };

  return (
    <div>
      {isLogin ? (
        <Login
          onSwitchToSignup={handleSwitchToSignup}
          onLoginSuccess={handleAuthSuccess}
        />
      ) : (
        <Signup
          onSwitchToLogin={handleSwitchToLogin}
          onSignupSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default Auth;
