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

The app is deployed on Railway using the **native Railpack build** (no Docker), same approach as micro-ui. Railway detects Next.js, runs `npm install`, `npm run build`, and `next start`; it sets `PORT` automatically. Use **railway.toml** as-is (builder = RAILPACK, healthcheck `/`).

One deployment serves both customer and admin on the same URL, e.g.:

- `https://neo-ui.up.railway.app/` → customer
- `https://neo-ui.up.railway.app/admin` → admin

**Connect UI to API:** In the **neo-ui** Railway service, set `NEXT_PUBLIC_API_URL` to your **neo-api** service's public URL (e.g. from neo-api Settings → Domains, or `https://neo-api-production-xxxx.up.railway.app`). Redeploy neo-ui after setting so the value is baked into the build. The API allows all origins by default (CORS).

**Env:**

| Variable              | Description                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL (e.g. your neo-api Railway URL). Required for the UI to call the API. |

**Before first push:** Ensure **src/** and all app code are committed. Add a public domain if you need HTTPS. See `.env.example` for local reference.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
