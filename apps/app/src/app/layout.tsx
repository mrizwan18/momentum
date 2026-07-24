import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AppProviders } from "@/providers";
import { InstallPwaPrompt } from "@/components/InstallPwaPrompt";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage-key";
import "@/styles/globals.css";

// Rounded-geometric sans per docs/design/PIXEL_SPEC.md's typography spec
// (closest web-safe match to the reference screenshots' SF Pro Rounded).
const appFont = Manrope({
  subsets: ["latin"],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Momentum",
    template: "%s · Momentum",
  },
  description: "An offline-first platform for deliberate practice.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Momentum",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "hsl(233 28% 8%)" },
    { media: "(prefers-color-scheme: light)", color: "hsl(230 45% 97%)" },
  ],
};

// Reads the persisted theme before hydration so there is no flash of the
// wrong theme; mirrors the shape zustand/persist writes to localStorage.
const noFlashThemeScript = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var preference="light";if(raw){var parsed=JSON.parse(raw);preference=(parsed&&parsed.state&&parsed.state.theme)||"light";}var resolved=preference;if(preference==="system"){resolved=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",resolved);}catch(error){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={appFont.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="font-sans antialiased">
        <AppProviders>
          {children}
          <InstallPwaPrompt />
        </AppProviders>
      </body>
    </html>
  );
}
