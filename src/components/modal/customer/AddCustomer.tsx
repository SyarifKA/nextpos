"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  placeholder: string;
  as?: "input" | "textarea";
  value: string;
  type?: string;
  className: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  as = "input",
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

      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
};

interface CustomerForm {
  name: string;
  phone_number: string;
  address: string;
}

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: CustomerForm) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose, onSubmit }) => {
  const [local, setLocal] = React.useState<CustomerForm>({
    name: "",
    phone_number: "",
    address: "",
  });

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Tambah pelanggan baru
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Masukkan informasi pelanggan untuk ditambahkan ke sistem.
      </p>

        <div className="flex flex-col gap-2">
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                label="Nama"
                as="input"
                value={local.name}
                className=""
                placeholder="Contoh: Fulan"
                onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
                />

                <InputField
                label="Nomor telpon"
                as="input"
                value={local.phone_number}
                className=""
                placeholder="Nomor telpon"
                onChange={(e) => setLocal((s) => ({ ...s, phone_number: e.target.value }))}
                />

            </div>
                <InputField
                label="Alamat"
                as="textarea"
                type="text"
                className="min-h-32"
                value={local.address}
                placeholder="jl. kebahagiaan"
                onChange={(e) => setLocal((s) => ({ ...s, address: e.target.value }))}
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

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: CustomerForm) => {
    const res = await fetch("/api/customer", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        phone_number: data.phone_number,
        address: data.address
      }),
    });

    if (res.ok) {
      onSuccess();
      MySwal.close();

      MySwal.fire({
        icon: "success",
        title: "Customer added!",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: "error",
        title: "Failed to add Customer",
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

export default AddCustomerModal;
