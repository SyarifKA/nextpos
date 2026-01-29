"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditCustomerModal from "@/components/modal/customer/EditCustomer";

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


  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (id) fetchCustomerDetail();
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
              0
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 border">
            <p className="text-xs text-gray-500">Total Nominal</p>
            <p className="text-2xl font-semibold text-green-600">
              Rp 0
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

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID Transaksi</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {customer?.transactions?.length === 0 && (
                <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Belum ada transaksi
                </td>
                </tr>
            )}

            {customer?.transactions.map((trx) => (
                <tr key={trx.id}>
                <td className="px-4 py-3 font-mono">{trx.id}</td>
                <td className="px-4 py-3">
                    {new Date(trx.date).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                    Rp {trx.total.toLocaleString("id-ID")}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
      <EditCustomerModal
        open={openEdit}
        data={data}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchCustomerDetail}
        />
    </div>
  );
}
