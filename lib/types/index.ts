export interface TreeEntry {
  id: string;
  user_id: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
  notes?: string;
  user?: {
    email?: string;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

