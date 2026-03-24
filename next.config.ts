import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Allow API URL in CSP connect-src (e.g. Railway enviar-api URL when UI is deployed)
// Normalize common typo "htts" -> "https" so CSP and connections work
function normalizeApiUrl(url: string): string {
  return url.replace(/^htts:\/\//i, "https://");
}
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const apiUrl = normalizeApiUrl(rawApiUrl);
const storageSrc =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:9000";
const connectSrc = [
  "'self'",
  "http://localhost:8080",
  "https://api.enviar.et",
  "https://unpkg.com",
  storageSrc,
];
if (apiUrl && !apiUrl.includes("localhost")) {
  connectSrc.push(apiUrl);
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://unpkg.com https://*.openstreetmap.org",
      "font-src 'self'",
      `connect-src ${connectSrc.join(" ")}`,
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  distDir: process.env.ADMIN_DEV ? ".next-admin" : ".next",
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  },
  images: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
