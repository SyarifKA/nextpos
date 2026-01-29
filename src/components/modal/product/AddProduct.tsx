"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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

interface ProductForm {
  sku: string;
  name: string;
  size: string;
  capital: string;
  price: string;
  ppn: string;
  stock: string;
  discount_supplier: string;
  discount_customer: string;
  exp: string;
  supplier: string;
}

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: ProductForm) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose, onSubmit }) => {
  const [local, setLocal] = React.useState<ProductForm>({
    sku: "",
    name: "",
    size: "",
    capital: "",
    price: "",
    ppn: "",
    stock: "",
    discount_customer: "",
    discount_supplier: "",
    exp: "",
    supplier: "",
  });

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Tambah produk baru
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Masukkan informasi produk untuk ditambahkan ke sistem.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="SKU"
          value={local.sku}
          placeholder="Contoh: SKU-001"
          onChange={(e) => setLocal((s) => ({ ...s, sku: e.target.value }))}
        />

        <InputField
          label="Nama Produk"
          value={local.name}
          placeholder="Nama produk"
          onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
        />

        <InputField
          label="Harga beli"
          type="number"
          value={local.capital}
          placeholder="Contoh: 15000"
          onChange={(e) => setLocal((s) => ({ ...s, capital: e.target.value }))}
        />

        <InputField
          label="Harga jual"
          type="number"
          value={local.price}
          placeholder="Contoh: 15000"
          onChange={(e) => setLocal((s) => ({ ...s, price: e.target.value }))}
        />

        <InputField
          label="Discount toko"
          type="number"
          value={local.discount_supplier}
          placeholder="Contoh: 15000"
          onChange={(e) => setLocal((s) => ({ ...s, discount_supplier: e.target.value }))}
        />

        <InputField
          label="Discount pelanggan"
          type="number"
          value={local.discount_customer}
          placeholder="Contoh: 1000"
          onChange={(e) => setLocal((s) => ({ ...s, discount_customer: e.target.value }))}
        />

        <InputField
          label="Quantity"
          type="number"
          value={local.stock}
          placeholder="Jumlah stok"
          onChange={(e) => setLocal((s) => ({ ...s, stock: e.target.value }))}
        />

        <InputField
          label="Size"
          type="text"
          value={local.size}
          placeholder="Ukuran produk"
          onChange={(e) => setLocal((s) => ({ ...s, size: e.target.value }))}
        />
        
        <InputField
          label="PPN"
          type="number"
          value={local.ppn}
          placeholder="Persentase ppn"
          onChange={(e) => setLocal((s) => ({ ...s, ppn: e.target.value }))}
        />

        <InputField
          label="Expired Date"
          type="date"
          value={local.exp}
          placeholder=""
          onChange={(e) => setLocal((s) => ({ ...s, exp: e.target.value }))}
        />

        <InputField
          label="Supplier"
          value={local.supplier}
          placeholder="Nama supplier"
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
          Save Product
        </button>
      </div>
    </div>
  );
};

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: ProductForm) => {
    const res = await fetch("/api/product", {
      method: "POST",
      body: JSON.stringify({
        sku: data.sku,
        name: data.name,
        capital: Number(data.capital),
        price: Number(data.price),
        qty: Number(data.stock),
        exp: data.exp,
        supplier: data.supplier,
      }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
      MySwal.close();

      MySwal.fire({
        icon: "success",
        title: "Product added!",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: "error",
        title: "Failed to add product",
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
  }, [open]);

  return null;
};

export default AddProductModal;
