import { redirect } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { getUserId } from "~/services/session.server";

export async function requireAuth(request: Request) {
  const userId = await getUserId(request);

  if (!userId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw redirect("/login");
    }

    return session.user;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw redirect("/login");
  }

  return user;
}
