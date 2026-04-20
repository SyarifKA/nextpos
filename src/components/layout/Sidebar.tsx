"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  BookOpen,
  Truck,
  BookUser,
  Grid2x2Plus,
  Power,
  Home,
  Warehouse,
  BanknoteArrowDown,
  X,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import ExitModal from "../modal/exit/exit";
import { useAuth } from "@/lib/context/AuthContext";

type MenuSubItem = {
  name: string;
  path: string;
};

type MenuChild = {
  name: string;
  icon?: any;
  path?: string;
  children?: MenuSubItem[];
};

type MenuSection = {
  item: string;
  children: MenuChild[];
};

const menu: MenuSection[] = [
  {
    item: "Home",
    children: [
      {
        name: "Dashboard",
        icon: Home,
        path: "/dashboard",
      },
    ],
  },
  {
    item: "Kasir",
    children: [
      {
        name: "Transaksi",
        icon: BookOpen,
        children: [
          { name: "penjualan", path: "/sales" },
          { name: "riwayat transaksi", path: "/transaction-history" },
          { name: "retur customer", path: "/customer-return" },
        ],
      },
      {
        name: "Stok",
        icon: Warehouse,
        children: [
          { name: "stok produk", path: "/product-stock" },
          { name: "history stok", path: "/stock-history" },
          { name: "stok expired", path: "/stock/expired" },
        ],
      },
      {
        name: "Customer",
        icon: BookUser,
        path: "/customer"
      },
    ],
  },
  {
    item: "Admin",
    children: [
      {
        name: "Produk",
        icon: Grid2x2Plus,
        children: [
          { name: "list produk", path: "/product" },
          { name: "buat produk", path: "/input-products" },
        ],
      },
      {
        name: "Supplier",
        icon: Truck,
        children: [
          { name: "list supplier", path: "/supplier" },
          { name: "produk tempo", path: "/supplier/tempo" },
        ]
      },
      {
        name: "Pengeluaran",
        icon: BanknoteArrowDown,
        path: "/cost"
      },
    ]
    },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [openExit, setOpenExit] = useState(false);
  const { username, role } = useAuth();

  const toggleMenu = (name: string) => {
    setOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile — defer to next tick so Next.js navigation completes first
    if (onClose && typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => onClose(), 0);
    }
  };

  return (
    <aside
      className={cn(
        "w-[85vw] max-w-[320px] lg:w-[320px] h-screen fixed flex flex-col bg-white border-r border-gray01 py-6 lg:py-8 gap-6 lg:gap-8 text-black overflow-y-auto hide-scrollbar z-30 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo + Close (mobile) */}
      <div className="flex flex-row justify-between items-center px-5 lg:pl-8">
        <span className="text-2xl text-primary font-bold text-center">
          <h2 className="flex items-start justify-center gap-2 mt-2 text-center">
            <span className="text-blue-600">Safa</span>
            <span className="text-green-600">Bodycare!</span>
          </h2>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {menu.map((section) => (
          <div key={section.item} className="flex flex-col gap-2">
            <p className="px-5 text-sm font-bold text-gray-500 uppercase">
              {section.item}
            </p>

            {section.children.map((child) => {
              const childKey = `${section.item}-${child.name}`;
                if (child.name === "Pengeluaran" && role !== "Admin") {
                  return null;
                }

              if (child.path && !child.children) {
                return (
                  <Link
                    key={childKey}
                    href={child.path}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center text-black mx-5 gap-3 p-3 text-[16px] rounded-lg font-semibold transition hover:text-white hover:bg-primary",
                      pathname === child.path && "bg-primary text-white"
                    )}
                  >
                    {child.icon && <child.icon size={24} className="stroke-[1.5]" />}
                    <span>{child.name}</span>
                  </Link>
                );
              }

              return (
                <div key={childKey} className="flex flex-col">
                  <button
                    onClick={() => toggleMenu(child.name)}
                    className="flex items-center text-black mx-5 gap-3 p-3 text-[16px] font-semibold rounded-lg transition"
                  >
                    {child.icon && <child.icon size={24} className="stroke-[1.5]" />}
                    <span>{child.name}</span>

                    {child.children && (
                      <ChevronRight
                        size={24}
                        className={cn(
                          "ml-auto stroke-[1.5] transition-transform",
                          open[child.name] && "rotate-90"
                        )}
                      />
                    )}
                  </button>

                  {child.children && open[child.name] && (
                    <div className="flex flex-col mx-5 gap-2">
                      {child.children.map((sub) => {
                        const subKey = `${child.name}-${sub.path}`;
                        return (
                          <Link
                            key={subKey}
                            href={sub.path}
                            onClick={handleLinkClick}
                            className={cn(
                              "flex p-3 pl-12 text-[16px] rounded-lg text-black transition hover:text-primary",
                              pathname === sub.path &&
                                "bg-blue01 text-primary font-semibold"
                            )}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex justify-around items-center p-2 bg-secondary mx-2 rounded-md">
        <Image
          src={"/assets/boy.png"}
          alt="User Avatar"
          width={40}
          height={40}
          className="rounded-full object-cover bg-white"
        />
        <div className="flex flex-col items-start w-full max-w-37.5">
          <span className="font-semibold text-black truncate max-w-30">
            {username}
          </span>

          <div className="flex gap-2 text-sm items-center">
            <span className="truncate max-w-26">
              {role}
            </span>
            {/* <span className="bg-gray-300 px-1 rounded-md">+ 2</span> */}
          </div>
        </div>
        <button 
          onClick={()=>setOpenExit(!openExit)}
          className=" hover:bg-red-500 p-2 rounded-lg"
        >
          <Power className="text-primary"/>
        </button>
      </div>
      <ExitModal
        open={openExit}
        onClose={() => setOpenExit(false)}
      />
    </aside>
  );
}
