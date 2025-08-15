/**
 * Email validation utility
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Password validation utility
 * @param password - Password string to validate
 * @returns boolean indicating if password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 6 && password.length <= 128;
};

/**
 * Name validation utility
 * @param name - Name string to validate
 * @returns boolean indicating if name is valid
 */
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== "string") return false;
  return name.trim().length >= 1 && name.length <= 100;
};

/**
 * Normalize email by converting to lowercase and trimming
 * @param email - Email to normalize
 * @returns normalized email string
 */
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * First name validation utility
 * @param firstName - First name string to validate
 * @returns boolean indicating if first name is valid
 */
export const validateFirstName = (firstName: string): boolean => {
  if (!firstName || typeof firstName !== "string") return false;
  return firstName.trim().length >= 1 && firstName.length <= 50;
};

/**
 * Last name validation utility
 * @param lastName - Last name string to validate
 * @returns boolean indicating if last name is valid
 */
export const validateLastName = (lastName: string): boolean => {
  if (!lastName || typeof lastName !== "string") return false;
  return lastName.trim().length >= 1 && lastName.length <= 50;
};

/**
 * Sanitize user input by trimming whitespace
 * @param input - Input string to sanitize
 * @returns sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim();
};
