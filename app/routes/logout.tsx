// app/routes/logout.tsx
import { ActionFunction } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { destroySession } from "~/services/session.server";

export const action: ActionFunction = async ({ request }) => {
  await supabase.auth.signOut();
  return destroySession(request);
};