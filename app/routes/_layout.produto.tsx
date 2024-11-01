// app/routes/_layout.produto.tsx
import { Outlet } from "@remix-run/react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
}

export function PageHeader({
  title = "Acutis Data Modos",
  subtitle = "Sistema de Gestão de Produtos",
}: PageHeaderProps) {
  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
        {title}
      </h1>
      <p className="text-gray-600 text-lg">{subtitle}</p>
    </header>
  );
}

export function Card({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
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

export default function ProdutoLayout() {
  return (
    <div className="max-w-7xl mx-auto">
      <Outlet />
    </div>
  );
}
