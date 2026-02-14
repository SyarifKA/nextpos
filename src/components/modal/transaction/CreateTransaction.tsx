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

      // preConfirm: async () => {
      //   try {
      //     const res = await fetch(
      //       "/api/transaction",
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //         body: JSON.stringify(transaction),
      //       }
      //     );
      //     try {
      //     const res = await fetch(
      //       "http://localhost:8008/print",
      //       {
      //             method: "POST",
      //             headers: {
      //               "Content-Type": "application/json",
      //             },
      //             body: JSON.stringify(transaction),
      //           }
      //         );
                
      //           if (!res.ok) {
      //             const data = await res.json();
      //             Swal.showValidationMessage(
      //             data?.message || "Gagal melakukan print"
      //           );
      //           return false;
      //         }
                  
      //             return true;
      //           } catch (err) {
      //         Swal.showValidationMessage("Tidak dapat terhubung ke server");
      //         return false;
      //       }

      //     if (!res.ok) {
      //       const data = await res.json();
      //       Swal.showValidationMessage(
      //         data?.message || "Gagal melakukan Transaction"
      //       );
      //       return false;
      //     }

      //     return true;
      //   } catch (err) {
      //     Swal.showValidationMessage("Tidak dapat terhubung ke server");
      //     return false;
      //   }
      // },

      // preConfirm: async () => {
      //   if (!transaction) return false;

      //   try {
      //     // 1️⃣ Kirim transaksi
      //     const trxRes = await fetch("/api/transaction", {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify(transaction),
      //     });

      //     if (!trxRes.ok) {
      //       const data = await trxRes.json();
      //       Swal.showValidationMessage(data?.statusMessage || "Gagal melakukan transaksi");
      //       return false;
      //     }

      //     // Ambil response JSON
      //     const resJson = await trxRes.json();

      //     // Pastikan ada data
      //     if (!resJson.data) {
      //       Swal.showValidationMessage("Data transaksi kosong dari server");
      //       return false;
      //     }

      //     const trxData = resJson.data;

      //     // 2️⃣ Kirim data transaksi ke print
      //     try {
      //       const printRes = await fetch("http://localhost:8008/print", {
      //         method: "POST",
      //         headers: { "Content-Type": "application/json" },
      //         body: JSON.stringify(trxData),
      //       });

      //       if (!printRes.ok) {
      //         const data = await printRes.json();
      //         Swal.showValidationMessage(data?.message || "Gagal print");
      //         return false;
      //       }
      //     } catch (err) {
      //       Swal.showValidationMessage("Tidak dapat terhubung ke server print");
      //       return false;
      //     }

      //     return true; // transaksi + print berhasil
      //   } catch (err) {
      //     Swal.showValidationMessage("Tidak dapat terhubung ke server transaksi");
      //     return false;
      //   }
      // },

      preConfirm: async () => {
        if (!transaction) return false;

        try {
          // 1️⃣ Kirim transaksi (WAJIB SUKSES)
          const trxRes = await fetch("/api/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction),
          });

          if (!trxRes.ok) {
            const data = await trxRes.json();
            Swal.showValidationMessage(
              data?.statusMessage || "Gagal melakukan transaksi"
            );
            return false;
          }

          const resJson = await trxRes.json();

          if (!resJson.data) {
            Swal.showValidationMessage("Data transaksi kosong dari server");
            return false;
          }

          const trxData = resJson.data;

          // 2️⃣ Print (TIDAK BOLEH GAGALKAN TRANSAKSI)
          fetch("http://localhost:8008/print", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trxData),
          })
            .then((res) => {
              if (!res.ok) {
                console.warn("Print gagal");
              }
            })
            .catch(() => {
              console.warn("Tidak bisa konek ke printer service");
            });

          return true; // ✅ transaksi tetap sukses
        } catch (err) {
          Swal.showValidationMessage("Tidak dapat terhubung ke server transaksi");
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
