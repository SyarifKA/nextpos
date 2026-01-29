"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect } from "react";

const MySwal = withReactContent(Swal);

/* ================= TYPES ================= */

interface DeleteProductModalProps {
  open: boolean;
  product: {
    id: string;
    sku: string;
    name: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

/* ================= MODAL ================= */

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  open,
  product,
  onClose,
  onSuccess,
}) => {
  useEffect(() => {
    if (!open || !product) return;

    MySwal.fire({
      icon: "warning",
      title: "Delete Product",
      html: `
        <div class="text-center">
          <p class="text-gray-700">
            Apakah kamu yakin ingin menghapus produk berikut?
          </p>
          <div class="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
            <p><strong>SKU:</strong> ${product.sku}</p>
            <p><strong>Nama:</strong> ${product.name}</p>
          </div>
          <p class="mt-3 text-red-600 text-sm">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
      allowOutsideClick: true,

      preConfirm: async () => {
        const res = await fetch(`/api/product/${product.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          Swal.showValidationMessage("Gagal menghapus produk");
          return;
        }

        return true;
      },

      willClose: () => {
        onClose();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onSuccess();

        MySwal.fire({
          icon: "success",
          title: "Product deleted!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  }, [open, product]);

  return null;
};

export default DeleteProductModal;
