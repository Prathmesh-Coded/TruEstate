import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordStrengthCheckerProps {
  isVisible: boolean;
  isFocused: boolean;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 6 characters long",
    test: (password) => password.length >= 6,
  },
  {
    id: "uppercase",
    label: "Contains uppercase letter (A-Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "Contains lowercase letter (a-z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "Contains at least one number (0-9)",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "Contains special character (!@#$%^&*)",
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export const getPasswordStrength = (password: string) => {
  const passedRequirements = passwordRequirements.filter((req) =>
    req.test(password)
  ).length;

  if (passedRequirements <= 2)
    return {
      level: "weak",
      color: "red",
      ringColor: "focus:ring-red-500 focus:border-red-500",
    };
  if (passedRequirements <= 3)
    return {
      level: "fair",
      color: "yellow",
      ringColor: "focus:ring-yellow-500 focus:border-yellow-500",
    };
  if (passedRequirements <= 4)
    return {
      level: "good",
      color: "blue",
      ringColor: "focus:ring-blue-500 focus:border-blue-500",
    };
  return {
    level: "strong",
    color: "green",
    ringColor: "focus:ring-green-500 focus:border-green-500",
  };
};

export const isPasswordValid = (password: string) => {
  const strength = getPasswordStrength(password);
  return (
    password.length >= 6 &&
    (strength.level === "good" || strength.level === "strong")
  );
};

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({
  isVisible,
  isFocused,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isFocused && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-gray-500 mt-1 flex"
        >
          Use a combination of uppercase, lowercase, numbers, and special
          characters
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default PasswordStrengthChecker;
