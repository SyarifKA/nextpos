"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect } from "react";

import { useAuth } from "@/lib/context/AuthContext";

const MySwal = withReactContent(Swal);

interface ExitModalProps {
  open: boolean;
  onClose: () => void;
//   onSuccess: () => void;
}

const ExitModal: React.FC<ExitModalProps> = ({
  open,
  onClose,
}) => {
      const { logout } = useAuth();
  useEffect(() => {
    if (!open) return;

    MySwal.fire({
      icon: "warning",
      title: "Keluar?",
      html: `
        <div class="text-center">
          <p class="text-gray-700">
            Apakah kamu yakin ingin keluar dari aplikasi?
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
      allowOutsideClick: true,

      preConfirm: async () => {
        const res = await logout();

        // if (!res.ok) {
        //   Swal.showValidationMessage("Gagal keluar dari aplikasi");
        //   return;
        // }

        return true;
      },

      willClose: () => {
        onClose();
      },
    })
    // .then((result) => {
    //   if (result.isConfirmed) {
    //     onSuccess();

    //     MySwal.fire({
    //       icon: "success",
    //       title: "Product deleted!",
    //       timer: 1200,
    //       showConfirmButton: false,
    //     });
    //   }
    // });
  }, [open]);

  return null;
};

export default ExitModal;