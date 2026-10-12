import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  icon?: ReactNode;
};

const variants = {
  primary: "bg-primary text-on-primary border-primary hover:bg-primary-container hover:border-primary-container",
  secondary: "bg-surface-container-lowest text-primary border-line hover:bg-primary-fixed",
  ghost: "bg-transparent text-primary border-transparent hover:bg-primary-fixed",
};

// md is 44px tall; sm is 36px but grows to 44px on touch (coarse) pointers.
const sizes = { sm: "min-h-9 pointer-coarse:min-h-11 px-3 text-[13px]", md: "min-h-11 px-5 text-sm" };

export function Button({ variant = "primary", size = "md", icon, className = "", children, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-w-11 items-center justify-center gap-2 rounded-full border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
