"use client";

import { useEffect, useMemo, useState, useRef} from "react";
import AddProductModal from "@/components/modal/product/AddProduct";
import EditProductModal from "@/components/modal/product/EditProduct";
import DeleteProductModal from "@/components/modal/product/DeleteProduct";
import { TypeProduct, Pagination, ProductForm} from "@/models/type";
import { TypeStockMovement } from "@/models/type_stock";

export default function StockHistory() {
  const [stockMovement, setStockMovement] = useState<TypeStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TypeProduct | null>(null);
  const [editProduct, setEditProduct] = useState<ProductForm | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const limit = 10;

  const fetchstockMovement = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/stock-movement?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setStockMovement(json.data || []);
      // setEditProduct(json.data || [])
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchstockMovement();
  }, [page, search]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getStockTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Penjualan";
      case "stock_in":
        return "Stok Masuk";
      case "stock_out":
        return "Stok Keluar";
      case "supplier_return":
        return "Retur ke supplier";
      case "waste":
        return "Dibuang";
      default:
        return type;
    }
  };

      // Helper: generate page numbers dengan ellipsis
  const getPaginationPages = (current: number, total: number): (number | "...")[] => {
    const delta = 1; // halaman di kiri & kanan halaman aktif
    const pages: (number | "...")[] = [];

    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    pages.push(1);
    if (rangeStart > 2) pages.push("...");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < total - 1) pages.push("...");
    if (total > 1) pages.push(total);

    return pages;
  };


  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Riwayat stock
        </h1>
      </div>

      {/* FILTER + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search SKU / Nama Produk"
            className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Nama Produk</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">Catatan</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Dibuat oleh</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && stockMovement.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {stockMovement.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3">{item.product_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium
                      ${item.type === "sale" && "bg-red-100 text-red-700"}
                      ${item.type === "supplier_return" && "bg-red-100 text-red-700"}
                      ${item.type === "waste" && "bg-red-100 text-red-700"}
                      ${item.type === "stock_in" && "bg-green-100 text-green-700"}
                    `}
                  >
                  {getStockTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-4 py-3">{item.note}</td>
                <td className="px-4 py-3">{item.qty}</td>
                <td className="px-4 py-3">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.created_by_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-end items-center gap-1 mt-3">
              {/* First */}
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Halaman pertama"
              >
                «
              </button>
              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Sebelumnya"
              >
                ‹
              </button>

              {/* Nomor halaman */}
              {getPaginationPages(page, pagination.total_pages).map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 py-1 text-sm text-gray-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`rounded border px-3 py-1 text-sm ${
                      page === p
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                disabled={page === pagination.total_pages}
                onClick={() => setPage(page + 1)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Berikutnya"
              >
                ›
              </button>
              {/* Last */}
              <button
                disabled={page === pagination.total_pages}
                onClick={() => setPage(pagination.total_pages)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Halaman terakhir"
              >
                »
              </button>
            </div>
          )}
    </div>
  );
}
