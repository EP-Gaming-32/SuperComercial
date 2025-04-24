// app/layout.js
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

export const metadata = {
  title: "SuperComercial ERP",
  description: "ERP system for SuperComercial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>{/* Global metadata */}</head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
