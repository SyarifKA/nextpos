"use client";

import { useEffect, useMemo, useState, useRef} from "react";
import AddProductModal from "@/components/modal/product/AddProduct";
import EditProductModal from "@/components/modal/product/EditProduct";
import DeleteProductModal from "@/components/modal/product/DeleteProduct";
import { TypeProduct, Pagination, ProductForm} from "@/models/type";

export default function StockHistory() {
  const [products, setProducts] = useState<TypeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TypeProduct | null>(null);
  const [editProduct, setEditProduct] = useState<ProductForm | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const limit = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/product?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setProducts(json.data || []);
      setEditProduct(json.data || [])
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Manajemen Produk
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
                new Set(products.map((p) => p.supplier_name).filter(Boolean))
                ).map((s) => (
                <option key={`supplier-${s}`} value={s}>
                    {s}
                </option>
                ))}
          </select>
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

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {products.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  Rp {item.price?.toLocaleString()}
                </td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">
                  {new Date(item.exp).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.supplier_name}</td>
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
      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchProducts}
      />
      <EditProductModal
        open={openEdit}
        product={editProduct}
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
