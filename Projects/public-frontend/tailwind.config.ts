import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.75rem", // Reduced from 2rem (87.5% scaling)
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Scaled font sizes (87.5% of default Tailwind values)
      fontSize: {
        'xs': ['0.7rem', { lineHeight: '1rem' }],      // 11.2px (was 12px)
        'sm': ['0.8rem', { lineHeight: '1.25rem' }],   // 12.8px (was 14px)
        'base': ['0.875rem', { lineHeight: '1.5rem' }], // 14px (was 16px)
        'lg': ['1rem', { lineHeight: '1.75rem' }],      // 16px (was 18px)
        'xl': ['1.1rem', { lineHeight: '1.75rem' }],   // 17.6px (was 20px)
        '2xl': ['1.3rem', { lineHeight: '2rem' }],      // 20.8px (was 24px)
        '3xl': ['1.65rem', { lineHeight: '2.25rem' }],  // 26.4px (was 30px)
        '4xl': ['2rem', { lineHeight: '2.5rem' }],      // 32px (was 36px)
        '5xl': ['2.625rem', { lineHeight: '1' }],       // 42px (was 48px)
        '6xl': ['3.3rem', { lineHeight: '1' }],        // 52.8px (was 60px)
      },
      // Scaled spacing (87.5% of default Tailwind values)
      spacing: {
        '0.5': '0.125rem',   // 2px (was 0.125rem, keep same)
        '1': '0.25rem',      // 4px (was 0.25rem, keep same)
        '1.5': '0.375rem',   // 6px (was 0.375rem, keep same)
        '2': '0.5rem',       // 8px (was 0.5rem, keep same)
        '2.5': '0.625rem',   // 10px (was 0.625rem, keep same)
        '3': '0.75rem',      // 12px (was 0.75rem, keep same)
        '3.5': '0.875rem',   // 14px (was 0.875rem, keep same)
        '4': '1rem',         // 16px (was 1rem, keep same)
        '5': '1.1rem',       // 17.6px (was 1.25rem)
        '6': '1.3rem',       // 20.8px (was 1.5rem)
        '7': '1.5rem',       // 24px (was 1.75rem)
        '8': '1.75rem',      // 28px (was 2rem)
        '9': '2rem',         // 32px (was 2.25rem)
        '10': '2.2rem',      // 35.2px (was 2.5rem)
        '11': '2.4rem',      // 38.4px (was 2.75rem)
        '12': '2.625rem',    // 42px (was 3rem)
        '14': '3rem',        // 48px (was 3.5rem)
        '16': '3.5rem',      // 56px (was 4rem)
        '18': '3.9375rem',   // 63px (was 4.5rem)
        '20': '4.375rem',    // 70px (was 5rem)
        '24': '5.25rem',     // 84px (was 6rem)
        '28': '6.125rem',    // 98px (was 7rem)
        '32': '7rem',        // 112px (was 8rem)
        '36': '7.875rem',    // 126px (was 9rem)
        '40': '8.75rem',     // 140px (was 10rem)
        '44': '9.625rem',    // 154px (was 11rem)
        '48': '10.5rem',     // 168px (was 12rem)
        '52': '11.375rem',   // 182px (was 13rem)
        '56': '12.25rem',    // 196px (was 14rem)
        '60': '13.125rem',   // 210px (was 15rem)
        '64': '14rem',       // 224px (was 16rem)
        '72': '15.75rem',    // 252px (was 18rem)
        '80': '17.5rem',     // 280px (was 20rem)
        '96': '21rem',       // 336px (was 24rem)
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
