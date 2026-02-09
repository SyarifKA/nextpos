"use client";

import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createRoot, Root } from "react-dom/client";

const MySwal = withReactContent(Swal);

interface SupplierReturnForm {
  supplier_id: string;
  product_id: string;
  reason: "damaged" | "expired";
  qty: number;
}

interface ModalContentProps {
  supplierId: string;
  productId: string;
  onClose: () => void;
  onSubmit: (data: SupplierReturnForm) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  supplierId,
  productId,
  onClose,
  onSubmit,
}) => {
  const [qty, setQty] = React.useState<string>("1");
  const [reason, setReason] =
    React.useState<"damaged" | "expired">("damaged");

  const isValid = Number(qty) > 0 && supplierId !== "";

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Retur ke Supplier
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Masukkan alasan dan jumlah produk yang akan diretur.
      </p>

      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Alasan Retur</label>
          <select
            value={reason}
            onChange={(e) =>
              setReason(e.target.value as "damaged" | "expired")
            }
            className="px-4 py-3 border border-gray-300 rounded-lg"
          >
            <option value="damaged">Rusak</option>
            <option value="expired">Kadaluarsa</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Masukkan jumlah retur"
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
              supplier_id: supplierId,
              product_id: productId,
              reason,
              qty: Number(qty),
            })
          }
          className={`px-6 py-3 rounded-lg text-white ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Retur Supplier
        </button>
      </div>
    </div>
  );
};

interface SupplierReturnModalProps {
  open: boolean;
  sid: string;
  productId: string;
  supplierId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SupplierReturnModal: React.FC<SupplierReturnModalProps> = ({
  open,
  sid,
  productId,
  supplierId,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: SupplierReturnForm) => {
    try {
      const res = await fetch(`/api/stock/${sid}/supplier-return`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json().catch(() => null);

      if (res.ok) {
        onSuccess();
        onClose()
        MySwal.close();
        MySwal.fire({
          icon: "success",
          title: "Retur ke supplier berhasil",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        onClose()
        MySwal.fire({
          icon: "error",
          title: resData?.message || "Gagal retur ke supplier",
        });
      }
    } catch {
      MySwal.fire({
        icon: "error",
        title: "Gagal retur ke supplier",
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
            supplierId={supplierId}
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
        reactRootRef.current?.unmount();
        reactRootRef.current = null;
        onClose();
      },
    });
  }, [open]);

  return null;
};

export default SupplierReturnModal;
