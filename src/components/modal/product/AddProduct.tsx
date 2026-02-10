"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { InputProps} from "@/models/type";
import { TypeSupplier } from "@/models/type_supplier";

const MySwal = withReactContent(Swal);

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
  supplier_id: string;
}

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: ProductForm) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose, onSubmit }) => {
  const [suppliers, setSuppliers] = React.useState<TypeSupplier[]>([]);
  const [loadingSupplier, setLoadingSupplier] = React.useState(false);
  const [supplierSearch, setSupplierSearch] = React.useState("");
  const [showSupplierList, setShowSupplierList] = React.useState(false);


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
    supplier_id: "",
  });

  const fetchSuppliers = async () => {
    try {
      setLoadingSupplier(true);

      let page = 1;
      let totalPages = 1;
      let allSuppliers: TypeSupplier[] = [];

      do {
        const res = await fetch(`/api/supplier?page=${page}&limit=10`);
        const json = await res.json();

        allSuppliers = allSuppliers.concat(json.data || []);
        totalPages = json.pagination?.total_pages || 1;
        page++;
      } while (page <= totalPages);

      setSuppliers(allSuppliers);
    } catch (err) {
      console.error("Failed fetch suppliers", err);
    } finally {
      setLoadingSupplier(false);
    }
  };

  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s) =>
    s.company_name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  React.useEffect(() => {
    const close = () => setShowSupplierList(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const capitalNum = Number(local.capital || 0);
  const priceNum = Number(local.price || 0);
  const discCust = Number(local.discount_customer || 0);
  const discSup = Number(local.discount_supplier || 0);
  const qty = Number(local.stock || 0);
  const ppnPercent = Number(local.ppn || 0);

  const ppnTotal = capitalNum * ppnPercent / 100;

  const costPerUnit = React.useMemo(() => {
    if (capitalNum <= 0 || qty <= 0) return 0;
    return (capitalNum + ppnTotal - discSup) / qty;
  }, [capitalNum, ppnTotal, discSup, qty]);

  const sellingPerUnit = React.useMemo(() => {
    return priceNum - discCust;
  }, [priceNum, discCust]);

  const marginValue = React.useMemo(() => {
    if (costPerUnit <= 0) return 0;
    return sellingPerUnit - costPerUnit;
  }, [sellingPerUnit, costPerUnit]);

  const marginPercent = React.useMemo(() => {
    if (costPerUnit <= 0) return 0;
    return (marginValue / costPerUnit) * 100;
  }, [marginValue, costPerUnit]);

  const isFormValid = React.useMemo(() => {
    return (
      local.sku.trim() !== "" &&
      local.name.trim() !== "" &&
      Number(local.capital) > 0 &&
      Number(local.price) > 0 &&
      Number(local.stock) > 0 &&
      local.size.trim() !== "" &&
      local.exp !== "" &&
      local.supplier_id !== ""
    );
  }, [local]);



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
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, sku: e.target.value }))}
        />

        <InputField
          label="Nama Produk"
          value={local.name}
          placeholder="Nama produk"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
        />

        <InputField
          label="Harga beli"
          type="number"
          value={local.capital}
          placeholder="Contoh: 15000"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, capital: e.target.value }))}
        />

        <InputField
          label="Harga jual"
          type="number"
          value={local.price}
          placeholder="Contoh: 15000"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, price: e.target.value }))}
        />

        <InputField
          label="Discount dari supplier"
          type="number"
          value={local.discount_supplier}
          placeholder="Contoh: 15000"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, discount_supplier: e.target.value }))}
        />

        <InputField
          label="Discount pelanggan"
          type="number"
          value={local.discount_customer}
          placeholder="Contoh: 1000"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, discount_customer: e.target.value }))}
        />

        <InputField
          label="Quantity"
          type="number"
          value={local.stock}
          placeholder="Jumlah stok"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, stock: e.target.value }))}
        />

        <InputField
          label="Size"
          type="text"
          value={local.size}
          placeholder="Ukuran produk"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, size: e.target.value }))}
        />
        
        <InputField
          label="PPN"
          type="number"
          value={local.ppn}
          placeholder="Persentase ppn"
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, ppn: e.target.value }))}
        />

        <InputField
          label="Expired Date"
          type="date"
          value={local.exp}
          placeholder=""
          className=""
          onChange={(e) => setLocal((s) => ({ ...s, exp: e.target.value }))}
        />

        {/* MARGIN INFO */}


        <div className="flex flex-col w-full gap-2 relative">
          <label className="font-medium text-gray-700">Supplier</label>

          {/* INPUT */}
          <input
            type="text"
            value={
              suppliers.find((s) => s.id === local.supplier_id)?.company_name ||
              supplierSearch
            }
            placeholder={loadingSupplier ? "Loading supplier..." : "Cari supplier"}
            onFocus={() => setShowSupplierList(true)}
            onChange={(e) => {
              setSupplierSearch(e.target.value);
              setLocal((s) => ({ ...s, supplier_id: "" }));
              setShowSupplierList(true);
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* DROPDOWN LIST */}
          {showSupplierList && (
            <div
              className="
              absolute top-full left-0 right-0 mt-1
              z-50 bg-white border rounded-lg shadow
              max-h-52 overflow-y-auto
              "
            >
              {filteredSuppliers.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Supplier tidak ditemukan
                </div>
              )}

              {filteredSuppliers.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setLocal((prev) => ({ ...prev, supplier_id: s.id }));
                    setSupplierSearch("");
                    setShowSupplierList(false);
                  }}
                  className="
                  px-4 py-2 cursor-pointer
                  hover:bg-blue-50
                  "
                >
                  {s.company_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 bg-gray-50 border rounded-lg px-4 py-3">
          <span className="text-sm text-gray-500">Margin</span>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Nominal
            </span>
            <span
              className={`font-semibold ${
                marginValue < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              Rp {marginValue.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Persentase
            </span>
            <span
              className={`font-semibold ${
                marginPercent < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {marginPercent.toFixed(2)}%
            </span>
          </div>
        </div>


        {marginValue < 0 && (
          <p className="text-sm text-red-600 mt-1">
            ⚠ Harga jual lebih rendah dari harga beli
          </p>
        )}


        {/* <div className="flex flex-col w-full gap-2">
          <label className="font-medium text-gray-700">Supplier</label>

          <select
            value={local.supplier_id}
            onChange={(e) =>
              setLocal((s) => ({ ...s, supplier_id: e.target.value }))
            }
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {loadingSupplier ? "Loading supplier..." : "Pilih Supplier"}
            </option>

            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company_name}
              </option>
            ))}
          </select>
        </div> */}

        {/* <InputField
          label="Supplier"
          value={local.supplier_id}
          placeholder="Nama supplier"
          className=""
          onChange={(e) =>
            setLocal((s) => ({ ...s, supplier_id: e.target.value }))
          }
        /> */}
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          disabled={!isFormValid}
          onClick={() => onSubmit(local)}
          className={`px-6 py-3 rounded-lg text-white ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
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
        size: data.size,
        capital: Number(data.capital),
        price: Number(data.price),
        qty: Number(data.stock),
        ppn: Number(data.ppn),
        discount_supplier: Number(data.discount_supplier),
        discount_customer: Number(data.discount_customer),
        // exp: data.exp,
        exp: data.exp
        ? new Date(`${data.exp}T00:00:00Z`).toISOString()
        : null,
        supplier_id: data.supplier_id,
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
      onClose()
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
