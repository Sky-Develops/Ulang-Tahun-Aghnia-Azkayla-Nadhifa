import type { GalleryItem, Profile, SiteSettings, Wish } from "@/types";

export const defaultProfile: Profile = {
  name: "Aghnia Azkayla Nadhifa",
  age: 2,
  birthDate: "2023-06-29",

  city: "Surabaya, Indonesia",
  bio: "Doa dari kalian yang aku tunggu..",
};

export const defaultSettings: SiteSettings = {
  websiteTitle: "Aghnia Azkayla Nadhifa's 2nd Birthday",
  musicUrl: "/audio/baby-shark.mp3",
  theme: "ocean",
  formsEnabled: true,
  iconUrl: "",
};

export const sampleWishes: Wish[] = [
  {
    id: "sample-1",
    name: "Keluarga Kayla",
    message: "Selamat ulang tahun Kayla sayang!",
    approved: true,
    pinned: true,
  },
  {
    id: "sample-2",
    name: "Budi Santoso",
    message: "Happy birthday! Semoga selalu sehat dan ceria.",
    approved: true,
    pinned: false,
  },
  {
    id: "sample-3",
    name: "Tante Rani",
    message: "Kayla makin besar, makin lucu!",
    approved: true,
    pinned: false,
  },
];

export const sampleGallery: GalleryItem[] = Array.from({ length: 15 }, (_, index) => ({
  id: `sample-gallery-${index + 1}`,
  type: index % 5 === 2 ? "video" : "photo",
  title: index % 5 === 2 ? `Video ${index + 1}` : `Foto ${index + 1}`,
  url: "",
  order: index,
}));

export const seaFriends = ["🐟", "🐠", "🐡", "🐙", "🪼", "🦀", "🐚", "🌊"];