// ~/routes/_protected.tsx
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireAuth } from "~/hook/withAuth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  return null;
}

export default function ProtectedLayout() {
  return <Outlet />;
}
