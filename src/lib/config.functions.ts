import { createServerFn } from "@tanstack/react-start";
import { PaymentInfo } from '@/types/payment';

export interface PublicConfig {
  logo: string | null;
  background: string | null;
  banner: string | null;
  bannerLink: string | null;
  banners: Array<{ image: string; link?: string }> | null;
  dnsList: string[];
  paymentInfo: PaymentInfo | null;
  paymentStatus: string | null;
}

function normalizeDns(input: string): string {
  let v = input.trim().replace(/\/+$/, "");
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "http://" + v;
  return v;
}

// Public read — never returns the admin password.
export const getConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicConfig> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("app_config")
      .select("logo, background, banner, banner_link, banners, dns_list, payment_info, payment_status")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      logo: data?.logo ?? null,
      background: data?.background ?? null,
      banner: data?.banner ?? null,
      bannerLink: data?.banner_link ?? null,
      banners: Array.isArray(data?.banners) ? (data!.banners as Array<{ image: string; link?: string }>) : null,
      dnsList: Array.isArray(data?.dns_list) ? (data!.dns_list as string[]) : [],
      paymentInfo: (data?.payment_info as PaymentInfo) || null,
      paymentStatus: data?.payment_status ?? null,
    };
  },
);

// Verify the admin password.
export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    console.log("[verifyAdmin] Starting verification...");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    console.log("[verifyAdmin] Got supabaseAdmin client");
    const { data: row, error } = await supabaseAdmin
      .from("app_config")
      .select("admin_password")
      .eq("id", 1)
      .maybeSingle();
    console.log("[verifyAdmin] Query result:", { row, error });
    if (error) {
      console.error("[verifyAdmin] Query error:", error);
      throw new Error(error.message);
    }
    const ok = !!row && row.admin_password === data.password;
    console.log("[verifyAdmin] Verification result:", { ok, receivedPassword: data.password, storedPassword: row?.admin_password });
    return { ok };
  });

interface SavePayload {
  password: string;
  logo?: string | null;
  background?: string | null;
  banner?: string | null;
  bannerLink?: string | null;
  banners?: Array<{ image: string; link?: string }> | null;
  dnsList?: string[];
  paymentInfo?: PaymentInfo | null;
  paymentStatus?: string | null;
  newPassword?: string;
}

// Save global settings — requires the current admin password.
export const saveConfig = createServerFn({ method: "POST" })
  .inputValidator((data: SavePayload) => data)
  .handler(async ({ data }): Promise<PublicConfig> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: readErr } = await supabaseAdmin
      .from("app_config")
      .select("admin_password")
      .eq("id", 1)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!row || row.admin_password !== data.password) {
      throw new Error("Senha de administrador incorreta.");
    }

    const update: {
    updated_at: string;
    logo?: string | null;
    background?: string | null;
    banner?: string | null;
    banner_link?: string | null;
    banners?: Array<{ image: string; link?: string }> | null;
    dns_list?: string[];
    payment_info?: PaymentInfo | null;
    payment_status?: string | null;
    admin_password?: string;
  } = { updated_at: new Date().toISOString() };
  if (data.logo !== undefined) update.logo = data.logo;
  if (data.background !== undefined) update.background = data.background;
  if (data.banner !== undefined) update.banner = data.banner;
  if (data.bannerLink !== undefined) update.banner_link = data.bannerLink || null;
  if (data.banners !== undefined) update.banners = data.banners;
  if (data.dnsList !== undefined) {
    update.dns_list = data.dnsList.map(normalizeDns).filter(Boolean).slice(0, 5);
  }
  if (data.paymentInfo !== undefined) update.payment_info = data.paymentInfo;
  if (data.paymentStatus !== undefined) update.payment_status = data.paymentStatus;
  if (data.newPassword && data.newPassword.trim()) {
    update.admin_password = data.newPassword.trim();
  }

    const { data: updated, error } = await supabaseAdmin
      .from("app_config")
      .update(update)
      .eq("id", 1)
      .select("logo, background, banner, banner_link, banners, dns_list")
      .single();
    if (error) throw new Error(error.message);

    return {
      logo: updated.logo ?? null,
      background: updated.background ?? null,
      banner: updated.banner ?? null,
      bannerLink: updated.banner_link ?? null,
      banners: Array.isArray(updated.banners) ? (updated.banners as Array<{ image: string; link?: string }>) : null,
      dnsList: Array.isArray(updated.dns_list) ? (updated.dns_list as string[]) : [],
    };
  });
