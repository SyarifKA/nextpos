"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/lib/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col ml-80">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
