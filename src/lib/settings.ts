import { apiRequest } from "./api";

export interface AppSetting {
  id: string;
  userId: string;
  logo: string | null;
  background: string | null;
  banners: any;
  createdAt: string;
  updatedAt: string;
}

export async function getAppSettings(): Promise<AppSetting> {
  return apiRequest<AppSetting>("/settings");
}

export async function saveAppSettings(
  settings: Partial<AppSetting>
): Promise<AppSetting> {
  return apiRequest<AppSetting>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
