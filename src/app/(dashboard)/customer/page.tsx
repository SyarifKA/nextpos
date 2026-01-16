"use client"

import { useEffect, useMemo, useState } from "react";
import { TypeCustomer, TypeProduct } from "@/models/type";

export default function CustomerPage(){
    const [customers, setCustomers] = useState<TypeCustomer[]>([]);
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState("");
      const [supplier, setSupplier] = useState("");
      const [year, setYear] = useState("");
      const [page, setPage] = useState(1);
      const [openAdd, setOpenAdd] = useState(false);
      const [openEdit, setOpenEdit] = useState(false);
      const [selectedProduct, setSelectedProduct] = useState<TypeCustomer | null>(null);
      const [openDelete, setOpenDelete] = useState(false);
    
    
      const perPage = 5;
    
      const fetchCustomers = async () => {
        try {
          setLoading(true);
          const res = await fetch("/api/customer");
          const json = await res.json();
          setCustomers(json.data || []);
        } catch (error) {
          console.error("Failed fetch Customers", error);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchCustomers();
      }, []);
    
      const filteredData = useMemo(() => {
        return customers.filter((item) => {
          const matchSearch =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toLowerCase().includes(search.toLowerCase());
    
          const matchSupplier = supplier ? item.name === supplier : true;
    
          return matchSearch && matchSupplier;
        });
      }, [customers, search, supplier]);
    
      const totalPage = Math.ceil(filteredData.length / perPage);
    
      const paginatedData = filteredData.slice(
        (page - 1) * perPage,
        page * perPage
      );
    return (
        <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Manajemen Pelanggan
        </h1>
      </div>

      {/* FILTER + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            placeholder="Search ID / Nama Pelanggan"
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
          + Tambah Pelanggan
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nama Pelanggan</th>
              <th className="px-4 py-3 text-left">Tanggal registrasi</th>
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

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.id}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  {/* Rp {item.price.toLocaleString("id-ID")} */}
                  {item.createdAt}
                </td>
                <td className="w-1/5 text-center"><button className="bg-green-400 hover:bg-green-500 cursor-pointer text-black px-4 py-2 rounded-md">detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPage > 1 && (
        <div className="flex justify-end gap-1">
          <button
            className="rounded border px-3 py-1 text-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            «
          </button>

          {Array.from({ length: totalPage }).map((_, i) => (
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
            className="rounded border px-3 py-1 text-sm"
            disabled={page === totalPage}
            onClick={() => setPage(page + 1)}
          >
            »
          </button>
        </div>
      )}
    </div>
    )
}