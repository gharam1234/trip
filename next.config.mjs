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
  // Ant Design CSS-in-JS HMR 오류 해결
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
  webpack: (config, { isServer }) => {
    // Ant Design의 CSS-in-JS 라이브러리 HMR 충돌 해결
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    'rc-util',
    'rc-pagination',
    'rc-picker',
  ],
};

export default nextConfig;
