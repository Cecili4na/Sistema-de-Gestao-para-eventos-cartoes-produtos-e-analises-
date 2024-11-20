export function FormCard({
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
