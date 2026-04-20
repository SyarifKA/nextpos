"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { TypeStock } from "@/models/type_stock";
import { Pagination } from "@/models/type";

export default function StockExpired() {
  const [stocks, setStocks] = useState<TypeStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const limit = 10;

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/stock/expired?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setStocks(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Stocks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [page, search]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Helper: generate page numbers with ellipsis
  const getPaginationPages = (current: number, total: number): (number | "...")[] => {
    const delta = 1; // pages to left & right of active page
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
    <div className="p-3 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800">
          Stok Expired
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

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">Barcode</th>
              <th className="px-4 py-3 text-left">Nama Produk</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">Harga</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Expired</th>
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

            {!loading && stocks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {stocks.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">
                  Rp {item.price?.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  Rp {item?.discount?.toLocaleString()}
                </td>
                <td className="px-4 py-3">{item.qty}</td>
                <td className="px-4 py-3">
                  {new Date(item.exp).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-2">
        {loading && (
          <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
        )}

        {!loading && stocks.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            Data tidak ditemukan
          </div>
        )}

        {stocks.map((item) => (
          <div key={item.id} className="border border-orange-200 bg-orange-50/30 rounded-lg p-3">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                  {item.sku}
                  {item.size && (
                    <span className="ml-2 text-gray-400">{item.size}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-sm">
                  Rp {item.price?.toLocaleString()}
                </div>
                {item.discount > 0 && (
                  <div className="text-xs text-green-600">
                    -Rp {item.discount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-orange-200">
              <span className="text-gray-500">
                Qty: <strong className="text-gray-800">{item.qty}</strong>
              </span>
              <span className="text-orange-700 font-medium">
                Exp: {new Date(item.exp).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center md:justify-end items-center gap-1 mt-3 flex-wrap">
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
            {/* Page numbers */}
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
