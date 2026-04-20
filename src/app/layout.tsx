import type { Metadata } from "next";
import {Poppins} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import HistoryPatch from "@/components/HistoryPatch";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Safa-bodycare",
  description: "A Point of Sale application for managing sales, transactions, customers, and reports efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <HistoryPatch />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
