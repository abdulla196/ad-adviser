import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout";

export const metadata: Metadata = {
  title: "Ad Adviser",
  description: "Unified advertising dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
