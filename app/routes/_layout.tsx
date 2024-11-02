// app/routes/_layout.tsx
import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
}
