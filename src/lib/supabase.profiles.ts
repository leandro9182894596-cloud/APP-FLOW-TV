import { supabase } from "./supabase";
import type { Profile } from "./supabase.types";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  profile: Partial<Profile>
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profile })
    .select();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }
  return data ? data[0] as Profile : null;
}
