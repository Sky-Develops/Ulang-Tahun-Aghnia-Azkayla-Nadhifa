export type GalleryType = "photo" | "video";

export interface Profile {
  name: string;
  age: number;
  birthDate: string;
  displayDate?: string;
  city: string;
  bio: string;
  photoUrl?: string;
}

export interface Guest {
  id: string;
  name: string;
  city: string;
  relation: string;
  createdAt?: string;
}

export interface Wish {
  id: string;
  name?: string;
  message: string;
  approved: boolean;
  pinned: boolean;
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  type: GalleryType;
  url: string;
  title: string;
  order: number;
  createdAt?: string;
}

export interface SiteSettings {
  websiteTitle: string;
  musicUrl: string;
  theme: "ocean";
  formsEnabled: boolean;
  iconUrl?: string;
}