"use client";

import React from "react"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditCustomerModal from "@/components/modal/customer/EditCustomer";
import { TypeTransaction, TypeTransactionCustomer } from "@/models/type";
import { motion, AnimatePresence } from "framer-motion";
import { Printer } from "lucide-react";
import PrintConfirmModal from "@/components/modal/print/PrintConfirm";

type Transaction = {
  id: string;
  date: string;
  total: number;
};

type CustomerDetail = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  transactions: Transaction[];
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [openEdit, setOpenEdit] = useState(false);
  const [transactionCustomer, setTransactionCustomer]=useState<TypeTransactionCustomer|null>(null)
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTrxId, setExpandedTrxId] = useState<string | null>(null)
  const [selectedTrx, setSelectedTrx] = useState<TypeTransaction | null>(null);
  const [openPrint, setOpenPrint] = useState(false);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer/${id}`);
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error("Failed fetch customer detail", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionCust = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transaction/customer/${id}`);
      const json = await res.json();
      setTransactionCustomer(json.data);
    } catch (err) {
      console.error("Failed fetch customer detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerDetail();
    if (id) fetchTransactionCust();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  const customer = data ?? {
    id: "-",
    name: "-",
    phone_number: "-",
    email: "-",
    transactions: [],
    };

      
    const handlePrintClick = (trx: TypeTransaction) => {
      setSelectedTrx(trx);
      setOpenPrint(true);
    };

    const handleToggleDetail = (id: string) => {
      setExpandedTrxId((prev) => (prev === id ? null : id))
    }
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-4 rounded-lg"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Detail Pelanggan
        </h1>
      </div>

      {/* CUSTOMER INFO */}
      <div className="rounded-xl border bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-gray-800">Informasi Pelanggan</h2>
          <button
            onClick={() => setOpenEdit(true)}
            className="text-sm text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition"
          >
            ✏️ Edit
          </button>
        </div>

        {/* SUMMARY (HARDCODE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b bg-gray-50">
          <div className="rounded-lg bg-white p-4 border">
            <p className="text-xs text-gray-500">Jumlah Transaksi</p>
            <p className="text-2xl font-semibold">
              {transactionCustomer?.total_transaction}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 border">
            <p className="text-xs text-gray-500">Total Nominal</p>
            <p className="text-2xl font-semibold text-green-600">
              Rp {transactionCustomer?.total_amount?.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* DETAIL */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">ID Customer</p>
            <p className="font-mono text-sm">{customer.id}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Nama</p>
            <p className="font-medium">{customer.name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Nomor Telepon</p>
            <p>{customer.phone_number}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p>{customer.email}</p>
          </div>
        </div>
      </div>



      {/* TRANSAKSI */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 font-semibold">
          Riwayat Transaksi
        </div>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="flex flex-col table-zebra table-sm w-full">
              <thead className="flex w-full bg-base-200 border bg-primary text-white">
                  <tr className="flex w-full justify-between border px-8 text-center py-2 font-semibold">
                      <td className="w-1/5">ID</td>
                      <td className="w-1/5">Customer</td>
                      <td className="w-1/5">Total</td>
                      <td className="w-1/5">Tanggal</td>
                      <td className="w-1/5">Aksi</td>
                  </tr>
              </thead>
              <tbody className="flex flex-col w-full bg-base-200 border">
                {transactionCustomer?.transaction?.length === 0 && (
                    <tr>
                    <td colSpan={3} className="px-4 py-6 flex justify-center text-center text-gray-500">
                        Belum ada transaksi
                    </td>
                    </tr>
                )}
                {transactionCustomer?.transaction?.map((trx) => (
                  <React.Fragment key={trx.id}>
                    {/* ===== MAIN ROW ===== */}
                    <tr className="hover w-full flex justify-between border py-2 px-8 items-start">
                      <td className="w-1/5 text-center">{trx.id}</td>
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
                    {/* ===== DETAIL ROW ===== */}
                    <AnimatePresence>
                      {expandedTrxId === trx.id && (
                        <motion.tr
                          key={trx.id} // wajib key
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
                                <button
                                  onClick={() => handlePrintClick(trx)}
                                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
                                >
                                  <Printer size={16} />
                                  Print
                                </button>
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
      </div>
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
      <EditCustomerModal
        open={openEdit}
        data={data}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchCustomerDetail}
        />
    </div>
  );
}
