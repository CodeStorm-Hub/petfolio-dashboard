"use server";

import { createClient } from "@/lib/supabase/server";

function getOrigin() {
  return process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000";
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const origin = getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/callback`,
    },
  });

  if (error) {
    return { error: error.message, needsConfirmation: false };
  }

  const needsConfirmation = !data.session;
  return { error: null, needsConfirmation };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
