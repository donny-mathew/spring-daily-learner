import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Spring Daily Learner",
  description: "Daily Spring Boot news, system design lectures, and learning streak tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <TopNav />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
