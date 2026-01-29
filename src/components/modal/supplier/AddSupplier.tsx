"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { InputProps } from "@/models/type";

const MySwal = withReactContent(Swal);

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}) => {
  const baseClass = `
    px-4 py-3 border border-gray-300 rounded-lg
    placeholder-gray-400 text-md font-medium
    focus:outline-none focus:ring-2 focus:ring-blue-500
    ${className}
  `;

  return (
    <div className="flex flex-col w-full gap-2">
      <label className="font-medium text-gray-700">{label}</label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClass}
        />
    </div>
  );
};

interface SupplierForm {
  company_name: string;
  phone_company: string;
  sales_name: string;
  phone_sales: string;
}

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: SupplierForm) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose, onSubmit }) => {
  const [local, setLocal] = React.useState<SupplierForm>({
    company_name: "",
    phone_company: "",
    sales_name: "",
    phone_sales: "",
  });

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Tambah supplier baru
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Masukkan informasi supplier untuk ditambahkan ke sistem.
      </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
            label="Nama perusahaan"
            value={local.company_name}
            className=""
            placeholder="Contoh: PT Maju Jaya"
            onChange={(e) => setLocal((s) => ({ ...s, company_name: e.target.value }))}
            />
            <InputField
            label="Nomor perusahaan"
            type="text"
            value={local.phone_company}
            className=""
            placeholder="Nomor telpon"
            onChange={(e) => setLocal((s) => ({ ...s, phone_company: e.target.value }))}
            />
            <InputField
            label="Nama sales"
            value={local.sales_name}
            className=""
            placeholder="Contoh: Hidayat"
            onChange={(e) => setLocal((s) => ({ ...s, sales_name: e.target.value }))}
            />
            <InputField
            label="Nomor sales"
            type="text"
            value={local.phone_sales}
            className=""
            placeholder="Nomor telpon"
            onChange={(e) => setLocal((s) => ({ ...s, phone_sales: e.target.value }))}
            />
          </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
          Batal
        </button>

        <button
          onClick={() => onSubmit(local)}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Simpan
        </button>
      </div>
    </div>
  );
};

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: SupplierForm) => {
    const res = await fetch("/api/supplier", {
      method: "POST",
      body: JSON.stringify({
        company_name: data.company_name,
        phone_company: data.phone_company,
        sales_name: data.sales_name,
        phone_sales: data.phone_sales
      }),
    });

    if (res.ok) {
      onSuccess();
      MySwal.close();
        onClose()
      MySwal.fire({
        icon: "success",
        title: "Supplier added!",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: "error",
        title: "Failed to add supplier",
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
      width: "680px",
      padding: 0,

      didOpen: () => {
        const container = document.getElementById("react-swal-container");
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(
            <ModalContent
              onClose={() => {
                MySwal.close();
              }}
              onSubmit={handleSubmit}
            />
          );
        }
      },
      willClose: () => {
        if (reactRootRef.current) {
          reactRootRef.current.unmount();
          reactRootRef.current = null;
        }
        onClose()
      },
    });
  }, [open]);

  return null;
};

export default AddSupplierModal;
