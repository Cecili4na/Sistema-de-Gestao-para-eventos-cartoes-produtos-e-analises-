/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";

export async function requireAuth(request: Request) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect("/login");
    }

    return user;
  } catch (error) {
    throw redirect("/login");
  }
}
