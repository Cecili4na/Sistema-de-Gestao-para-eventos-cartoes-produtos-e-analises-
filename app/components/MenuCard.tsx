import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

interface CardClicavelProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
  textColor?: string;
}

export function MenuCard({
  to,
  icon,
  title,
  description,
  iconBgColor = "bg-indigo-100",
  iconColor = "text-indigo-600",
  textColor = "text-indigo-600",
}: CardClicavelProps) {
  return (
    <Link
      to={to}
      prefetch="intent"
      className="block bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[120px] touch-manipulation"
    >
      <div className="flex gap-4 sm:block">
        <div
          className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 ${iconBgColor} rounded-lg sm:rounded-xl sm:mb-6 shrink-0`}
        >
          <div
            className={`w-6 h-6 flex items-center justify-center ${iconColor}`}
          >
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-6">
            {description}
          </p>
          <div
            className={`inline-flex items-center ${textColor} text-sm sm:text-base group`}
          >
            Acessar
            <svg
              className="ml-2 w-4 h-4 transform transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
