import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "365 Collect",
  description: "365 Collect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex bg-pa-background-box py-4"
        style={{
          backgroundImage: "url('https://365rapidapp.powerappsportals.com/MyDashboardBG.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
          <Image
            className="m-auto w-6/12 md:w-3/12"
            src="/images/365_Collect_Logo_Main.png"
            alt="365 logo"
            width={1785}
            height={346}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
