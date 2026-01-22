"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Transaction = {
  id: string;
  date: string;
  total: number;
};

type CustomerDetail = {
  id: string;
  name: string;
  phone_number: string;
  address: string;
  transactions: Transaction[];
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

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
    address: "-",
    transactions: [],
    };
//   if (!data) {
//     return <div className="p-6 text-gray-500">Data tidak ditemukan</div>;
//   }

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
      <div className="rounded-lg border bg-white p-4 space-y-2">
        <div>
            <span className="text-gray-500 text-sm">ID Customer</span>
            <p className="font-mono">{customer.id}</p>
        </div>

        <div>
            <span className="text-gray-500 text-sm">Nama</span>
            <p>{customer.name}</p>
        </div>

        <div>
            <span className="text-gray-500 text-sm">Nomor Telepon</span>
            <p>{customer.phone_number}</p>
        </div>

        <div>
            <span className="text-gray-500 text-sm">Alamat</span>
            <p>{customer.address}</p>
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
            {customer.transactions.length === 0 && (
                <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Belum ada transaksi
                </td>
                </tr>
            )}

            {customer.transactions.map((trx) => (
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
    </div>
  );
}
