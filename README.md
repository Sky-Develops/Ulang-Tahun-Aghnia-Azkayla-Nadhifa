# Kayla's 2nd Birthday Website

Website ulang tahun interaktif bertema Baby Shark + ocean untuk Aghnia Azkayla Nadhifa.

## Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- Supabase Auth, Database, Realtime, Storage
- Framer Motion, React Confetti, React Photo View

## Jalankan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Supabase

Konfigurasi public Supabase disiapkan di `src/lib/supabase.ts` dan `.env.example`.
Untuk production, isi environment variables di Vercel dari `.env.example`.

Aktifkan di Supabase Dashboard:

- Authentication: Email/Password untuk admin
- Database table sesuai `supabase-schema.sql`
- Storage bucket `media`

## Routes

- `/` registrasi tamu
- `/home` dashboard pesta, galeri, ucapan, musik
- `/admin` panel admin Supabase email/password

## Deploy

Deploy termudah memakai Vercel:

```bash
npm run build
```

Lalu hubungkan repository GitHub ke Vercel dan isi environment variables.
