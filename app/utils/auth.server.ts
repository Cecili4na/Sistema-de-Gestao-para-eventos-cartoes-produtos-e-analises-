import { redirect } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { getUserId } from "~/services/session.server";

export async function requireAuth(request: Request) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw redirect("/login");
      }

      throw redirect("/login");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.id !== userId) {
      throw redirect("/login");
    }

    return user;
  } catch (error) {
    throw redirect("/login");
  }
}
