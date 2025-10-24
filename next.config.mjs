/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // 빌드 시 ESLint 오류로 빌드가 중단되지 않도록 설정
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 환경에서 타입 오류로 빌드가 중단되지 않도록 설정
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
