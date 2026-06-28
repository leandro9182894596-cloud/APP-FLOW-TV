import { createServerFn } from "@tanstack/react-start";
import { PaymentInfo } from '@/types/payment';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
    const response = await fetch(`${API_BASE_URL}/admin/config`);
    if (!response.ok) {
      throw new Error("Failed to fetch config");
    }
    const config = await response.json();
    // Normalize DNS list if needed
    if (config.dnsList) {
      config.dnsList = config.dnsList.map(normalizeDns).filter(Boolean);
    }
    return config;
  },
);

// Verify the admin password.
export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/admin/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to verify password");
    }
    return response.json();
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
    // Normalize DNS list before sending
    const normalizedData = { ...data };
    if (normalizedData.dnsList) {
      normalizedData.dnsList = normalizedData.dnsList
        .map(normalizeDns)
        .filter(Boolean)
        .slice(0, 5);
    }
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save config");
    }
    return response.json();
  });
