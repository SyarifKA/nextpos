"use client";

import { useEffect, useMemo, useState } from "react";
import AddProductModal from "@/components/modal/AddProduct";
import EditProductModal from "@/components/modal/EditProduct";
import DeleteProductModal from "@/components/modal/DeleteProduct";
import { TypeProduct } from "@/models/type";

export default function Product() {
  const [products, setProducts] = useState<TypeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TypeProduct | null>(null);
  const [openDelete, setOpenDelete] = useState(false);


  const perPage = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/product");
      const json = await res.json();
      setProducts(json.data || []);
    } catch (error) {
      console.error("Failed fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredData = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      const matchSupplier = supplier ? item.supplier === supplier : true;
      const matchYear = year ? item.year === year : true;

      return matchSearch && matchSupplier && matchYear;
    });
  }, [products, search, supplier, year]);

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
          Manajemen Produk
        </h1>
        {/* <p className="text-sm text-gray-500">
          Kelola data produk, stok, dan supplier
        </p> */}
      </div>

      {/* FILTER + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            placeholder="Search SKU / Nama Produk"
            className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          <select
            className="w-full md:w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={supplier}
            onChange={(e) => {
              setPage(1);
              setSupplier(e.target.value);
            }}
          >
            <option value="">Semua Supplier</option>
            {Array.from(
                new Set(products.map((p) => p.supplier).filter(Boolean))
                ).map((s) => (
                <option key={`supplier-${s}`} value={s}>
                    {s}
                </option>
                ))}
          </select>

          {/* <select
            className="w-full md:w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={year}
            onChange={(e) => {
              setPage(1);
              setYear(e.target.value);
            }}
          >
            <option value="">Semua Tahun</option>
            {Array.from(
                new Set(products.map((p) => p.year).filter(Boolean))
                ).map((y) => (
                <option key={`year-${y}`} value={y}>
                    {y}
                </option>
                ))}
          </select> */}
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + Tambah Produk
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Nama Produk</th>
              <th className="px-4 py-3 text-left">Harga</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Expired</th>
              <th className="px-4 py-3 text-left">Supplier</th>
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
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  Rp {item.price.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">{item.expired}</td>
                <td className="px-4 py-3">{item.supplier}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => {
                        setSelectedProduct(item);
                        setOpenEdit(true);
                    }}
                    className="rounded-md bg-yellow-500 px-3 py-1 text-xs text-white">
                    Edit
                  </button>
                  <button
                    onClick={() => {
                        setSelectedProduct(item);
                        setOpenDelete(true);
                    }}
                    className="rounded-md bg-red-500 px-3 py-1 text-xs text-white">
                    Delete
                  </button>
                </td>
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

      {/* MODAL */}
      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchProducts}
      />
      <EditProductModal
        open={openEdit}
        product={selectedProduct}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchProducts}
        />
      <DeleteProductModal
        open={openDelete}
        product={selectedProduct}
        onClose={() => setOpenDelete(false)}
        onSuccess={fetchProducts}
        />
    </div>
  );
}
