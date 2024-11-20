import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
}

export function PageHeader({
  title = "Acutis Data Modos",
  subtitle = "Sistema de Gestão de Produtos",
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
      </div>
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-start mb-4">
            <BackButton to="/home" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            {title}
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-[360px] sm:max-w-2xl mx-auto mb-6 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
