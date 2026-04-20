"use client";

import React from "react"
import { useEffect, useState } from "react";
import { Pagination , TypeTransaction} from "@/models/type";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, RotateCcw } from "lucide-react";
import PrintConfirmModal from "@/components/modal/print/PrintConfirm";
import CustomerReturnModal from "@/components/modal/transaction/CustomerReturnModal";

export default function HistoryTrxPage() {
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions]=useState<TypeTransaction[]>([])
  const [expandedTrxId, setExpandedTrxId] = useState<string | null>(null)
  const [selectedTrx, setSelectedTrx] = useState<TypeTransaction | null>(null);
  const [openPrint, setOpenPrint] = useState(false);
  const [returnTrx, setReturnTrx] = useState<TypeTransaction | null>(null);
  const [openReturn, setOpenReturn] = useState(false);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/transaction?page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      setTransactions(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };
    
  useEffect(() => {
    fetchTransactions();
  }, [page, search]);


    const handleToggleDetail = (id: string) => {
      setExpandedTrxId((prev) => (prev === id ? null : id))
    }
  
  
    const handlePrintClick = (trx: TypeTransaction) => {
      setSelectedTrx(trx);
      setOpenPrint(true);
    };

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* HEADER */}
      <h1 className="text-xl md:text-3xl font-semibold text-gray-800">
        Riwayat Transaksi
      </h1>

      {/* SEARCH + ACTION */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Cari ID Transaksi / Nama Pelanggan"
          className="w-full md:w-64 rounded-lg border px-3 py-2 text-sm"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto rounded-lg border bg-white">
        <table className="flex flex-col table-zebra table-sm w-full">
            <thead className="flex w-full bg-base-200 border bg-primary text-white">
                <tr className="flex w-full justify-between border px-8 text-center py-2 font-semibold">
                    <td className="w-1/5">Invoice ID</td>
                    <td className="w-1/5">Customer</td>
                    <td className="w-1/5">Total</td>
                    <td className="w-1/5">Tanggal</td>
                    <td className="w-1/5">Aksi</td>
                </tr>
            </thead>
            <tbody className="flex flex-col w-full bg-base-200 border">
              {transactions.map((trx) => (
                <React.Fragment key={trx.id}>
                  <tr className="hover w-full flex justify-between border py-2 px-8 items-start">
                    <td className="w-1/5 text-center">{trx.invoice_id}</td>
                    <td className="w-1/5 text-center">{trx.customer_name || "-"}</td>
                    <td className="w-1/5 text-center">
                      Rp {trx.grand_total.toLocaleString("id-ID")}
                    </td>
                    <td className="w-1/5 text-center">
                      {new Date(trx.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="w-1/5 text-center">
                      <button
                        onClick={() => handleToggleDetail(trx.id)}
                        className="bg-green-400 hover:bg-green-500 px-4 py-2 rounded-md"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedTrxId === trx.id && (
                      <motion.tr
                        key={trx.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex w-full bg-white px-8 py-4 border"
                      >
                        <td colSpan={5} className="w-full">
                          <div id={`trx-print-${trx.id}`} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">Transaction Detail</p>
                                <p className="text-sm">Cashier: {trx.cashier}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setReturnTrx(trx);
                                    setOpenReturn(true);
                                  }}
                                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md"
                                >
                                  <RotateCcw size={16} />
                                  Retur
                                </button>
                                <button
                                  onClick={() => handlePrintClick(trx)}
                                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
                                >
                                  <Printer size={16} />
                                  Print
                                </button>
                              </div>
                            </div>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left">Produk</th>
                                  <th className="text-center">Qty</th>
                                  <th className="text-right">Harga</th>
                                  <th className="text-right">Discount produk</th>
                                  <th className="text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {trx.transaction_detail.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.product_name || "-"}</td>
                                    <td className="text-center">{item.qty}</td>
                                    <td className="text-right">
                                      Rp {item.price.toLocaleString("id-ID")}
                                    </td>
                                    <td className="text-right">
                                      Rp {item.product_discount.toLocaleString("id-ID")}
                                    </td>
                                    <td className="text-right">
                                      Rp {item.total.toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="flex flex-col items-end font-semibold">
                              <span className="text-right">
                                Discount customer : Rp {trx.customer_discount.toLocaleString("id-ID")}
                              </span>
                              Grand Total: Rp {trx.grand_total.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-2">
        {transactions.map((trx) => (
          <div key={trx.id} className="border rounded-lg bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => handleToggleDetail(trx.id)}
              className="w-full p-3 text-left hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {trx.customer_name || "Walk-in"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {trx.invoice_id}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(trx.created_at).toLocaleDateString("id-ID")} &bull;{" "}
                    {trx.cashier}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">
                    Rp {trx.grand_total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">
                    {expandedTrxId === trx.id ? "Tutup ▲" : "Detail ▼"}
                  </div>
                </div>
              </div>
            </button>

            {expandedTrxId === trx.id && (
              <div className="border-t bg-gray-50 p-3">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      setReturnTrx(trx);
                      setOpenReturn(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-2 rounded text-xs font-medium"
                  >
                    <RotateCcw size={14} />
                    Retur
                  </button>
                  <button
                    onClick={() => handlePrintClick(trx)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded text-xs font-medium"
                  >
                    <Printer size={14} />
                    Print
                  </button>
                </div>
                <div className="space-y-1.5">
                  {trx.transaction_detail.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs border-b pb-1.5 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {item.product_name || "-"}
                        </div>
                        <div className="text-gray-500">
                          {item.qty} × Rp {item.price.toLocaleString("id-ID")}
                          {item.product_discount > 0 && (
                            <span className="text-orange-600">
                              {" "}(−{item.product_discount.toLocaleString("id-ID")})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-medium shrink-0 ml-2">
                        Rp {item.total.toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount customer</span>
                    <span>Rp {trx.customer_discount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Grand Total</span>
                    <span>Rp {trx.grand_total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {!loading && transactions.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            Belum ada transaksi.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center md:justify-end gap-1 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
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
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            »
          </button>
        </div>
      )}
      {selectedTrx && (
        <PrintConfirmModal
          open={openPrint}
          transaction={selectedTrx}
          onClose={() => {
            setOpenPrint(false);
            setSelectedTrx(null);
          }}
        />
      )}
      {returnTrx && (
        <CustomerReturnModal
          open={openReturn}
          transaction={returnTrx}
          onClose={() => {
            setOpenReturn(false);
            setReturnTrx(null);
          }}
          onSuccess={() => {
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
