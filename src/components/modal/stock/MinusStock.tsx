"use client";

import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createRoot, Root } from "react-dom/client";

const MySwal = withReactContent(Swal);

interface MinusStockForm {
  product_id: string;
  qty: number;
  note: string;
}

interface ModalContentProps {
  productId: string;
  onClose: () => void;
  onSubmit: (data: MinusStockForm) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  productId,
  onClose,
  onSubmit,
}) => {

const [qty, setQty] = React.useState<string>("1");
const [note, setNote] = React.useState<string>("");

const isValid = Number(qty) > 0;


  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Kurangi Stok Produk
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Masukkan jumlah stok yang akan dikurangi.
      </p>

      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Masukkan jumlah stok"
            />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Catatan</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Masukkan catatan"
            />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          disabled={!isValid}
          onClick={() =>
            onSubmit({
              product_id: productId,
              qty : Number(qty),
              note: note
            })
          }
          className={`px-6 py-3 rounded-lg text-white ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Kurangi Stok
        </button>
      </div>
    </div>
  );
};

interface MinusStockModalProps {
  open: boolean;
  sid: string;   
  productId: string;   
  onClose: () => void;
  onSuccess: () => void;
}

const MinusStockModal: React.FC<MinusStockModalProps> = ({
  open,
  sid,
  productId,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: MinusStockForm) => {
    if (!sid) {
        MySwal.fire({
        icon: "error",
        title: "Stock ID tidak valid",
        });
        return;
    }
    try {
      const res = await fetch(`/api/stock/${sid}/minus`, {
        method: "PUT",
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
          title: "Stok berhasil ditambahkan",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        onClose();
        MySwal.fire({
          icon: "error",
          title: resData?.message || "Gagal menambah stok",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      onClose();
      MySwal.fire({
        icon: "error",
        title: "Gagal menambah stok",
        timer: 1400,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    if (!open) return;

    MySwal.fire({
      html: `<div id="react-swal-container"></div>`,
      showConfirmButton: false,
      allowOutsideClick: true,
      width: "480px",
      padding: 0,
    didOpen: () => {
        const container = document.getElementById("react-swal-container");

        if (!container) return;

        if (!reactRootRef.current) {
            reactRootRef.current = createRoot(container);
        }

        reactRootRef.current.render(
            <ModalContent
            productId={productId}
            onClose={() => {
                MySwal.close();
                onClose();
            }}
            onSubmit={handleSubmit}
            />
        );
        },
      willClose: () => {
        if (reactRootRef.current) {
          reactRootRef.current.unmount();
          reactRootRef.current = null;
        }
        onClose();
      },
    });
  }, [open]);

  return null;
};

export default MinusStockModal;
