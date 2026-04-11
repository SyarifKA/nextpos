"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

import { useAuth } from "@/lib/context/AuthContext";
import { TypeTransaction } from "@/models/type";

const MySwal = withReactContent(Swal);

interface ExitModalContentProps {
  username: string;
  onLogout: () => void;
  onSettlement: () => void;
  onCancel: () => void;
  settling: boolean;
}

const ExitModalContent: React.FC<ExitModalContentProps> = ({
  username,
  onLogout,
  onSettlement,
  onCancel,
  settling,
}) => {
  return (
    <div className="flex flex-col w-full p-6 text-center">
      <div className="text-5xl mb-4">👋</div>
      <h2 className="text-2xl font-semibold text-gray-800">
        Mau keluar, {username}?
      </h2>
      <p className="text-gray-500 mt-2 text-sm">
        Pilih aksi yang ingin dilakukan sebelum keluar.
      </p>

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={onSettlement}
          disabled={settling}
          className="w-full px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:bg-blue-300"
        >
          {settling ? "Memproses Settlement..." : "🧾 Settlement & Print"}
        </button>

        <button
          onClick={onLogout}
          className="w-full px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
        >
          Keluar Tanpa Settlement
        </button>

        <button
          onClick={onCancel}
          className="w-full px-5 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
        >
          Batal
        </button>
      </div>
    </div>
  );
};

interface ExitModalProps {
  open: boolean;
  onClose: () => void;
}

type SettlementItem = {
  product_name: string;
  product_size: string;
  qty: number;
  price: number;
  total: number;
};

const ExitModal: React.FC<ExitModalProps> = ({ open, onClose }) => {
  const { logout, username } = useAuth();
  const reactRootRef = useRef<Root | null>(null);
  const settlingRef = useRef(false);

  const fetchAllTodayTransactions = async (): Promise<TypeTransaction[]> => {
    const allTrx: TypeTransaction[] = [];
    let page = 1;
    const limit = 100;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await fetch(
        `/api/transaction?page=${page}&limit=${limit}`
      );
      const json = await res.json();
      const data: TypeTransaction[] = json.data || [];

      if (data.length === 0) break;

      allTrx.push(...data);

      const totalPages = json.pagination?.total_pages || 1;
      if (page >= totalPages) break;
      page++;
    }

    return allTrx;
  };

  const handleSettlement = async () => {
    if (settlingRef.current) return;
    settlingRef.current = true;

    // Force re-render the modal content
    renderModalContent(true);

    try {
      const allTrx = await fetchAllTodayTransactions();

      // Filter: only today's transactions by current cashier
      const today = new Date();
      const todayStr = today.toLocaleDateString("id-ID");

      const myTrx = allTrx.filter((trx) => {
        const trxDate = new Date(trx.created_at).toLocaleDateString("id-ID");
        return trx.cashier === username && trxDate === todayStr;
      });

      if (myTrx.length === 0) {
        MySwal.close();
        onClose();
        MySwal.fire({
          icon: "info",
          title: "Tidak ada transaksi",
          text: "Belum ada transaksi hari ini untuk di-settlement.",
          timer: 2000,
          showConfirmButton: false,
        });
        settlingRef.current = false;
        return;
      }

      // Group details by product_name + product_size + effective_price
      const groupMap = new Map<string, SettlementItem>();

      for (const trx of myTrx) {
        for (const detail of trx.transaction_detail) {
          const effectivePrice = detail.price - detail.product_discount;
          const key = `${detail.product_name}|${detail.product_size}|${effectivePrice}`;

          const existing = groupMap.get(key);
          if (existing) {
            existing.qty += detail.qty;
            existing.total += effectivePrice * detail.qty;
          } else {
            groupMap.set(key, {
              product_name: detail.product_name,
              product_size: detail.product_size,
              qty: detail.qty,
              price: effectivePrice,
              total: effectivePrice * detail.qty,
            });
          }
        }
      }

      const items = Array.from(groupMap.values());
      const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
      const totalSales = items.reduce((sum, i) => sum + i.total, 0);

      const settlementPayload = {
        cashier: username || "",
        date: today.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
          " " +
          today.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        items,
        total_qty: totalQty,
        total_sales: totalSales,
      };

      // Send to printer
      await fetch("http://localhost:8008/print-settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settlementPayload),
      })
        .then((res) => {
          if (!res.ok) console.warn("Settlement print failed");
        })
        .catch(() => {
          console.warn("Tidak bisa konek ke printer service");
        });

      MySwal.close();
      onClose();
      await MySwal.fire({
        icon: "success",
        title: "Settlement Selesai",
        html: `<div class="text-center">
          <p>Total: <strong>${myTrx.length}</strong> transaksi</p>
          <p>Penjualan: <strong>Rp ${totalSales.toLocaleString("id-ID")}</strong></p>
        </div>`,
        timer: 3000,
        showConfirmButton: false,
      });

      logout();
    } catch (err) {
      console.error("Settlement error:", err);
      MySwal.close();
      onClose();
      MySwal.fire({
        icon: "error",
        title: "Gagal Settlement",
        text: "Terjadi kesalahan saat memproses settlement.",
      });
    } finally {
      settlingRef.current = false;
    }
  };

  const renderModalContent = (settling: boolean) => {
    const container = document.getElementById("react-swal-exit-container");
    if (!container) return;

    if (!reactRootRef.current) {
      reactRootRef.current = createRoot(container);
    }

    reactRootRef.current.render(
      <ExitModalContent
        username={username || ""}
        onLogout={() => {
          MySwal.close();
          onClose();
          logout();
        }}
        onSettlement={handleSettlement}
        onCancel={() => {
          MySwal.close();
          onClose();
        }}
        settling={settling}
      />
    );
  };

  useEffect(() => {
    if (!open) return;

    MySwal.fire({
      html: `<div id="react-swal-exit-container"></div>`,
      showConfirmButton: false,
      allowOutsideClick: true,
      width: "420px",
      padding: 0,
      didOpen: () => {
        renderModalContent(false);
      },
      willClose: () => {
        reactRootRef.current?.unmount();
        reactRootRef.current = null;
        onClose();
      },
    });
  }, [open]);

  return null;
};

export default ExitModal;
