"use client";

import { useEffect, useMemo, useState, useRef} from "react";
import AddStockModal from "@/components/modal/stock/AddStock";
import ExpiredStockModal from "@/components/modal/stock/ExpiredStock";
import SupplierReturnModal from "@/components/modal/stock/SupplierReturn";
import DeleteProductModal from "@/components/modal/product/DeleteProduct";
import { TypeProduct, Pagination, ProductForm} from "@/models/type";
import { TypeStock } from "@/models/type_stock";
import { createPortal } from "react-dom";


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
  const [openExpired, setOpenExpired] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [actionPosition, setActionPosition] = useState({ top: 0, left: 0 });
  const [openSupplierReturn, setOpenSupplierReturn] = useState(false);



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


  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
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

          {/* <select
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
          </select> */}
        </div>

        {/* <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + Tambah Produk
        </button> */}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">SKU</th>
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
                        left: rect.right - 140, // 140 = width dropdown
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
                            setOpenSupplierReturn(true);
                            setOpenActionId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          🔁 Retur Supplier
                        </button>

                      </div>,
                      document.body
                    )}

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
