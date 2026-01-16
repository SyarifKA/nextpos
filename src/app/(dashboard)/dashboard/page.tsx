"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Users } from "lucide-react"

// ==================
// Dummy data
// ==================
const dailyData = [
  { name: "Mon", value: 120000 },
  { name: "Tue", value: 180000 },
  { name: "Wed", value: 90000 },
  { name: "Thu", value: 200000 },
  { name: "Fri", value: 240000 },
]

const monthlyData = [
  { name: "Jan", value: 3200000 },
  { name: "Feb", value: 2800000 },
  { name: "Mar", value: 4100000 },
]

const yearlyData = [
  { name: "2023", value: 42000000 },
  { name: "2024", value: 52000000 },
  { name: "2025", value: 61000000 },
]

const transactions = [
  { id: "TRX-001", customer: "Andi", total: 75000, date: "2026-01-14" },
  { id: "TRX-002", customer: "Budi", total: 120000, date: "2026-01-14" },
  { id: "TRX-003", customer: "Siti", total: 45000, date: "2026-01-14" },
]

export default function DashboardPOS() {
  const [chartType, setChartType] = useState<"daily" | "monthly" | "yearly">(
    "daily"
  )

  const chartData =
    chartType === "daily"
      ? dailyData
      : chartType === "monthly"
      ? monthlyData
      : yearlyData

  return (
    <div className="flex w-full flex-col p-4 md:p-6 space-y-6">
      {/* ================= SUMMARY ================= */}
      <div className="flex flex-col gap-2">
        <div className="text-semibold text-2xl">Halo! Selamat datang</div>
        <div className="text-bold text-3xl">Suhaimi</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-[#F5FBE6] rounded-md shadow">
          <div className="card-body p-4">
            <div className="flex gap-2 items-center">
              <p className="text-2xl font-bold">3</p>
              <Users />
            </div>
            <p className="text-sm opacity-70">Transaksi Hari Ini</p>
          </div>
        </div>

        <div className="card bg-[#F5FBE6] rounded-md shadow">
          <div className="card-body p-4">
            <div className="flex gap-2 items-center">
              <p className="text-2xl font-bold">365</p>
              <Users />
            </div>
            <p className="text-sm opacity-70">Customer</p>
          </div>
        </div>

        <div className="card bg-[#F5FBE6] rounded-md shadow">
          <div className="card-body p-4">
            <p className="text-2xl font-bold">Rp 240.000</p>
            <p className="text-sm opacity-70">Pendapatan Hari ini</p>
          </div>
        </div>

        <div className="card bg-[#F5FBE6] rounded-md shadow">
          <div className="card-body p-4">
            <p className="text-2xl font-bold">Rp 12.500.000</p>
            <p className="text-sm opacity-70">Pengeluaran Tahun Ini</p>
          </div>
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div className="card bg-base-100 shadow px-8">
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Grafik Transaksi</h2>

            <select
              className="select select-bordered select-sm w-35"
              value={chartType}
              onChange={(e) =>
                setChartType(e.target.value as "daily" | "monthly" | "yearly")
              }
            >
              <option value="daily">Harian</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          <div className="h-65">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= TRANSACTIONS ================= */}
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <h2 className="font-semibold mb-4">Transaksi Terbaru</h2>
                <div className="overflow-x-auto">
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
                    {transactions.map((trx) => (
                        <tr key={trx.id} className="hover flex w-full justify-between border py-2 px-8 items-start">
                            <td className="w-1/5 text-center">{trx.id}</td>
                            <td className="w-1/5 text-center">{trx.customer}</td>
                            <td className="w-1/5 text-center">
                                Rp {trx.total.toLocaleString("id-ID")}
                            </td>
                            <td className="w-1/5 text-center">{trx.date}</td>
                            <td className="w-1/5 text-center"><button className="bg-green-400 hover:bg-green-500 cursor-pointer text-black px-4 py-2 rounded-md">detail</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    </div>
  )
}
