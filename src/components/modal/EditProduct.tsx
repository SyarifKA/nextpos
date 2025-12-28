"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

const MySwal = withReactContent(Swal);

/* ================= TYPES ================= */

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ProductForm {
  id: number;
  sku: string;
  name: string;
  price: string;
  stock: string;
  expired: string;
  supplier: string;
}

interface ModalContentProps {
  data: ProductForm;
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
}) => {
  return (
    <div className="flex flex-col w-full gap-2">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          px-4 py-3 border border-gray-300 rounded-lg
          placeholder-gray-400 text-md font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
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
  const [local, setLocal] = React.useState<ProductForm>(data);

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-gray-800">
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
          onChange={(e) => setLocal((s) => ({ ...s, sku: e.target.value }))}
        />

        <InputField
          label="Nama Produk"
          value={local.name}
          placeholder="Nama produk"
          onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
        />

        <InputField
          label="Harga"
          type="number"
          value={local.price}
          placeholder="Harga"
          onChange={(e) => setLocal((s) => ({ ...s, price: e.target.value }))}
        />

        <InputField
          label="Quantity"
          type="number"
          value={local.stock}
          placeholder="Stok"
          onChange={(e) => setLocal((s) => ({ ...s, stock: e.target.value }))}
        />

        <InputField
          label="Expired Date"
          type="date"
          value={local.expired}
          placeholder=""
          onChange={(e) => setLocal((s) => ({ ...s, expired: e.target.value }))}
        />

        <InputField
          label="Supplier"
          value={local.supplier}
          placeholder="Supplier"
          onChange={(e) =>
            setLocal((s) => ({ ...s, supplier: e.target.value }))
          }
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
  product: {
    id: number;
    sku: string;
    name: string;
    price: number;
    stock: number;
    expired: string;
    supplier: string;
  } | null;
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
        price: Number(data.price),
        stock: Number(data.stock),
        expired: data.expired,
        supplier: data.supplier,
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
    if (!open || !product) return;

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
              data={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: String(product.price),
                stock: String(product.stock),
                expired: product.expired,
                supplier: product.supplier,
              }}
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
