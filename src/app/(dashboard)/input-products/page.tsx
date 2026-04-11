"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { TypeProduct } from "@/models/type";

interface Supplier {
  id: string;
  company_name: string;
}

interface ProductItemForm {
  sku: string;
  name: string;
  size: string;
  qty: string;
  exp: string;
  price: string;
  discount_customer: string;
  capital: string;
}

interface ProductForm {
  supplier_id: string;
  discount_supplier: string;
  ppn: string;
  payment_method: "cash" | "tempo";
  due_payment: string;
  status: "paid" | "not_paid";
  product: ProductItemForm[];
}

const defaultProductItem: ProductItemForm = {
  sku: "",
  name: "",
  size: "",
  qty: "",
  exp: "",
  price: "",
  discount_customer: "",
  capital: "",
};

const getDefaultForm = (): ProductForm => ({
  supplier_id: "",
  discount_supplier: "",
  ppn: "",
  payment_method: "cash",
  due_payment: "",
  status: "paid",
  product: [{ ...defaultProductItem }],
});



export default function AddProductPage() {
  const [form, setForm] = useState<ProductForm>(getDefaultForm());
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  // ================= PRODUCT SEARCH PER ROW =================
  const [searchQueries, setSearchQueries] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<TypeProduct[][]>([[]]);
  const [openDropdown, setOpenDropdown] = useState<boolean[]>([false]);
  const searchTimeouts = useRef<(NodeJS.Timeout | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const searchProduct = useCallback(async (query: string, index: number) => {
    if (!query.trim()) {
      setSearchResults((prev) => {
        const updated = [...prev];
        updated[index] = [];
        return updated;
      });
      return;
    }
    try {
      const res = await fetch(`/api/product?page=1&limit=5&search=${encodeURIComponent(query)}`);
      const json = await res.json();
      setSearchResults((prev) => {
        const updated = [...prev];
        updated[index] = json.data || [];
        return updated;
      });
    } catch {
      // silent fail
    }
  }, []);

  const handleSearchChange = (index: number, value: string) => {
    setSearchQueries((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setOpenDropdown((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });

    // debounce 300ms
    if (searchTimeouts.current[index]) {
      clearTimeout(searchTimeouts.current[index]!);
    }
    searchTimeouts.current[index] = setTimeout(() => {
      searchProduct(value, index);
    }, 300);
  };

  const selectProduct = (index: number, product: TypeProduct) => {
    updateProduct(index, "sku", product.sku);
    updateProduct(index, "name", product.name);
    updateProduct(index, "size", product.size);
    updateProduct(index, "price", String(product.price));
    updateProduct(index, "discount_customer", String(product.discount_customer));
    updateProduct(index, "capital", String(product.capital));

    setSearchQueries((prev) => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });
    setSearchResults((prev) => {
      const updated = [...prev];
      updated[index] = [];
      return updated;
    });
    setOpenDropdown((prev) => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setOpenDropdown((prev) =>
        prev.map((open, i) => {
          if (open && dropdownRefs.current[i] && !dropdownRefs.current[i]!.contains(e.target as Node)) {
            return false;
          }
          return open;
        })
      );
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const calculateProduct = (p: ProductItemForm) => {
    const capital = Number(p.capital || 0);
    const price = Number(p.price || 0);
    const qty = Number(p.qty || 0);
    const discCust = Number(p.discount_customer || 0);
    const totalDiscSup = Number(form.discount_supplier || 0);
    const ppnPercent = Number(form.ppn || 0);

    // 1️⃣ total gross semua produk
    const totalGross = form.product.reduce(
        (acc, item) =>
        acc + Number(item.capital || 0) * Number(item.qty || 0),
        0
    );

    // 2️⃣ gross produk ini
    const itemGross = capital * qty;

    // 3️⃣ distribusi diskon proporsional (SAMA PERSIS DENGAN BE)
    let discountPortion = 0;
    if (totalGross > 0 && totalDiscSup > 0) {
        discountPortion = Math.floor(
            (itemGross * totalDiscSup) / totalGross
        );
    }

    const discountPerUnit = qty > 0
    ? Math.floor(discountPortion / qty)
    : 0;

    // 4️⃣ modal setelah diskon
    const baseCapital = capital - discountPerUnit;

    // 5️⃣ pajak dihitung SETELAH diskon (sama seperti BE)
    const tax =
        ppnPercent > 0
        ? (baseCapital * ppnPercent) / 100
        : 0;

    const finalCapital = baseCapital + tax;

    const sellingPerUnit = price - discCust;

    const marginPerUnit =
        sellingPerUnit - finalCapital;

    const marginPercent =
        finalCapital > 0
        ? (marginPerUnit / finalCapital) * 100
        : 0;

    const totalCost = finalCapital * qty;
    const totalSelling = sellingPerUnit * qty;
    const totalMargin = marginPerUnit * qty;

    return {
        costPerUnit: finalCapital,
        sellingPerUnit,
        marginPerUnit,
        marginPercent,
        totalCost,
        totalSelling,
        totalMargin,
    };
    };


    const grandTotal = form.product.reduce(
    (acc, p) => {
        const calc = calculateProduct(p);
        return {
        totalCost: acc.totalCost + calc.totalCost,
        totalSelling: acc.totalSelling + calc.totalSelling,
        totalMargin: acc.totalMargin + calc.totalMargin,
        };
    },
    { totalCost: 0, totalSelling: 0, totalMargin: 0 }
    );



  // ================= FETCH SUPPLIER =================
  useEffect(() => {
    const fetchSupplier = async () => {
      const res = await fetch("/api/supplier");
      const json = await res.json();
      setSuppliers(json.data || []);
    };
    fetchSupplier();
  }, []);

  console.log(suppliers)

  // ================= PRODUCT ROW =================
  const addRow = () => {
    setForm((s) => ({
      ...s,
      product: [...s.product, { ...defaultProductItem }],
    }));
    setSearchQueries((prev) => [...prev, ""]);
    setSearchResults((prev) => [...prev, []]);
    setOpenDropdown((prev) => [...prev, false]);
  };

  const removeRow = (index: number) => {
    setForm((s) => ({
      ...s,
      product: s.product.filter((_, i) => i !== index),
    }));
    setSearchQueries((prev) => prev.filter((_, i) => i !== index));
    setSearchResults((prev) => prev.filter((_, i) => i !== index));
    setOpenDropdown((prev) => prev.filter((_, i) => i !== index));
  };

  const numericFields: (keyof ProductItemForm)[] = [
    "qty", "capital", "price", "discount_customer",
  ];

  const updateProduct = (
    index: number,
    field: keyof ProductItemForm,
    value: string
  ) => {
    if (numericFields.includes(field) && value !== "" && Number(value) < 0) return;
    const updated = [...form.product];
    updated[index][field] = value;
    setForm({ ...form, product: updated });
  };

  const updateFormNumeric = (field: "discount_supplier" | "ppn", value: string) => {
    if (value !== "" && Number(value) < 0) return;
    setForm({ ...form, [field]: value });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id: form.supplier_id,
          discount_supplier: Number(form.discount_supplier),
          ppn: Number(form.ppn),
          payment_method: form.payment_method,
          due_payment:
            form.payment_method === "tempo"
              ? form.due_payment
              : null,
          status: form.status,
          product: form.product.map((p) => ({
            sku: p.sku,
            name: p.name,
            size: p.size,
            qty: Number(p.qty),
            capital: Number(p.capital),
            price: Number(p.price),
            discount_customer: Number(p.discount_customer),
            exp: p.exp
              ? new Date(`${p.exp}T00:00:00Z`).toISOString()
              : null,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Product berhasil ditambahkan");

      // 🔥 RESET FORM
      setForm(getDefaultForm());
      setSearchQueries([""]);
      setSearchResults([[]]);
      setOpenDropdown([false]);

    } catch (err) {
      alert("Gagal menambahkan product");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>

      {/* ================= HEADER SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Supplier */}
        <div className="flex flex-col gap-2">
          <label>Supplier</label>
          <select
            value={form.supplier_id}
            onChange={(e) =>
              setForm({ ...form, supplier_id: e.target.value })
            }
            className="border px-4 py-3 rounded-lg"
          >
            <option value="">Pilih Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company_name}
              </option>
            ))}
          </select>
        </div>



        {/* Payment */}
        <div className="flex flex-col gap-2">
          <label>Payment Method</label>
          <select
            value={form.payment_method}
            onChange={(e) =>
              setForm({
                ...form,
                payment_method: e.target.value as any,
                status:
                  e.target.value === "cash"
                    ? "paid"
                    : "not_paid",
                due_payment:
                  e.target.value === "cash"
                    ? ""
                    : form.due_payment,
              })
            }
            className="border px-4 py-3 rounded-lg"
          >
            <option value="cash">Cash</option>
            <option value="tempo">Tempo</option>
          </select>
        </div>

        {/* Due Date */}
        {form.payment_method === "tempo" && (
          <div className="flex flex-col gap-2">
            <label>Due Payment</label>
            <input
              type="date"
              value={form.due_payment}
              onChange={(e) =>
                setForm({
                  ...form,
                  due_payment: e.target.value,
                })
              }
              className="border px-4 py-3 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* ================= GLOBAL DISCOUNT & PPN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <label>Discount Supplier</label>
          <input
            type="number"
            min="0"
            value={form.discount_supplier}
            onChange={(e) => updateFormNumeric("discount_supplier", e.target.value)}
            className="border px-4 py-3 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>PPN (%)</label>
          <input
            type="number"
            min="0"
            value={form.ppn}
            onChange={(e) => updateFormNumeric("ppn", e.target.value)}
            className="border px-4 py-3 rounded-lg"
          />
        </div>
      </div>

        <div className="bg-blue-50 border rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-4">Summary</h3> 
            <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                <p className="text-gray-500">Total Modal</p>
                <p className="font-semibold">
                    Rp {grandTotal.totalCost.toLocaleString()}
                </p>
                </div>  
                <div>
                <p className="text-gray-500">Total Penjualan</p>
                <p className="font-semibold">
                    Rp {grandTotal.totalSelling.toLocaleString()}
                </p>
                </div>  
                <div>
                <p className="text-gray-500">Total Margin</p>
                <p
                    className={`font-semibold ${
                    grandTotal.totalMargin < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                >
                    Rp {grandTotal.totalMargin.toLocaleString()}
                </p>
                </div>
            </div>
        </div>
      {/* ================= PRODUCT LIST ================= */}
      <h2 className="text-xl font-semibold mb-4">Daftar Produk</h2>

      {form.product.map((item, index) => {
        const calc = calculateProduct(item);
        return(
        <div
          key={index}
          className="border rounded-xl p-6 mb-6 relative bg-gray-100"
        >
          {form.product.length > 1 && (
            <button
              onClick={() => removeRow(index)}
              className="absolute top-3 right-3 text-red-500"
            >
              ✕
            </button>
          )}

          {/* Search Product */}
          <div
            ref={(el) => { dropdownRefs.current[index] = el; }}
            className="relative mb-4"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Cari produk (nama / barcode)..."
              value={searchQueries[index] || ""}
              onChange={(e) => handleSearchChange(index, e.target.value)}
              onFocus={() =>
                setOpenDropdown((prev) => {
                  const updated = [...prev];
                  updated[index] = true;
                  return updated;
                })
              }
              className="w-full pl-10 pr-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {openDropdown[index] && (searchResults[index]?.length ?? 0) > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-60 overflow-auto">
                {searchResults[index].map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectProduct(index, product)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-gray-400 ml-2 text-sm">{product.size}</span>
                      </div>
                      <span className="text-sm text-gray-500">Rp {product.price.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      SKU: {product.sku} • Stok: {product.stock}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Barcode"
              value={item.sku}
              onChange={(e) =>
                updateProduct(index, "sku", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              placeholder="Nama produk"
              value={item.name}
              onChange={(e) =>
                updateProduct(index, "name", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              placeholder="Ukuran"
              value={item.size}
              onChange={(e) =>
                updateProduct(index, "size", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              type="number"
              min="0"
              placeholder="Pcs"
              value={item.qty}
              onChange={(e) =>
                updateProduct(index, "qty", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              type="number"
              min="0"
              placeholder="Harga modal satuan"
              value={item.capital}
              onChange={(e) =>
                updateProduct(index, "capital", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              type="number"
              min="0"
              placeholder="harga jual satuan"
              value={item.price}
              onChange={(e) =>
                updateProduct(index, "price", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              type="number"
              min="0"
              placeholder="Diskon produk"
              value={item.discount_customer}
              onChange={(e) =>
                updateProduct(
                  index,
                  "discount_customer",
                  e.target.value
                )
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
            <input
              type="date"
              value={item.exp}
              placeholder="Expired"
              onChange={(e) =>
                updateProduct(index, "exp", e.target.value)
              }
              className="border px-4 py-3 bg-white rounded-lg"
            />
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <p className="text-gray-500">Cost / Unit</p>
                <p className="font-semibold">
                Rp {calc.costPerUnit.toLocaleString()}
                </p>
            </div>

            <div>
                <p className="text-gray-500">Margin / Unit</p>
                <p
                className={`font-semibold ${
                    calc.marginPerUnit < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
                >
                Rp {calc.marginPerUnit.toLocaleString()}
                </p>
            </div>

            <div>
                <p className="text-gray-500">Margin %</p>
                <p
                className={`font-semibold ${
                    calc.marginPercent < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
                >
                {calc.marginPercent.toFixed(2)}%
                </p>
            </div>

            <div>
                <p className="text-gray-500">Total Produk</p>
                <p className="font-semibold">
                Rp {calc.totalSelling.toLocaleString()}
                </p>
            </div>
            </div>
        </div>
      )})}

      <button
        onClick={addRow}
        className="mb-8 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        + Tambah Produk
      </button>

      {/* ================= SUBMIT ================= */}
      <div className="flex justify-end">
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
