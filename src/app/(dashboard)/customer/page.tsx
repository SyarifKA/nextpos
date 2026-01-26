"use client";

import { useEffect, useState } from "react";
import { TypeCustomer, Pagination } from "@/models/type";
import AddCustomerModal from "@/components/modal/customer/AddCustomer";
import Link from "next/link";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<TypeCustomer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const [openAdd, setOpenAdd] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/customer?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setCustomers(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <h1 className="text-3xl font-semibold text-gray-800">
        Manajemen Pelanggan
      </h1>

      {/* SEARCH + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search ID / Nama Pelanggan"
          className="w-full md:w-64 rounded-lg border px-3 py-2 text-sm"
          value={search}
          onChange={(e) => {
            setPage(1); // reset ke page 1
            setSearch(e.target.value);
          }}
        />

        <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Tambah Pelanggan
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Telepon</th>
              <th className="px-4 py-3 text-left">Registrasi</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {customers.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.id}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.phone_number}</td>
                <td className="px-4 py-3">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/customer/${item.id}`}
                    className="bg-green-400 hover:bg-green-500 px-4 py-2 rounded-md"
                  >
                    Detail
                  </Link>
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
      <AddCustomerModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          setPage(1);
          fetchCustomers();
        }}
      />
    </div>
  );
}
