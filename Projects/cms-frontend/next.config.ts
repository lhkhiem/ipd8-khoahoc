import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3011';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  typescript: {
    // ⚠️ Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  
  // Security Headers - Content Security Policy (CSP)
  // Mục đích: Đảm bảo frontend có CSP headers nhất quán với backend, bảo vệ khỏi XSS và các tấn công khác
  // NOTE: CSP này sẽ được áp dụng cho tất cả các routes của Next.js frontend
  async headers() {
    // Build connect-src với localhost cho development
    const isDevelopment = process.env.NODE_ENV === 'development';
    const connectSrc = [
      "'self'",
      "https://ecommerce-api.banyco.vn",
      "https://api.banyco.vn",
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
      "https://*.googletagmanager.com",
      "https:"
    ];
    
    // Thêm localhost cho development mode
    if (isDevelopment) {
      // Thêm backend URL từ env hoặc default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3011';
      // Remove trailing slash và /api nếu có
      const cleanApiUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
      
      connectSrc.push(
        cleanApiUrl, // Backend URL từ env
        "http://localhost:3011", // Default backend port
        "http://127.0.0.1:3011",
        "http://localhost:*", // Any localhost port
        "http://127.0.0.1:*" // Any 127.0.0.1 port
      );
    }
    
    return [
      {
        source: '/:path*', // Áp dụng cho tất cả routes
        headers: [
          {
            key: 'Content-Security-Policy',
            // CSP directives - giống với backend để đảm bảo consistency
            // Giải thích chi tiết:
            // - default-src 'self': Mặc định chỉ cho phép từ cùng origin
            // - script-src: Cho phép scripts từ self, inline (cần cho một số lib), eval (cần cho TinyMCE), và Google services
            // - style-src: Cho phép CSS từ self, inline, và Google Fonts
            // - font-src: Cho phép fonts từ self và Google Fonts
            // - img-src: Cho phép images từ self, data URIs, và tất cả HTTP/HTTPS domains
            // - connect-src: QUAN TRỌNG - Cho phép network connections đến:
            //   * Backend APIs (ecommerce-api.banyco.vn, api.banyco.vn)
            //   * Google Analytics 4: www.google-analytics.com và analytics.google.com (GA4 dùng analytics.google.com để collect data)
            //   * Google Tag Manager: www.googletagmanager.com và các subdomain
            //   * Tất cả HTTPS domains khác (fallback)
            //   * Localhost trong development mode
            // - frame-ancestors 'none': Chống clickjacking - không cho phép embed trong iframe
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: http:",
              `connect-src ${connectSrc.join(' ')}`,
              "frame-ancestors 'none'"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;
