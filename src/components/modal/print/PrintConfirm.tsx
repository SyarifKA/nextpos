"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useEffect } from "react";
import { TypeTransaction } from "@/models/type";

const MySwal = withReactContent(Swal);

interface PrintConfirmModalProps {
  open: boolean;
  onClose: () => void;
  transaction: TypeTransaction | null;
}

const PrintConfirmModal: React.FC<PrintConfirmModalProps> = ({
  open,
  onClose,
  transaction,
}) => {
  useEffect(() => {
    if (!open && !transaction) return;

    MySwal.fire({
      icon: "question",
      title: "Print Transaction?",
      html: `
        <div class="text-center">
          <p class="text-gray-700">
            Apakah kamu yakin ingin mencetak transaksi ini?
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Print",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
      allowOutsideClick: false,

      preConfirm: async () => {
        try {
          const res = await fetch(
            "http://localhost:8008/print",
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
              data?.message || "Gagal melakukan print"
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
          title: "Print Success",
          text: "Transaksi berhasil dikirim ke printer",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }, [open, transaction]);

  return null;
};

export default PrintConfirmModal;
