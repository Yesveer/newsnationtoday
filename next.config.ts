import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  // Sign-in and invite moved to the root. Keep the old portal URLs working.
  async redirects() {
    return [
      { source: "/admin/login", destination: "/login", permanent: false },
      { source: "/admin/invite", destination: "/invite", permanent: false },
    ];
  },
};

export default nextConfig;
