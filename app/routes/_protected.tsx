// app/routes/protected.tsx
import { json, type LoaderFunction } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

export const loader: LoaderFunction = async () => {
  await requireAuth();
  return json({ ok: true });
};