// src/data/dummy.ts
import { TypeCustomer, TypeProduct } from "@/models/type";

export const products: TypeProduct[] = [
  { id: 1, sku: "P-001", name: "Aqua Botol 600ml", price: 5000, stock: 50, expired: "2026-06-01", supplier: "Supplier A", year:"2025" },
  { id: 2, sku: "P-002", name: "Indomie Goreng", price: 3500, stock: 100, expired: "2026-02-10", supplier: "Supplier B", year:"2025" },
  { id: 3, sku: "P-003", name: "Kopi Sachet", price: 2500, stock: 25, expired: "2025-12-15", supplier: "Supplier H", year:"2025" },
  { id: 4, sku: "P-004", name: "Susu UHT 200ml", price: 8000, stock: 30, expired: "2026-03-20", supplier: "Supplier S", year:"2025" },
  { id: 5, sku: "P-005", name: "Roti Tawar", price: 12000, stock: 10, expired: "2025-12-05", supplier: "Supplier A", year:"2025" },
  { id: 6, sku: "P-006", name: "Aqua Botol 600ml", price: 5000, stock: 50, expired: "2026-06-01", supplier: "Supplier A", year:"2025" },
  { id: 7, sku: "P-007", name: "Indomie Goreng", price: 3500, stock: 100, expired: "2026-02-10", supplier: "Supplier B", year:"2025" },
  { id: 8, sku: "P-008", name: "Kopi Sachet", price: 2500, stock: 25, expired: "2025-12-15", supplier: "Supplier H", year:"2025" },
  { id: 9, sku: "P-009", name: "Susu UHT 200ml", price: 8000, stock: 30, expired: "2026-03-20", supplier: "Supplier S", year:"2025" },
  { id: 10, sku: "P-010", name: "Roti Tawar", price: 12000, stock: 10, expired: "2025-12-05", supplier: "Supplier A", year:"2025" },
  { id: 11, sku: "P-011", name: "Aqua Botol 600ml", price: 5000, stock: 50, expired: "2026-06-01", supplier: "Supplier A", year:"2025" },
  { id: 12, sku: "P-012", name: "Indomie Goreng", price: 3500, stock: 100, expired: "2026-02-10", supplier: "Supplier B", year:"2025" },
  { id: 13, sku: "P-013", name: "Kopi Sachet", price: 2500, stock: 25, expired: "2025-12-15", supplier: "Supplier H", year:"2025" },
  { id: 14, sku: "P-014", name: "Susu UHT 200ml", price: 8000, stock: 30, expired: "2026-03-20", supplier: "Supplier S", year:"2025" },
  { id: 15, sku: "P-015", name: "Roti Tawar", price: 12000, stock: 10, expired: "2025-12-05", supplier: "Supplier A", year:"2025" },
  { id: 16, sku: "P-016", name: "Aqua Botol 600ml", price: 5000, stock: 50, expired: "2026-06-01", supplier: "Supplier A", year:"2025" },
  { id: 17, sku: "P-017", name: "Indomie Goreng", price: 3500, stock: 100, expired: "2026-02-10", supplier: "Supplier B", year:"2025" },
  { id: 18, sku: "P-018", name: "Kopi Sachet", price: 2500, stock: 25, expired: "2025-12-15", supplier: "Supplier H", year:"2025" },
  { id: 19, sku: "P-019", name: "Susu UHT 200ml", price: 8000, stock: 30, expired: "2026-03-20", supplier: "Supplier S", year:"2025" },
  { id: 20, sku: "P-020", name: "Roti Tawar", price: 12000, stock: 10, expired: "2025-12-05", supplier: "Supplier A", year:"2025" },
];

export const Customers: TypeCustomer[] = [
  {id: "1", name: "wawan", phone_number: "089999999", created_at: "2025-12-15"},
  {id: "2", name: "asep", phone_number: "089999999", created_at: "2026-01-15"},
  {id: "3", name: "kevin", phone_number: "089999999", created_at: "2025-12-18"},
  {id: "4", name: "doni", phone_number: "089999999", created_at: "2025-07-10"},
  {id: "5", name: "cecep", phone_number: "089999999", created_at: "2025-07-24"},
  {id: "6", name: "susanto", phone_number: "089999999", created_at: "2026-01-12"},
]