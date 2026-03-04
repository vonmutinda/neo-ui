This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Customer vs admin (ports in dev)

Locally you run two dev servers:

- **Customer UI**: `npm run dev` → [http://localhost:3000](http://localhost:3000) (dashboard, auth, send, etc.)
- **Admin UI**: `npm run dev:admin` → [http://localhost:3001](http://localhost:3001) (admin dashboard, staff, etc.)

They use different build dirs (`.next` vs `.next-admin`) so both can run at once without overwriting each other. In **production** it’s one app: a single build serves both customer routes (`/`, `/dashboard`, …) and admin routes (`/admin`, `/admin/…`) on **one port**.

## Deploy on Railway

### Option A: One service (recommended)

One Railway service runs the root **Dockerfile** (Next.js standalone). That single deployment serves both customer and admin on the same URL, e.g.:

- `https://neo-ui.up.railway.app/` → customer
- `https://neo-ui.up.railway.app/admin` → admin

Use **railway.toml** as-is (Dockerfile at root, healthcheck `/`). Railway sets `PORT`; the app listens on that port.

**Env:**

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_API_URL` | API base URL (e.g. `https://neo-api.up.railway.app`). Set in Railway so the UI talks to your API. |

### Option B: Two services (customer + admin on different URLs)

If you want separate URLs or scaling (e.g. `app.neo.et` and `admin.neo.et`):

1. **Customer**: One Railway service, root **Dockerfile** (same as Option A).
2. **Admin**: Second Railway service, set **Dockerfile path** to **`Dockerfile.admin`** in that service’s build settings. It builds with `ADMIN_DEV=1` and runs the admin app; Railway’s `PORT` is used.

Each service gets its own domain and `NEXT_PUBLIC_API_URL` if needed.

**Before first push:** Ensure **src/** and all app code are committed. Add a public domain per service if you need HTTPS. See `.env.example` for local reference.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
