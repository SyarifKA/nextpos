"use client";

import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createRoot, Root } from "react-dom/client";
import { TypeTransaction, TypeTransactionDetail } from "@/models/type";

const MySwal = withReactContent(Swal);

const CONDITIONS = [
  { value: "baik", label: "Baik" },
  { value: "rusak", label: "Rusak" },
  { value: "kadaluarsa", label: "Kadaluarsa" },
];

interface ModalContentProps {
  transaction: TypeTransaction;
  onClose: () => void;
  onSubmit: (data: {
    transaction_detail_id: string;
    stock_id: string;
    qty: number;
    condition: string;
    reason: string;
  }) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  transaction,
  onClose,
  onSubmit,
}) => {
  const [selectedDetail, setSelectedDetail] =
    React.useState<TypeTransactionDetail | null>(null);
  const [qty, setQty] = React.useState("");
  const [condition, setCondition] = React.useState("baik");
  const [reason, setReason] = React.useState("");
  const [stockId, setStockId] = React.useState("");
  const [loadingStock, setLoadingStock] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch stock_id when a detail is selected
  const fetchStock = async (detail: TypeTransactionDetail) => {
    setLoadingStock(true);
    try {
      const res = await fetch(
        `/api/stock?page=1&limit=10&search=${encodeURIComponent(detail.product_name)}`
      );
      const json = await res.json();
      const stocks = json.data || [];
      const match =
        stocks.find(
          (s: { product_id: string }) => s.product_id === detail.product_id
        ) || stocks[0];
      setStockId(match?.id || "");
    } catch {
      setStockId("");
    } finally {
      setLoadingStock(false);
    }
  };

  const handleSelectDetail = (detail: TypeTransactionDetail) => {
    setSelectedDetail(detail);
    setQty("");
    setCondition("baik");
    setReason("");
    fetchStock(detail);
  };

  const sellingPrice = selectedDetail
    ? selectedDetail.price - selectedDetail.product_discount
    : 0;
  const refundPreview = Number(qty) > 0 ? sellingPrice * Number(qty) : 0;
  const isValid =
    selectedDetail &&
    Number(qty) > 0 &&
    Number(qty) <= selectedDetail.qty &&
    stockId !== "" &&
    !loadingStock &&
    !submitting;

  return (
    <div className="flex flex-col w-full p-6 text-start max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-primary">Retur Customer</h2>
      <p className="text-gray-600 text-sm mt-1">
        Transaksi: <strong>{transaction.id}</strong> &bull; Customer:{" "}
        <strong>{transaction.customer_name || "Anonim"}</strong>
      </p>

      {/* Product selection */}
      <div className="mt-4">
        <label className="font-medium text-gray-700 text-sm">
          Pilih produk yang akan diretur:
        </label>
        <div className="space-y-2 mt-2">
          {transaction.transaction_detail.map((detail) => (
            <button
              key={detail.id}
              type="button"
              onClick={() => handleSelectDetail(detail)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                selectedDetail?.id === detail.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{detail.product_name}</span>
                  <span className="text-gray-400 ml-2 text-sm">
                    {detail.product_size}
                  </span>
                </div>
                <div className="text-right text-sm">
                  <div>Qty: {detail.qty}</div>
                  <div className="text-gray-500">
                    @ Rp{" "}
                    {(
                      detail.price - detail.product_discount
                    ).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Return form */}
      {selectedDetail && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 text-sm">
              Qty Retur (maks: {selectedDetail.qty})
            </label>
            <input
              type="number"
              min={1}
              max={selectedDetail.qty}
              value={qty}
              onChange={(e) => {
                const val = e.target.value;
                if (
                  val === "" ||
                  (Number(val) >= 0 && Number(val) <= selectedDetail.qty)
                ) {
                  setQty(val);
                }
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Jumlah retur"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 text-sm">
              Kondisi Barang
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 text-sm">
              Alasan Retur
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan retur..."
              rows={3}
              className="px-4 py-3 border border-gray-300 rounded-lg resize-none"
            />
          </div>

          {/* Refund preview */}
          {refundPreview > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Estimasi Refund:</p>
              <p className="text-xl font-bold text-blue-700">
                Rp {refundPreview.toLocaleString("id-ID")}
              </p>
            </div>
          )}

          {loadingStock && (
            <p className="text-sm text-gray-400">Mencari data stok...</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Batal
        </button>
        <button
          disabled={!isValid}
          onClick={() => {
            if (!selectedDetail) return;
            setSubmitting(true);
            onSubmit({
              transaction_detail_id: selectedDetail.id,
              stock_id: stockId,
              qty: Number(qty),
              condition,
              reason,
            });
          }}
          className={`px-6 py-3 rounded-lg text-white ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Memproses..." : "Proses Retur"}
        </button>
      </div>
    </div>
  );
};

interface CustomerReturnModalProps {
  open: boolean;
  transaction: TypeTransaction;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerReturnModal: React.FC<CustomerReturnModalProps> = ({
  open,
  transaction,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: {
    transaction_detail_id: string;
    stock_id: string;
    qty: number;
    condition: string;
    reason: string;
  }) => {
    try {
      const res = await fetch("/api/customer-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json().catch(() => null);

      if (res.ok) {
        onSuccess();
        onClose();
        MySwal.close();
        MySwal.fire({
          icon: "success",
          title: "Retur berhasil",
          text: `Refund: Rp ${(resData?.data?.refund_amount || 0).toLocaleString("id-ID")}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        MySwal.close();
        onClose();
        MySwal.fire({
          icon: "error",
          title: "Gagal membuat retur",
          text: resData?.statusMessage || "Terjadi kesalahan",
        });
      }
    } catch {
      MySwal.close();
      onClose();
      MySwal.fire({
        icon: "error",
        title: "Gagal membuat retur",
        text: "Tidak dapat terhubung ke server",
      });
    }
  };

  useEffect(() => {
    if (!open) return;

    MySwal.fire({
      html: `<div id="react-swal-return-container"></div>`,
      showConfirmButton: false,
      allowOutsideClick: true,
      width: "560px",
      padding: 0,
      didOpen: () => {
        const container = document.getElementById(
          "react-swal-return-container"
        );
        if (!container) return;

        if (!reactRootRef.current) {
          reactRootRef.current = createRoot(container);
        }

        reactRootRef.current.render(
          <ModalContent
            transaction={transaction}
            onClose={() => {
              MySwal.close();
              onClose();
            }}
            onSubmit={handleSubmit}
          />
        );
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

export default CustomerReturnModal;
