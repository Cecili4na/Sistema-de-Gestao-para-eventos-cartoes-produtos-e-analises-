import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

interface ActionCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconHoverBgColor?: string;
  iconColor?: string;
}

export function ActionCard({
  to,
  icon,
  title,
  description,
  iconBgColor = "bg-blue-100",
  iconHoverBgColor = "group-hover:bg-blue-200",
  iconColor = "text-blue-600",
}: ActionCardProps) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="p-6">
        <div
          className={`w-12 h-12 ${iconBgColor} rounded-lg mb-4 flex items-center justify-center ${iconHoverBgColor} transition-colors`}
        >
          <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
