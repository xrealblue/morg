import "~/styles/globals.css";

import { type Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";
import { ProjectProvider } from "~/hooks/use-project";
import { WorkerPoolContext } from "~/components/WorkerPoolContext";
import { ThemeProvider } from "~/components/theme-provider";
import { PreloadHighlighter } from "~/components/PreloadHighlighter";

export const metadata: Metadata = {
  title: "Morg - AI Code Analysis",
  description: "Get your project summary in seconds with AI-powered code analysis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const berkeleyMono = localFont({
  src: "../../public/fonts/BerkeleyMono-Regular.otf",
  variable: "--font-berkeley-mono",
  display: "swap",
});

const themeBootstrapScript = `(${String(function applyInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem('theme');
    const theme =
      storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : 'system';
    const resolvedTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    const root = document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta == null) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute(
      'content',
      resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff'
    );
  } catch {}
})})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${berkeleyMono.variable} ${manrope.variable}`}
    >
      <head>
        <script
          id="docs-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body className="diffshub">
        <TRPCReactProvider>
          <ProjectProvider>
            <WorkerPoolContext>
              <ThemeProvider attribute="class">
                {children}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: "rgba(0, 0, 0, 0.9)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                    },
                  }}
                />
                <div
                  id="dark-mode-portal-container"
                  className="dark"
                  data-theme="dark"
                ></div>
                <div
                  id="light-mode-portal-container"
                  className="light"
                  data-theme="light"
                ></div>
              </ThemeProvider>
            </WorkerPoolContext>
          </ProjectProvider>
        </TRPCReactProvider>
        <PreloadHighlighter />
      </body>
    </html>
  );
}
