import { supabase, useSupabase } from "./supabase";

export async function signUp(email: string, password: string) {
  if (!useSupabase) return null;
  return await supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  if (!useSupabase) return null;
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!useSupabase) return null;
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!useSupabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  if (!useSupabase) return null;
  return await supabase.auth.getSession();
}

export function onAuthStateChange(callback: any) {
  if (!useSupabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

