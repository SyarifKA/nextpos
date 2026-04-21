"use client";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface NavbarProps {
  onMenuClick?: () => void;
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [photoPath, setPhotoPath] = useState<string>("");

  const fetchPhoto = () => {
    fetch("/api/profile/me")
      .then((r) => r.json())
      .then((j) => setPhotoPath(j?.data?.photo || ""))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPhoto();
    const onProfile = () => fetchPhoto();
    window.addEventListener("profile-updated", onProfile);
    return () => window.removeEventListener("profile-updated", onProfile);
  }, []);

  return (
    <header className="bg-secondary px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10">
      {/* Hamburger (mobile only) */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-gray-100 shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile brand (hidden on desktop) */}
      <div className="lg:hidden text-lg font-bold">
        <span className="text-blue-600">Safa</span>
        <span className="text-green-600">Bodycare</span>
      </div>

      <div className="flex items-center space-x-3 ml-auto">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100">
          <Bell className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center space-x-2">
          {photoPath ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`${API_ORIGIN}${photoPath}`}
              alt="User Avatar"
              className="rounded-full object-cover bg-white w-8 h-8 md:w-10 md:h-10"
            />
          ) : (
            <Image
              src={"/assets/boy.png"}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full object-cover bg-white w-8 h-8 md:w-10 md:h-10"
            />
          )}
        </div>
      </div>
    </header>
  );
}
