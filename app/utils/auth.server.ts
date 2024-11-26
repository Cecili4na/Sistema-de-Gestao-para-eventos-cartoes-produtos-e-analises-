import { redirect } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { getUserId, createUserSession } from "~/services/session.server";

export async function requireAuth(request: Request) {
  try {
    const userId = await getUserId(request);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw redirect("/login");

    if (!userId && session?.user) {
      throw await createUserSession(session.user.id, "/home");
    }

    if (!userId && !session?.user) {
      throw redirect("/login");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || (userId && user.id !== userId)) {
      throw redirect("/login");
    }

    return user;
  } catch (error) {
    if (error instanceof Response) throw error;
    throw redirect("/login");
  }
}