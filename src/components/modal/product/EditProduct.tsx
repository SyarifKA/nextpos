"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { ProductForm } from "@/models/type";

const MySwal = withReactContent(Swal);

/* ================= TYPES ================= */

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ModalContentProps {
  data: ProductForm | null;
  onClose: () => void;
  onSubmit: (data: ProductForm) => void;
}

/* ================= INPUT FIELD ================= */

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}) => {
  return (
    <div className="flex flex-col w-full gap-2">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          px-4 py-3 border border-gray-300 rounded-lg
          placeholder-gray-400 text-md font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
        `}
      />
    </div>
  );
};

/* ================= MODAL CONTENT ================= */

const ModalContent: React.FC<ModalContentProps> = ({
  data,
  onClose,
  onSubmit,
}) => {
  const [local, setLocal] = React.useState<ProductForm>({
    id: data?.id ?? "",
    sku: data?.sku ?? "",
    name: data?.name ?? "",
    size: data?.size ?? "",
    price: data? String(data.price) : "",
    stock: data? String(data.stock) : "",
    exp: data?.exp ?? "",
    supplier_name: data?.supplier_name ?? "",
    discount_customer: data? String(data.discount_customer) : "",
  });

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Edit Product
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Perbarui informasi produk.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="SKU"
          value={local.sku}
          placeholder="SKU"
          disabled
          onChange={(e) => setLocal((s) => ({ ...s, sku: e.target.value }))}
        />

        <InputField
          label="Nama Produk"
          value={local.name}
          placeholder="Nama produk"
          onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
        />

        <InputField
          label="Size"
          value={local.size}
          placeholder="Size (contoh: 50ml)"
          onChange={(e) => setLocal((s) => ({ ...s, size: e.target.value }))}
        />

        <InputField
          label="Harga"
          type="number"
          value={local.price}
          placeholder="Harga"
          onChange={(e) => setLocal((s) => ({ ...s, price: e.target.value }))}
        />

        <InputField
          label="Discount Customer"
          type="number"
          value={local.discount_customer}
          placeholder="Discount Customer"
          onChange={(e) => setLocal((s) => ({ ...s, discount_customer: e.target.value }))}
        />

        <InputField
          label="Expired Date"
          type="date"
          value={local.exp}
          placeholder=""
          onChange={(e) => setLocal((s) => ({ ...s, exp: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={() => onSubmit(local)}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Update Product
        </button>
      </div>
    </div>
  );
};

/* ================= MAIN MODAL ================= */

interface EditProductModalProps {
  open: boolean;
  product: ProductForm | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  product,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: ProductForm) => {
    const res = await fetch(`/api/product/${data.id}`, {
      method: "PUT",
      body: JSON.stringify({
        sku: data.sku,
        name: data.name,
        size: data.size,
        exp: data.exp ? new Date(data.exp).toISOString() : "",
        price: Number(data.price),
        discount_customer: Number(data.discount_customer) || 0,
      }),
    });

    if (res.ok) {
      onSuccess();
      MySwal.close();

      MySwal.fire({
        icon: "success",
        title: "Product updated!",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: "error",
        title: "Failed to update product",
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
              data={product}
              onClose={() => {
                MySwal.close();
                onClose();
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
  }, [open, product]);

  return null;
};

export default EditProductModal;
