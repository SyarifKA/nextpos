"use client";

import { useEffect, useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { Pagination, TypeCustomerReturn } from "@/models/type";

export default function CustomerReturnPage() {
  const [returns, setReturns] = useState<TypeCustomerReturn[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/customer-return?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      setReturns(json.data || []);
      setPagination(json.pagination);
    } catch {
      console.error("Failed fetch customer returns");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
        <RotateCcw className="w-8 h-8" />
        Riwayat Retur Customer
      </h1>

      <p className="text-sm text-gray-500">
        Untuk membuat retur baru, buka{" "}
        <strong>Riwayat Transaksi</strong> lalu klik tombol{" "}
        <strong>Retur</strong> pada transaksi yang diinginkan.
      </p>

      <input
        type="text"
        placeholder="Cari retur (nama produk / ID)..."
        className="w-full md:w-64 rounded-lg border px-3 py-2 text-sm"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-3">ID Retur</th>
              <th className="p-3">Produk</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Refund</th>
              <th className="p-3">Kondisi</th>
              <th className="p-3">Diproses Oleh</th>
              <th className="p-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Belum ada data retur.
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{r.id}</td>
                  <td className="p-3">
                    {r.product_name}
                    <span className="text-gray-400 ml-1 text-xs">
                      {r.product_size}
                    </span>
                  </td>
                  <td className="p-3">{r.qty}</td>
                  <td className="p-3 text-green-600 font-medium">
                    Rp {r.refund_amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.condition === "baik"
                          ? "bg-green-100 text-green-700"
                          : r.condition === "rusak"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.condition}
                    </span>
                  </td>
                  <td className="p-3">{r.created_by_name}</td>
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-end gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            &laquo;
          </button>

          {Array.from({ length: pagination.total_pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded border px-3 py-1 text-sm ${
                page === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === pagination.total_pages}
            onClick={() => setPage(page + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
