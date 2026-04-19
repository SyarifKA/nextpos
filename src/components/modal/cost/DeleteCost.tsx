"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect } from "react";

const MySwal = withReactContent(Swal);

interface DeleteCostModalProps {
  open: boolean;
  cost: {
    id: string;
    name: string;
    amount: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteCostModal: React.FC<DeleteCostModalProps> = ({
  open,
  cost,
  onClose,
  onSuccess,
}) => {
  useEffect(() => {
    if (!open || !cost) return;

    MySwal.fire({
      icon: "warning",
      title: "Hapus Pengeluaran",
      html: `
        <div class="text-center">
          <p class="text-gray-700">
            Apakah kamu yakin ingin menghapus pengeluaran berikut?
          </p>
          <div class="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
            <p><strong>Nama:</strong> ${cost.name}</p>
            <p><strong>Nominal:</strong> Rp ${cost.amount.toLocaleString("id-ID")}</p>
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
        const res = await fetch(`/api/cost/${cost.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          Swal.showValidationMessage(
            data?.statusMessage || "Gagal menghapus pengeluaran"
          );
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
          title: "Pengeluaran dihapus!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  }, [open, cost]);

  return null;
};

export default DeleteCostModal;
