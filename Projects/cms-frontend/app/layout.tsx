import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
// Import DOM patch EARLY - before React components
import "@/lib/dom-safe-patch";
import { DOMPatchScript } from "@/components/dom-patch-script";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppearanceProvider } from "@/hooks/use-appearance";
import { FaviconProvider } from "@/components/FaviconProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Load Roboto với các weight cần thiết cho editor
const roboto = Roboto({
  weight: ["400", "500", "700"], // Regular, Medium, Bold
  subsets: ["latin", "vietnamese"], // Thêm Vietnamese subset
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banyco CMS - Bảng điều khiển",
  description: "Hệ thống quản lý nội dung hiện đại",
};

// DOM patch is now imported from @/lib/dom-safe-patch

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload Google Fonts for TinyMCE editor - Load các font phổ biến với đầy đủ weights */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Load các font Sans-serif phổ biến cho tiếng Việt */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Raleway:wght@400;500;600;700&family=Lato:wght@400;700&family=Ubuntu:wght@400;500;700&display=swap&subset=latin,vietnamese"
          rel="stylesheet"
        />
        {/* Load các font Serif */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;500;600;700&display=swap&subset=latin,vietnamese"
          rel="stylesheet"
        />
        {/* Load các font Display/Decorative */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Pacifico&display=swap&subset=latin,vietnamese"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${roboto.variable}`}>
        <DOMPatchScript />
        <FaviconProvider />
        <ThemeProvider defaultTheme="light" storageKey="pressup-cms-theme">
          <AppearanceProvider>
            {children}
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
