"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://citqctlsrlbdhhodxaym.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdHFjdGxzcmxiZGhob2R4YXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTExNjIsImV4cCI6MjA5NjcyNzE2Mn0.Ucw6iNDlDCCf6dM7aJQieK9KMNVVw8jilCMMz9DI0nc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function initAnalytics() {
  return null;
}
