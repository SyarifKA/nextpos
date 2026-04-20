"use client";

import React from "react"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditSupplierModal from "@/components/modal/supplier/EditSupplier";
import { TypeProduct, TypeTransaction, TypeTransactionCustomer } from "@/models/type";
import { motion, AnimatePresence } from "framer-motion";
import { Printer } from "lucide-react";
import PrintConfirmModal from "@/components/modal/print/PrintConfirm";
import { TypeSupplier } from "@/models/type_supplier";

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
  const [supplier, setSupplier]= useState<TypeSupplier | null>(null)
  const [loading, setLoading] = useState(true);
  const [expandedTrxId, setExpandedTrxId] = useState<string | null>(null)
  const [selectedTrx, setSelectedTrx] = useState<TypeTransaction | null>(null);
  const [openPrint, setOpenPrint] = useState(false);
  const [productsSupplier, setProductsSupplier]= useState<TypeProduct[]>([])

  const fetchSupplierDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/supplier/${id}`);
      const json = await res.json();
      setSupplier(json.data);
    } catch (err) {
      console.error("Failed fetch supplier detail", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsSupplier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/product/supplier/${id}`);
      const json = await res.json();
      setProductsSupplier(json.data);
    } catch (err) {
      console.error("Failed fetch supplier detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSupplierDetail();
    if (id) fetchProductsSupplier();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
    
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 md:px-4 rounded-lg"
        >
          ← Kembali
        </button>
        <h1 className="text-lg md:text-2xl font-semibold text-gray-800">
          Detail Supplier
        </h1>
      </div>

      {/* SUPPLIER INFO */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-3 md:px-4 py-3 gap-2">
          <h2 className="font-semibold text-gray-800 text-sm md:text-base">
            Informasi Supplier
          </h2>
          <button
            onClick={() => setOpenEdit(true)}
            className="text-xs md:text-sm text-blue-600 hover:bg-blue-600 hover:text-white px-3 md:px-4 py-2 rounded-lg transition shrink-0"
          >
            ✏️ Edit
          </button>
        </div>

        <div className="p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs text-gray-500">Nama perusahaan</p>
            <p className="font-medium text-sm">{supplier?.company_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nama sales</p>
            <p className="text-sm">{supplier?.sales_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nomor telepon perusahaan</p>
            <p className="font-medium text-sm">{supplier?.phone_company || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nomor telepon sales</p>
            <p className="text-sm">{supplier?.phone_sales || "-"}</p>
          </div>
        </div>
      </div>

      {/* Product */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-3 md:px-4 py-3 font-semibold text-sm md:text-base">
          List Produk
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Nama Produk</th>
                <th className="px-4 py-3 text-left">Harga</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Expired</th>
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

              {!loading && productsSupplier.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              )}

              {productsSupplier.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">{item.sku}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">
                    Rp {item.price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    Rp {item?.discount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{item.stock}</td>
                  <td className="px-4 py-3">
                    {new Date(item.exp).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden p-3 space-y-2">
          {loading && (
            <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
          )}

          {!loading && productsSupplier.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              Data tidak ditemukan
            </div>
          )}

          {productsSupplier.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                    {item.sku}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">
                    Rp {item.price?.toLocaleString()}
                  </div>
                  {item.discount > 0 && (
                    <div className="text-xs text-green-600">
                      -Rp {item.discount.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t">
                <span className="text-gray-500">
                  Stok: <strong className="text-gray-800">{item.stock}</strong>
                </span>
                <span className="text-gray-500">
                  Exp: {new Date(item.exp).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          ))}
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
      <EditSupplierModal
        open={openEdit}
        data={supplier}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchSupplierDetail}
        />
    </div>
  );
}
