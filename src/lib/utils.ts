import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(birthDate: string) {
  if (!birthDate) return 0;

  try {
    const birthYear = parseInt(birthDate.substring(0, 4), 10);
    if (isNaN(birthYear)) return 0;

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
    });

    const parts = formatter.formatToParts(new Date());
    const nowYear = parseInt(parts.find((p) => p.type === "year")?.value || "0", 10);

    return Math.max(nowYear - birthYear, 0);
  } catch (error) {
    return 0;
  }
}

export function formatBirthdayDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
