/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Server Actions configuration moved to route handlers in Next.js 16
  // Security headers to prevent XSS, clickjacking, and other attacks
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com data:",
              // Allow localhost API connections in development
              process.env.NODE_ENV === 'development'
                ? "connect-src 'self' http://localhost:* http://127.0.0.1:* https://www.youtube.com https://meet.google.com https://zoom.us https://maps.googleapis.com https://maps.gstatic.com"
                : "connect-src 'self' https://www.youtube.com https://meet.google.com https://zoom.us https://maps.googleapis.com https://maps.gstatic.com",
              "frame-src 'self' https://www.youtube.com https://meet.google.com https://zoom.us https://www.google.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              // Only upgrade insecure requests in production
              process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : "",
            ].filter(Boolean).join('; ')
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
