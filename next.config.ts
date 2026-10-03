import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./src/lib/image-hosts";

const nextConfig: NextConfig = {
  images: {
    // Hosts listed here go through the optimiser. Everything else still
    // renders — <SafeImage> serves it unoptimised rather than throwing.
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
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
