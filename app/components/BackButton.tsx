import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

interface BackButtonProps {
  to: string;
  children?: ReactNode;
  className?: string;
}

export function BackButton({
  to,
  children = "Voltar",
  className = "",
}: BackButtonProps) {
  return (
    <div className="mb-8">
      <Link
        to={to}
        prefetch="intent"
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {children}
      </Link>
    </div>
  );
}
