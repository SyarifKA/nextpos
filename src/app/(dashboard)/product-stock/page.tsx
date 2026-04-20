"use client";

import { useEffect, useMemo, useState, useRef} from "react";
import AddStockModal from "@/components/modal/stock/AddStock";
import MinusStockModal from "@/components/modal/stock/MinusStock";
import ExpiredStockModal from "@/components/modal/stock/ExpiredStock";
import SupplierReturnModal from "@/components/modal/stock/SupplierReturn";
import DeleteProductModal from "@/components/modal/product/DeleteProduct";
import { TypeProduct, Pagination, ProductForm} from "@/models/type";
import { TypeStock } from "@/models/type_stock";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/context/AuthContext";


export default function ProductStock() {
  const [stock, setStock] = useState<TypeStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedStock, setSelectedStock] = useState<TypeStock | null>(null);
  const [editProduct, setEditProduct] = useState<ProductForm | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [openAddStock, setOpenAddStock] = useState(false);
  const [openMinusStock, setOpenMinusStock] = useState(false);
  const [openExpired, setOpenExpired] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [actionPosition, setActionPosition] = useState({ top: 0, left: 0 });
  const [openSupplierReturn, setOpenSupplierReturn] = useState(false);
  const { role } = useAuth();

  const limit = 10;

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/stock?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setStock(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [page, search]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const toggleAction = (id: string) => {
    setOpenActionId(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
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


  const renderActionMenu = (item: TypeStock) => (
    <>
      {role === "Admin" && (
        <>
          <button
            onClick={() => {
              setSelectedStock(item);
              setOpenExpired(true);
              setOpenActionId(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            ⛔ Tandai Expired
          </button>

          <button
            onClick={() => {
              setSelectedStock(item);
              setOpenAddStock(true);
              setOpenActionId(null);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            ➕ Tambah Stock
          </button>

          <button
            onClick={() => {
              setSelectedStock(item);
              setOpenMinusStock(true);
              setOpenActionId(null);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            ➖ Kurangi Stock
          </button>
        </>
      )}

      <button
        onClick={() => {
          setSelectedStock(item);
          setOpenSupplierReturn(true);
          setOpenActionId(null);
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        🔁 Retur Supplier
      </button>
    </>
  );

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800">
          Manajemen Stok
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
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Expired</th>
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

            {!loading && stock.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {stock.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">
                  Rp {item.price?.toLocaleString()}
                </td>
                <td className="px-4 py-3">{item.qty}</td>
                <td className="px-4 py-3">
                  {new Date(item.exp).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-center relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      const rect = e.currentTarget.getBoundingClientRect();
                      setActionPosition({
                        top: rect.bottom + 6,
                        left: rect.right - 140,
                      });

                      toggleAction(item.id);
                    }}
                    className="rounded-md border px-3 py-1 text-xs bg-white hover:bg-gray-100"
                  >
                    Aksi ▾
                  </button>
                  {openActionId === item.id &&
                    createPortal(
                      <div
                        className="fixed z-50 w-36 rounded-md border bg-white shadow-lg"
                        style={{
                          top: actionPosition.top,
                          left: actionPosition.left,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderActionMenu(item)}
                      </div>,
                      document.body
                    )}
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

        {!loading && stock.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            Data tidak ditemukan
          </div>
        )}

        {stock.map((item) => (
          <div key={item.id} className="border rounded-lg bg-white overflow-hidden">
            <div className="p-3">
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
                  <div
                    className={`text-xs font-medium ${
                      item.qty <= 0 ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    Stok: {item.qty}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                Exp: {new Date(item.exp).toLocaleDateString("id-ID")}
              </div>
            </div>

            <div className="border-t bg-gray-50">
              <button
                type="button"
                onClick={() => toggleAction(item.id)}
                className="w-full py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                {openActionId === item.id ? "Tutup Aksi ▴" : "Aksi ▾"}
              </button>
              {openActionId === item.id && (
                <div className="border-t bg-white">{renderActionMenu(item)}</div>
              )}
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
        {selectedStock && (
          <AddStockModal
            open={openAddStock}
            sid={selectedStock.id}
            productId={selectedStock.product_id}
            onClose={() => setOpenAddStock(false)}
            onSuccess={fetchStock}
          />
        )}
        {selectedStock && (
          <MinusStockModal
            open={openMinusStock}
            sid={selectedStock.id}
            productId={selectedStock.product_id}
            onClose={() => setOpenMinusStock(false)}
            onSuccess={fetchStock}
          />
        )}
        {selectedStock && (
          <ExpiredStockModal
            open={openExpired}
            sid={selectedStock.id}
            productId={selectedStock.product_id}
            onClose={() => setOpenExpired(false)}
            onSuccess={fetchStock}
          />
        )}
        {selectedStock && (
          <SupplierReturnModal
            open={openSupplierReturn}
            sid={selectedStock.id}
            productId={selectedStock.product_id}
            supplierId={selectedStock.supplier_id}
            onClose={() => setOpenSupplierReturn(false)}
            onSuccess={fetchStock}
          />
        )}

    </div>
  );
}
