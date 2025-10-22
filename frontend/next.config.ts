import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // images: {
  //   domains: ['localhost', '127.0.0.1'],
  //   unoptimized: true,  
  //   disableStaticImages: true,  
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: '**',
  //     },
  //   ],
  //   dangerouslyAllowSVG: true,
  //   contentDispositionType: 'attachment',
  //   contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  //   minimumCacheTTL: 60,
  //   formats: ['image/avif', 'image/webp'],
  // },  
  // experimental: {
  //   turbo: {
  //     resolveAlias: {
  //       '@': path.resolve(__dirname, 'src'),
  //     },
  //   },
  //   serverActions: {
  //     bodySizeLimit: '10mb',
  //   },
  //   serverComponentsExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken', 'cors', 'cookie-parser', 'helmet', 'express-rate-limit', 'joi', 'dotenv'],
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },  
  // typescript: {
  //   ignoreBuildErrors: true,
  // },  
  // webpack: (config) => {
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     'mongoose': path.resolve(__dirname, 'node_modules/mongoose'),
  //     'bcryptjs': path.resolve(__dirname, 'node_modules/bcryptjs'),
  //     'jsonwebtoken': path.resolve(__dirname, 'node_modules/jsonwebtoken'),
  //     'cors': path.resolve(__dirname, 'node_modules/cors'),
  //     'cookie-parser': path.resolve(__dirname, 'node_modules/cookie-parser'),
  //     'helmet': path.resolve(__dirname, 'node_modules/helmet'),
  //     'express-rate-limit': path.resolve(__dirname, 'node_modules/express-rate-limit'),
  //     'joi': path.resolve(__dirname, 'node_modules/joi'),
  //     'dotenv': path.resolve(__dirname, 'node_modules/dotenv'),
  //     '@': path.resolve(__dirname, 'src'),
  //   };
  //   return config;
  // },  
  /* config options here */
};

export default nextConfig;
