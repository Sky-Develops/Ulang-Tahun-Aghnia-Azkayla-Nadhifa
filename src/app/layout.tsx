import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "react-photo-view/dist/react-photo-view.css";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kayla's 2nd Birthday",
  description: "Website ulang tahun interaktif Kayla dengan tema Baby Shark dan ocean.",
};

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
