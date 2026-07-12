import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import "./globals.css"

export const metadata: Metadata = {
  title: "Speech Coach",
  description: "Practice public speaking with timed prompts and AI feedback."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider >
        <Header />
      <main>{children}</main>
        <Footer />
        </AuthProvider>
        </body>
    </html>
  );
}