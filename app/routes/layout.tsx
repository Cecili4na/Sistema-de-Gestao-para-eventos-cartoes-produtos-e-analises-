// app/components/Layout.tsx
import { Link } from "@remix-run/react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
}

export default function Layout({
  children,
  title = "Acutis Data Modos",
  subtitle = "Sistema de Gestão de Produtos",
  showBackButton = false,
  maxWidth = "7xl",
}: LayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </header>

        {/* Botão Voltar */}
        {showBackButton && (
          <div className="mb-8">
            <Link
              to="/produto"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              Voltar
            </Link>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

// Componente de Card para seções
interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Card({ children, title, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}
    >
      {title && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}
