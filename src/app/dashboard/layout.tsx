import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "../globals.css";

const open_sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascendion App",
  description: "Web Application Developer",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${open_sans.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
