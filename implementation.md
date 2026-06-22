# Secure Admin Dashboard Implementation

## Objective

Separate the public birthday website from the admin dashboard and secure the dashboard so that only authorized owners can access it.

---

# Architecture

Public Website

```
https://ulang-tahun-aghnia-azkayla-nadhifa-fawn.vercel.app
```

Admin Dashboard

```
https://dashboard-ulangtahun.vercel.app
```

Authentication Provider

```
Supabase Auth
```

Login Method

```
Google OAuth only
```

Authorization

```
role = admin
```

Additional Security

* Next.js Middleware
* Protected Server Components
* Supabase Row Level Security
* No password form
* No anonymous access

---

# Phase 1 : Remove Password-Based Admin Login

Current:

```
/admin
↓
Enter password
↓
Dashboard
```

Target:

```
Login with Google
↓
Supabase session
↓
Check role=admin
↓
Dashboard
```

Delete:

* Password input page
* Local password validation
* Hardcoded password
* SessionStorage authentication

---

# Phase 2 : Enable Google OAuth

Configure Google Provider inside Supabase Authentication.

Allow only authenticated users.

Disable anonymous users.

No email/password login required.

---

# Phase 3 : Create profiles table

Create:

```sql
create table profiles (
    id uuid primary key references auth.users(id),
    email text unique,
    role text default 'user'
);
```

Example data:

| email                                     | role  |
| ----------------------------------------- | ----- |
| [tegar@gmail.com](mailto:tegar@gmail.com) | admin |
| [wife@gmail.com](mailto:wife@gmail.com)   | admin |

Only users with role='admin' may access dashboard.

---

# Phase 4 : Admin Authorization

After login:

1. Get current user.
2. Query profiles table.
3. Verify role.

Pseudo:

```ts
if (profile.role !== 'admin') {
    redirect('/');
}
```

Unauthorized users must never reach dashboard pages.

---

# Phase 5 : Protect All Dashboard Routes

Protect:

```
/dashboard
/dashboard/gallery
/dashboard/messages
/dashboard/music
/dashboard/settings
```

Middleware should:

1. Read Supabase session.
2. Redirect unauthenticated users.
3. Redirect non-admin users.

Example:

```ts
matcher: [
'/dashboard/:path*'
]
```

---

# Phase 6 : Server-Side Protection

Never trust client-side checks.

Every server component must:

1. Read current session.
2. Read profile role.
3. Verify role='admin'.

Reject unauthorized access immediately.

---

# Phase 7 : Enable RLS

Enable Row Level Security on all editable tables.

Example:

gallery
messages
music
guestbook
settings

Policy:

```sql
role = 'admin'
```

Only admins may:

* insert
* update
* delete

Visitors only have read access where required.

---

# Phase 8 : Separate Deployments

Public Site:

```
birthday.vercel.app
```

Admin Dashboard:

```
dashboard-ulangtahun.vercel.app
```

Different Vercel projects.

Shared Supabase database.

Benefits:

* Better isolation
* Easier security management
* Independent deployments
* Reduced attack surface

---

# Phase 9 : Optional Additional Security

Enable Google 2-Step Verification.

Recommended:

Authenticator App

This protects admin access even if email credentials leak.

---

# Folder Structure

app

```
app
│
├── login
│
├── dashboard
│   ├── gallery
│   ├── messages
│   ├── music
│   ├── settings
│
├── middleware.ts
│
lib
│
├── supabase
│
├── auth
│
components
```

---

# Final Flow

User opens:

```
dashboard-ulangtahun.vercel.app
```

↓

Login with Google

↓

Supabase Session

↓

Fetch profile

↓

role == admin ?

YES

↓

Dashboard

NO

↓

Redirect to home

---

# Success Criteria

✅ No password form.

✅ Google OAuth only.

✅ Role-based access.

✅ Middleware protection.

✅ Server-side validation.

✅ RLS enabled.

✅ Separate admin deployment.

✅ Shared database.

✅ Production-ready security.
