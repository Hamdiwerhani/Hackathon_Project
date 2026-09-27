import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import Topnav from "@/components/Topnav";
import AriaAssistant from "@/components/AriaAssistant";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnergyIQ",
  description: "AI-powered campus energy monitoring, alerts, and optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${plusJakarta.variable} antialiased font-sans`}>
        <ThemeProvider>
          <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
            <Sidebar />
            <Topnav />
            <main className="ml-[240px] pt-[60px]">
              <div className="p-8">{children}</div>
            </main>
            <AriaAssistant />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
