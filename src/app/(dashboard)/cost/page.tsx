"use client";

import { useEffect, useRef, useState } from "react";
import AddCostModal from "@/components/modal/cost/AddCost";
import { TypeCost} from "@/models/type_cost";
import { Pagination } from "@/models/type";

export default function CostPage() {
  const [costs, setCosts] = useState<TypeCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const limit = 10;
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/cost?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setCosts(json.data || []);
      setPagination(json.pagination);
    } catch (err) {
      console.error("Failed fetch costs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [page, search]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Manajemen Pengeluaran
        </h1>
      </div>

      {/* FILTER + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari nama pengeluaran"
          className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
            text-white hover:bg-blue-700 transition"
        >
          + Tambah Pengeluaran
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Nominal</th>
              <th className="px-4 py-3 text-left">Dibuat Oleh</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && costs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {costs.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 font-medium">
                  Rp {item.amount.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.created_by_name}</td>
                <td className="px-4 py-3">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-end gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1 text-sm"
          >
            «
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
            className="rounded border px-3 py-1 text-sm"
          >
            »
          </button>
        </div>
      )}

      {/* MODAL */}
      <AddCostModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchCosts}
      />
    </div>
  );
}
