"use client";

import { defaultProfile, defaultSettings, sampleGallery, sampleWishes } from "@/constants/site";
import { supabase } from "@/lib/supabase";
import type { GalleryItem, Guest, Profile, SiteSettings, Wish } from "@/types";

function mapProfile(row: any): Profile {
  return {
    ...defaultProfile,
    name: row?.name ?? defaultProfile.name,
    age: row?.age ?? defaultProfile.age,
    birthDate: row?.birth_date ?? defaultProfile.birthDate,
    city: row?.city ?? defaultProfile.city,
    bio: row?.bio ?? defaultProfile.bio,
    photoUrl: row?.photo_url ?? undefined,
  };
}

function mapSettings(row: any): SiteSettings {
  return {
    ...defaultSettings,
    websiteTitle: row?.website_title ?? defaultSettings.websiteTitle,
    musicUrl: row?.music_url ?? defaultSettings.musicUrl,
    theme: "ocean",
    formsEnabled: row?.forms_enabled ?? defaultSettings.formsEnabled,
  };
}

function mapGallery(row: any): GalleryItem {
  return {
    id: row.id,
    type: row.type,
    url: row.url,
    title: row.title,
    order: row.order_index ?? 0,
    createdAt: row.created_at,
  };
}

function mapWish(row: any): Wish {
  return {
    id: row.id,
    name: row.name ?? undefined,
    message: row.message,
    approved: Boolean(row.approved),
    pinned: Boolean(row.pinned),
    createdAt: row.created_at,
  };
}

function mapGuest(row: any): Guest {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    relation: row.relation,
    createdAt: row.created_at,
  };
}

export function listenProfile(callback: (profile: Profile) => void) {
  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", "main").maybeSingle();
    callback(data ? mapProfile(data) : defaultProfile);
  };
  load();

  const channel = supabase
    .channel("profiles-main")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: "id=eq.main" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function listenSettings(callback: (settings: SiteSettings) => void) {
  const load = async () => {
    const { data } = await supabase.from("settings").select("*").eq("id", "main").maybeSingle();
    callback(data ? mapSettings(data) : defaultSettings);
  };
  load();

  const channel = supabase
    .channel("settings-main")
    .on("postgres_changes", { event: "*", schema: "public", table: "settings", filter: "id=eq.main" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function listenGallery(callback: (items: GalleryItem[]) => void) {
  const load = async () => {
    const { data } = await supabase.from("gallery").select("*").order("order_index", { ascending: true });
    const items = data?.map(mapGallery) ?? [];
    callback(items.length ? items : sampleGallery);
  };
  load();

  const channel = supabase
    .channel("gallery")
    .on("postgres_changes", { event: "*", schema: "public", table: "gallery" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function listenWishes(callback: (items: Wish[]) => void, includePending = false) {
  const load = async () => {
    let query = supabase.from("wishes").select("*").order("created_at", { ascending: false });
    if (!includePending) query = query.eq("approved", true);
    const { data } = await query;
    const items = data?.map(mapWish) ?? [];
    callback(items.length ? items : sampleWishes);
  };
  load();

  const channel = supabase
    .channel(includePending ? "wishes-admin" : "wishes-public")
    .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function listenGuests(callback: (items: Guest[]) => void) {
  const load = async () => {
    const { data } = await supabase.from("guests").select("*").order("created_at", { ascending: false });
    callback(data?.map(mapGuest) ?? []);
  };
  load();

  const channel = supabase
    .channel("guests")
    .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createGuest(data: Omit<Guest, "id" | "createdAt">) {
  const { error } = await supabase.from("guests").insert(data);
  if (error) throw error;
}

export async function createWish(data: Required<Pick<Wish, "name" | "message">>) {
  const { error } = await supabase.from("wishes").insert({
    name: data.name,
    message: data.message,
    approved: true,
    pinned: false,
  });
  if (error) throw error;
}

export async function saveProfile(profile: Profile) {
  const { error } = await supabase.from("profiles").upsert({
    id: "main",
    name: profile.name,
    age: profile.age,
    birth_date: profile.birthDate,
    city: profile.city,
    bio: profile.bio,
    photo_url: profile.photoUrl ?? null,
  });
  if (error) throw error;
}

export async function saveSettings(settings: Partial<SiteSettings>) {
  const { data: current } = await supabase.from("settings").select("*").eq("id", "main").maybeSingle();
  const merged = mapSettings(current);
  const next = { ...merged, ...settings };
  const { error } = await supabase.from("settings").upsert({
    id: "main",
    website_title: next.websiteTitle,
    music_url: next.musicUrl,
    theme: "ocean",
    forms_enabled: next.formsEnabled,
  });
  if (error) throw error;
}

export async function createGalleryItem(item: Omit<GalleryItem, "id" | "createdAt">) {
  const { error } = await supabase.from("gallery").insert({
    type: item.type,
    url: item.url,
    title: item.title,
    order_index: item.order,
  });
  if (error) throw error;
}

export async function updateWish(id: string, data: Partial<Wish>) {
  const payload: Record<string, unknown> = {};
  if (typeof data.approved === "boolean") payload.approved = data.approved;
  if (typeof data.pinned === "boolean") payload.pinned = data.pinned;
  if (typeof data.message === "string") payload.message = data.message;
  if (typeof data.name === "string") payload.name = data.name;

  const { error } = await supabase.from("wishes").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteWish(id: string) {
  const { error } = await supabase.from("wishes").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteGalleryItem(id: string) {
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}
