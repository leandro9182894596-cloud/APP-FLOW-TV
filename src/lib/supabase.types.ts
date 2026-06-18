export interface DnsConnection {
  id: string;
  user_id: string;
  dns_url: string;
  username: string;
  password: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_type: "live" | "movie" | "series";
  content_id: number;
  title: string;
  poster: string;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_type: "movie" | "series";
  content_id: number;
  episode_id?: string;
  title: string;
  poster: string;
  position: number;
  duration: number;
  updated_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AppSetting {
  id: string;
  user_id: string;
  logo?: string;
  background?: string;
  banners?: any[];
  created_at: string;
}

export interface IptvCache {
  id: string;
  user_id: string;
  content_type: "live" | "movie" | "series";
  data: any;
  updated_at: string;
}
