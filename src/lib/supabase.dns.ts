import { supabase, useSupabase } from "./supabase";
import type { DnsConnection } from "./supabase.types";

export async function getDnsConnections(userId: string) {
  if (!useSupabase) return [];
  const { data, error } = await supabase
    .from("dns_connections")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching DNS connections:", error);
    return [];
  }
  return data as DnsConnection[];
}

export async function addDnsConnection(
  userId: string,
  dnsUrl: string,
  username: string,
  password: string
) {
  if (!useSupabase) return null;
  const { data, error } = await supabase
    .from("dns_connections")
    .insert([{ user_id: userId, dns_url: dnsUrl, username, password }])
    .select();

  if (error) {
    console.error("Error adding DNS connection:", error);
    return null;
  }
  return data ? data[0] as DnsConnection : null;
}

export async function updateDnsConnection(
  id: string,
  dnsUrl: string,
  username: string,
  password: string
) {
  if (!useSupabase) return null;
  const { data, error } = await supabase
    .from("dns_connections")
    .update({ dns_url: dnsUrl, username, password })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating DNS connection:", error);
    return null;
  }
  return data ? data[0] as DnsConnection : null;
}

export async function deleteDnsConnection(id: string) {
  if (!useSupabase) return false;
  const { error } = await supabase.from("dns_connections").delete().eq("id", id);
  if (error) {
    console.error("Error deleting DNS connection:", error);
    return false;
  }
  return true;
}
