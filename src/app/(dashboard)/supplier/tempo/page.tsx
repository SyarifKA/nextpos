"use client";

import { useEffect, useState, useRef } from "react";
import { TempoProduct, Pagination } from "@/models/type";
import ConfirmPaymentModal from "@/components/modal/tempo/ConfirmPayment";
import { CreditCard } from "lucide-react";

export default function TempoProductPage() {
  const [products, setProducts] = useState<TempoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  
  // Modal state
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TempoProduct | null>(null);

  const limit = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/product/tempo?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setProducts(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Tempo Products", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data to get total unpaid count
  const fetchTotalUnpaid = async () => {
    try {
      const res = await fetch(
        `/api/product/tempo?page=1&limit=1000&search=&get_all=true`
      );
      const json = await res.json();
      
      if (json.total_unpaid !== undefined) {
        setTotalUnpaid(json.total_unpaid);
      } else if (json.data) {
        // Fallback: calculate from data if total_unpaid not returned
        const unpaid = json.data.filter((p: TempoProduct) => p.status === "not_paid").length;
        setTotalUnpaid(unpaid);
      }
    } catch (error) {
      console.error("Failed fetch total unpaid", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTotalUnpaid();
  }, [page, search]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Helper: generate page numbers with ellipsis
  const getPaginationPages = (current: number, total: number): (number | "...")[] => {
    const delta = 1;
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

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === "") {
      return "-";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_paid":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Belum Lunas
          </span>
        );
      case "paid":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Lunas
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const handlePaymentClick = (product: TempoProduct) => {
    setSelectedProduct(product);
    setOpenPayment(true);
  };

  const handlePaymentSuccess = () => {
    fetchProducts();
    fetchTotalUnpaid();
    setOpenPayment(false);
    setSelectedProduct(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Produk Tempo (Hutang Supplier)
        </h1>
        <p className="text-gray-500 mt-1">
          Daftar produk yang pembayarannya menggunakan sistem tempo
        </p>
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
        
        {/* Summary Cards */}
        <div className="flex gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <span className="text-xs text-red-600 font-medium">Belum Lunas</span>
            <p className="text-lg font-bold text-red-700">
              {totalUnpaid}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <span className="text-xs text-green-600 font-medium">Total Items</span>
            <p className="text-lg font-bold text-green-700">
              {pagination?.total_data || 0}
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">Barcode</th>
              <th className="px-4 py-3 text-left">Nama Produk</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-left">Jatuh Tempo</th>
              <th className="px-4 py-3 text-right">Total Bayar</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {products.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{item.sku}</td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">{item.supplier_name}</td>
                <td className="px-4 py-3 text-center">{item.stock}</td>
                <td className="px-4 py-3">
                  {formatDate(item.due_payment)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">
                  {formatCurrency((item.price - item.discount)*item.stock)}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.status === "not_paid" && (
                    <button
                      onClick={() => handlePaymentClick(item)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Bayar"
                    >
                      <CreditCard size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-end items-center gap-1 mt-3">
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

      {/* PAYMENT MODAL */}
      <ConfirmPaymentModal
        open={openPayment}
        product={selectedProduct}
        onClose={() => {
          setOpenPayment(false);
          setSelectedProduct(null);
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
