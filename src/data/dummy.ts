// src/data/dummy.ts
export type Product = {
  id: number;
  sku?: string;
  name: string;
  price: number;
  stock: number;
  expired?: string;
  image?: string;
};

export const products: Product[] = [
  { id: 1, sku: "P-001", name: "Aqua Botol 600ml", price: 5000, stock: 50, expired: "2026-06-01" },
  { id: 2, sku: "P-002", name: "Indomie Goreng", price: 3500, stock: 100, expired: "2026-02-10" },
  { id: 3, sku: "P-003", name: "Kopi Sachet", price: 2500, stock: 25, expired: "2025-12-15" },
  { id: 4, sku: "P-004", name: "Susu UHT 200ml", price: 8000, stock: 30, expired: "2026-03-20" },
  { id: 5, sku: "P-005", name: "Roti Tawar", price: 12000, stock: 10, expired: "2025-12-05" },
];
