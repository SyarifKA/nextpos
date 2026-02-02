"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useEffect } from "react";
import { PayloadTransaction, TypeTransaction } from "@/models/type";

const MySwal = withReactContent(Swal);

interface TransactionConfirmModalProps {
  open: boolean;
  onClose: () => void;
  transaction: PayloadTransaction | null;
  onSuccess: () => void;
}

const TransactionConfirmModal: React.FC<TransactionConfirmModalProps> = ({
  open,
  onClose,
  transaction,
  onSuccess,
}) => {
  useEffect(() => {
    if (!open && !transaction) return;

    MySwal.fire({
      icon: "question",
      title: "Buat transaksi?",
      html: `
        <div class="text-center">
          <p class="text-gray-700">
            Apakah kamu yakin ingin melakukan transaksi ini?
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, lanjutkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
      allowOutsideClick: false,

      preConfirm: async () => {
        try {
          const res = await fetch(
            "/api/transaction",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(transaction),
            }
          );

          if (!res.ok) {
            const data = await res.json();
            Swal.showValidationMessage(
              data?.message || "Gagal melakukan Transaction"
            );
            return false;
          }

          return true;
        } catch (err) {
          Swal.showValidationMessage("Tidak dapat terhubung ke server");
          return false;
        }
      },

      willClose: () => {
        onClose();
      },
    }).then((result) => {
      if (result.isConfirmed) {
          MySwal.fire({
              icon: "success",
              title: "Transaksi berhasil",
              text: "Transaksi berhasil dibuat",
              timer: 1500,
              showConfirmButton: false,
            });
        onSuccess();
        onClose();
      }
    });
  }, [open, transaction]);

  return null;
};

export default TransactionConfirmModal;
