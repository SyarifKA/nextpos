"use client";

import { useEffect, useMemo, useState, useRef} from "react";
import AddProductModal from "@/components/modal/product/AddProduct";
import EditProductModal from "@/components/modal/product/EditProduct";
import DeleteProductModal from "@/components/modal/product/DeleteProduct";
import { TypeProduct, Pagination, ProductForm} from "@/models/type";
import { useAuth } from "@/lib/context/AuthContext";
import { Trash2, Pencil } from "lucide-react";

export default function Product() {
  const { role } = useAuth();
  const [products, setProducts] = useState<TypeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const openEditModal = (item: TypeProduct) => {
    setEditProduct({
      id: item.id,
      sku: item.sku,
      name: item.name,
      size: item.size || "",
      price: String(item.price),
      stock: String(item.stock),
      exp: item.exp.split("T")[0],
      supplier_name: item.supplier_name,
      discount_customer: String(item.discount_customer || 0),
    });
    setOpenEdit(true);
  };

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800">
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
              <th className="px-4 py-3 text-left">Laba</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Expired</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              {role === "Admin" && <th className="px-4 py-3 text-center">Aksi</th>}
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={role === "Admin" ? 10 : 9} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={role === "Admin" ? 10 : 9} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {products.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">
                  Rp {item.price?.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={item.profit_percentage < 0 ? "text-red-600" : "text-green-600"}>
                    {item.profit_percentage?.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  Rp {item?.discount_customer?.toLocaleString() || 0}
                </td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">
                  {new Date(item.exp).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.supplier_name}</td>
                {role === "Admin" && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mr-1"
                      title="Edit"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setOpenDelete(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                )}
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

        {!loading && products.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            Data tidak ditemukan
          </div>
        )}

        {products.map((item) => (
          <div key={item.id} className="border rounded-lg p-3 bg-white">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                  {item.sku}
                  {item.size && <span className="ml-2 text-gray-400">{item.size}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-sm">
                  Rp {item.price?.toLocaleString()}
                </div>
                <div
                  className={`text-xs font-medium ${
                    item.profit_percentage < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Laba {item.profit_percentage?.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-gray-500">Stock</span>
                <span
                  className={`font-medium ${
                    item.stock <= 0 ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {item.stock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Disc</span>
                <span className="font-medium">
                  {item.discount_customer
                    ? `Rp ${item.discount_customer.toLocaleString()}`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Exp</span>
                <span className="font-medium">
                  {new Date(item.exp).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Supplier</span>
                <span className="font-medium truncate ml-1">
                  {item.supplier_name || "-"}
                </span>
              </div>
            </div>

            {role === "Admin" && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium transition"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(item);
                    setOpenDelete(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium transition"
                >
                  <Trash2 size={14} />
                  Hapus
                </button>
              </div>
            )}
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
