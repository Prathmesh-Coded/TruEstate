import React from "react";

// Button variants for different use-cases
const VARIANT_CLASSES = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-md",
  secondary:
    "bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-md",
  outline:
    "bg-transparent hover:bg-blue-50 text-blue-700 border border-blue-600",
  ghost:
    "bg-transparent hover:text-blue-300 text-white border border-transparent",
  danger:
    "bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-md",
};

// Custom Button Sizes
const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2 text-base rounded-lg",
  lg: "px-7 py-3 text-lg rounded-xl",
  full: "w-full px-5 py-2 text-base rounded-lg",
};

export type ButtonProps = {
  /**
   * Button content (text, icon, etc.)
   */
  children: React.ReactNode;
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: keyof typeof VARIANT_CLASSES;
  /**
   * Button size
   * @default 'md'
   */
  size?: keyof typeof SIZE_CLASSES;
  /**
   * Show loading spinner and disable button
   */
  loading?: boolean;
  /**
   * Disable the button
   */
  disabled?: boolean;
  /**
   * Custom className for extra styling
   */
  className?: string;
  /**
   * Button type (button, submit, reset)
   * @default 'button'
   */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /**
   * Click handler
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Render as another element (e.g., 'a', Link, etc.)
   */
  as?: React.ElementType;
  /**
   * Props for the rendered element
   */
  [key: string]: any;
};

const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      className = "",
      type = "button",
      onClick,
      as: Component = "button",
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variantKey = variant as keyof typeof VARIANT_CLASSES;
    const sizeKey = size as keyof typeof SIZE_CLASSES;

    const classes = [
      "inline-flex items-center justify-center font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
      VARIANT_CLASSES[variantKey],
      SIZE_CLASSES[sizeKey],
      isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      loading ? "gap-2" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Component
        ref={ref as any}
        className={classes}
        type={Component === "button" ? type : undefined}
        disabled={Component === "button" ? isDisabled : undefined}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        {...rest}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        <span>{children}</span>
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;
