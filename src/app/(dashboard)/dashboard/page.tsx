"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Users, Printer } from "lucide-react"
import { TypeTransaction, Pagination } from "@/models/type"
import PrintConfirmModal from "@/components/modal/print/PrintConfirm"
import React from "react"
import { motion, AnimatePresence } from "framer-motion";
import { DashboardData } from "@/models/type_dashboard"
import { useAuth } from "@/lib/context/AuthContext"

function SummaryCard({
  title,
  value,
  accent,
}: {
  title: string
  value: string | undefined
  accent: string
}) {
  return (
    <div className={`rounded-lg p-4 shadow ${accent}`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default function DashboardPOS() {
  const [chartType, setChartType] = useState<"daily" | "monthly" | "yearly">( "daily")
  const [transactions, setTransactions]=useState<TypeTransaction[]>([])
  const [dataDashboard, setDataDashboard]=useState<DashboardData| null>(null)
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [expandedTrxId, setExpandedTrxId] = useState<string | null>(null)
  const [selectedTrx, setSelectedTrx] = useState<TypeTransaction | null>(null);
  const {role, username} = useAuth()

  // Filter state
  const [filter, setFilter] = useState<"today" | "week" | "month" | "year">("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchDataDashboard = async () => {
    try {
      setLoading(true);
      
      // Build query params
      let queryParams = "";
      if (startDate && endDate) {
        queryParams = `?start_date=${startDate}&end_date=${endDate}`;
      } else {
        queryParams = `?filter=${filter}`;
      }
      
      const res = await fetch(
        `/api/dashboard${queryParams}`
      );
      const json = await res.json();

      setDataDashboard(json.data);
    } catch (error) {
      console.error("Failed fetch data dashboard", error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchDataDashboard();
  }, [filter]);

  useEffect(() => {
    fetchTransactions();
  }, [page, search]);

  const chartData =
    chartType === "daily"
      ? dataDashboard?.daily_data
      : chartType === "monthly"
      ? dataDashboard?.monthly_data
      : dataDashboard?.yearly_data

  const chartColor =
    chartType === "daily"
      ? "#22c55e"   // green
      : chartType === "monthly"
      ? "#3b82f6"   // blue
      : "#f59e0b";  // amber


  const handleToggleDetail = (id: string) => {
    setExpandedTrxId((prev) => (prev === id ? null : id))
  }

  const [openPrint, setOpenPrint] = useState(false);

  const handlePrintClick = (trx: TypeTransaction) => {
    setSelectedTrx(trx);
    setOpenPrint(true);
  };

  return (
    <div className="flex w-full flex-col p-4 md:p-6 space-y-6">
      {/* ================= SUMMARY ================= */}
      <div className="flex flex-col gap-2">
        <div className="text-semibold text-2xl">Halo! Selamat datang</div>
        <div className="text-bold text-3xl">{username}</div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          {/* Filter Dropdown */}
          <div className="flex flex-col gap-1.5 min-w-40">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Periode</label>
            <select
              className="select select-bordered select-sm bg-gray-50 border-gray-200 rounded-lg"
              value={startDate && endDate ? "custom" : filter}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  return;
                }
                setFilter(e.target.value as "today" | "week" | "month" | "year");
                setStartDate("");
                setEndDate("");
              }}
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {startDate && endDate ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rentang Tanggal</label>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                  {startDate} - {endDate}
                </span>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setFilter("today");
                  }}
                  className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom Tanggal</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="input input-bordered input-sm bg-gray-50 border-gray-200 rounded-lg"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-gray-400 font-medium">-</span>
                <input
                  type="date"
                  className="input input-bordered input-sm bg-gray-50 border-gray-200 rounded-lg"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Transaksi"
          value={`${dataDashboard?.total_transaction.toLocaleString()}`}
          accent="bg-green-100 text-green-700"
        />
        <SummaryCard
          title="Customer"
          value={`${dataDashboard?.total_customers.toLocaleString()}`}
          accent="bg-blue-100 text-blue-700"
        />
        <SummaryCard
          title="Total Pendapatan"
          value={`Rp ${dataDashboard?.amount_transaction.toLocaleString()}`}
          accent="bg-emerald-100 text-emerald-700"
        />
        {
          role == 'Admin' &&(
            <>
              <SummaryCard
              title="Pengeluaran"
              value={`Rp ${dataDashboard?.cost.toLocaleString()}`}
              accent="bg-red-100 text-red-700"
              />
              <SummaryCard
              title="Laba Kotor"
              value={`Rp ${dataDashboard?.gross_profit.toLocaleString()}`}
              accent="bg-purple-100 text-purple-700"
              />
            </>
          )
        }
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
              <LineChart data={chartData}  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                {/* <XAxis dataKey="name" padding={{ left: 20, right: 20 }}/> */}
                <XAxis dataKey="name"/>
                <YAxis />
                <Tooltip />
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={800}
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
                            <td className="w-1/5">Pelanggan</td>
                            <td className="w-1/5">Total</td>
                            <td className="w-1/5">Tanggal</td>
                            <td className="w-1/5">Aksi</td>
                        </tr>
                    </thead>
                    <tbody className="flex flex-col w-full bg-base-200 border">
                      {transactions.map((trx) => (
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
                                        <p className="font-semibold">Detail Transaksi</p>
                                        <p className="text-sm">Kasir: {trx.cashier}</p>
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
    </div>
  )
}
