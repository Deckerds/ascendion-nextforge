import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "../globals.css";
import { Navbar } from "../../components/layouts/Navbar";
import { ToastContainer } from "react-toastify";

const open_sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascendion App",
  description: "Web Application Developer",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${open_sans.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <ToastContainer />
      </body>
    </html>
  );
}
