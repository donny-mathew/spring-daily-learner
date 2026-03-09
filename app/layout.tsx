import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Spring Daily Learner",
  description: "Daily Spring Boot news, system design lectures, and learning streak tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC — apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  var pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', t || pref);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
              <div className="mx-auto max-w-5xl p-4 lg:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
