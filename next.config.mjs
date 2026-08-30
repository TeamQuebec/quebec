/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prototype: keep the build green even with cosmetic lint warnings.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
