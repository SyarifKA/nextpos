"use client";

import { useEffect, useMemo, useState } from "react";
import AddSupplierModal from "@/components/modal/supplier/AddSupplier";
import { Pagination } from "@/models/type";
import { TypeSupplier } from "@/models/type_supplier";
import Link from "next/link";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState<TypeSupplier[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<TypeSupplier | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const limit = 10;
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/supplier?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setSuppliers(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, page]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Manajemen Supplier
        </h1>
      </div>

      {/* FILTER + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            placeholder="Cari nama supplier"
            className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + Tambah Supplier
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nama perusahaan</th>
              <th className="px-4 py-3 text-left">Telepon perusahaan</th>
              <th className="px-4 py-3 text-left">Nama sales</th>
              <th className="px-4 py-3 text-left">Telepon sales</th>
              <th className="px-4 py-3 text-center">Aksi</th>
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

            {!loading && suppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {suppliers.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.id}</td>
                <td className="px-4 py-3">{item.company_name}</td>
                <td className="px-4 py-3">{item.phone_company}</td>
                <td className="px-4 py-3">{item.sales_name}</td>
                <td className="px-4 py-3">{item.phone_sales}</td>
                {/* <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => {
                        setSelectedSupplier(item);
                        setOpenEdit(true);
                    }}
                    className="rounded-md bg-yellow-500 px-3 py-1 text-xs text-white">
                    Edit
                  </button>
                  <button
                    onClick={() => {
                        setSelectedSupplier(item);
                        setOpenDelete(true);
                    }}
                    className="rounded-md bg-red-500 px-3 py-1 text-xs text-white">
                    Delete
                  </button>
                </td> */}
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/supplier/${item.id}`}
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
        {/* MODAL */}
      <AddSupplierModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          setPage(1);
          fetchSuppliers();
        }}
      />
    </div>
  );
}
