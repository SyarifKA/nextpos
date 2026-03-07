"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect } from "react";

const MySwal = withReactContent(Swal);

/* ================= TYPES ================= */

interface TempoProduct {
  id: string;
  sku: string;
  name: string;
  supplier_name: string;
  price: number;
  discount: number;
  stock: number;
  due_payment: string;
}

interface ConfirmPaymentModalProps {
  open: boolean;
  product: TempoProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

/* ================= MODAL ================= */

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  open,
  product,
  onClose,
  onSuccess,
}) => {
  useEffect(() => {
    if (!open || !product) return;

    const totalPayment = product.price - product.discount;
    const formattedTotal = `Rp ${totalPayment.toLocaleString("id-ID")}`;
    const formattedPrice = `Rp ${product.price.toLocaleString("id-ID")}`;
    const formattedDiscount = product.discount > 0 
      ? `Rp ${product.discount.toLocaleString("id-ID")}` 
      : "Rp 0";

    MySwal.fire({
      icon: "question",
      title: "Konfirmasi Pembayaran",
      html: `
        <div class="text-center">
          <p class="text-gray-700 mb-3">
            Apakah Anda yakin ingin menandai pembayaran ini sebagai lunas?
          </p>
          <div class="rounded-lg bg-gray-100 p-3 text-sm text-left">
            <p><strong>SKU:</strong> ${product.sku}</p>
            <p><strong>Nama:</strong> ${product.name}</p>
            <p><strong>Supplier:</strong> ${product.supplier_name}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <hr class="my-2"/>
            <p><strong>Harga:</strong> ${formattedPrice}</p>
            <p><strong>Discount:</strong> ${formattedDiscount}</p>
            <p class="font-bold text-green-600"><strong>Total Bayar:</strong> ${formattedTotal}</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Bayar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
      allowOutsideClick: true,

      preConfirm: async () => {
        const res = await fetch(
          `/api/product/${product.id}/payment-status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "paid" }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          Swal.showValidationMessage(data.message || "Gagal melakukan pembayaran");
          return;
        }

        return data;
      },

      willClose: () => {
        onClose();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onSuccess();

        MySwal.fire({
          icon: "success",
          title: "Pembayaran Berhasil!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  }, [open, product]);

  return null;
};

export default ConfirmPaymentModal;
