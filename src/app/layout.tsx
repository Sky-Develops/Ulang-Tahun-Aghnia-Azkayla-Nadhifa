import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter } from "next/font/google";

import "./globals.css";
import { createClient } from "@supabase/supabase-js";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data } = await supabase.from("settings").select("icon_url").eq("id", "main").maybeSingle();
  const iconUrl = data?.icon_url || "/favicon.ico";

  return {
    title: "Kayla's 2nd Birthday",
    description: "Website ulang tahun interaktif Kayla dengan tema Baby Shark dan ocean.",
    icons: {
      icon: iconUrl,
      apple: iconUrl,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#091D5C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${baloo.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}