import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // don't bundle the package
  serverExternalPackages: ['@google-cloud/datastore'],
};

export default nextConfig;
