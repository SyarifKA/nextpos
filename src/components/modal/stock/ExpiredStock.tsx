"use client";

import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createRoot, Root } from "react-dom/client";

const MySwal = withReactContent(Swal);

interface ExpiredStockPayload {
  product_id: string;
}

interface ModalContentProps {
  productId: string;
  onClose: () => void;
  onSubmit: (data: ExpiredStockPayload) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  productId,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-red-600">
        Tandai Stok Expired
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Stok ini akan ditandai sebagai <b>expired</b> dan tidak dapat digunakan
        kembali.
      </p>

      <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Pastikan produk yang dipilih benar.  
        Aksi ini <b>tidak dapat dibatalkan</b>.
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSubmit({
              product_id: productId,
            })
          }
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white"
        >
          Tandai Expired
        </button>
      </div>
    </div>
  );
};

interface ExpiredStockModalProps {
  open: boolean;
  sid: string;          // stock_id
  productId: string;   // payload
  onClose: () => void;
  onSuccess: () => void;
}

const ExpiredStockModal: React.FC<ExpiredStockModalProps> = ({
  open,
  sid,
  productId,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: ExpiredStockPayload) => {
    if (!sid) {
      MySwal.fire({
        icon: "error",
        title: "Stock ID tidak valid",
      });
      return;
    }

    try {
      const res = await fetch(`/api/stock/${sid}/expired`, {
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
          title: "Stok berhasil ditandai expired",
          timer: 1300,
          showConfirmButton: false,
        });
      } else {
        onClose();
        MySwal.fire({
          icon: "error",
          title: resData?.message || "Gagal menandai stok expired",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      onClose();
      MySwal.fire({
        icon: "error",
        title: "Terjadi kesalahan",
        timer: 1500,
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

export default ExpiredStockModal;
