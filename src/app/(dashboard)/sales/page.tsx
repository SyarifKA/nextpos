"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Search } from "lucide-react";
import TransactionConfirmModal from "@/components/modal/transaction/CreateTransaction";
import { TypeCustomer, PayloadTransaction, Pagination} from "@/models/type";
import { TypeStock } from "@/models/type_stock";

type CartItem = {
  id: string; // stock_id (unik di cart)
  product_id: string;
  stock_id: string;
  name: string;
  discount: number;
  price: number;
  qty: number;
  max_qty: number;
};


export default function PosPage() {
  const [stocks, setStocks]= useState<TypeStock[]>([])
  const [query, setQuery] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<TypeCustomer[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<TypeCustomer | null>(null);
  const [openCustomerDropdown, setOpenCustomerDropdown] = useState(false);
  const [payload, setPayload] = useState<PayloadTransaction| null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null);
  // const [discountMember, setDiscountMember] = useState<Number>(0)

  const customerInputRef = useRef<HTMLInputElement>(null);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customer");
      const json = await res.json();
      setCustomers(json.data || []);
    } catch (err) {
      console.error("Failed fetch customers", err);
    }
  };

  const buildPayloadTransaction = (): PayloadTransaction => {
    return {
      customer_id: selectedCustomer?.id || "",
      transaction: cartItems.map((item) => ({
        product_id: item.product_id,
        stock_id: item.stock_id,
        qty: item.qty,
      })),
    };
  };
  
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stock");
      const json = await res.json();
      setStocks(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Stocks", error);
    } finally {
      setLoading(false);
    }
  };
  
  const inputRef = useRef<HTMLInputElement>(null);
  const customerWrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
    fetchStocks();
    fetchCustomers();
  }, []);

  // Debounce sederhana untuk search (300ms)
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const addToCart = (stock: TypeStock) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.stock_id === stock.id);

      if (found) {
        if (found.qty + 1 > stock.qty) return prev;
        return prev.map((i) =>
          i.stock_id === stock.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          id: stock.id,
          product_id: stock.product_id,
          stock_id: stock.id,
          name: stock.name,
          price: stock.price,
          discount: stock.discount,
          qty: 1,
          max_qty: stock.qty,
        },
      ];
    });
  };

  const updateCartQuantity = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, qty: Math.min(Math.max(qty, 0), i.max_qty) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.qty * Number(item.price - item.discount),
      0
    );
  }, [cartItems]);


  const discountMember = useMemo(() => {
    if (!selectedCustomer?.id) return 0;

    // ❗ cek apakah ada produk yang punya discount
    const hasProductDiscount = cartItems.some(
      (item) => item.discount > 0
    );

    if (hasProductDiscount) return 0;

    return Math.floor(subtotal * 0.02);
  }, [selectedCustomer, subtotal, cartItems]);


  const totals = useMemo(() => {
    const totalItems = cartItems.reduce((s, c) => s + c.qty, 0);

    return {
      totalItems,
      totalPrice: subtotal - discountMember,
    };
  }, [cartItems, subtotal, discountMember]);

  
  // Reset cart (mis. saat transaksi selesai)
  const clearCart = useCallback(() => setCartItems([]), []);

  const resetTransaction = useCallback(() => {
    setQuery("");
    setSearchTerm("");
    setCartItems([]);
    setSelectedCustomer(null);
    setCustomerQuery("");
    setOpenCustomerDropdown(false);

    inputRef.current?.focus();
  }, []);


  const filteredCustomers = useMemo(() => {
    if (!customerQuery) return customers;
    const q = customerQuery.toLowerCase();

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone_number || "").includes(q) ||
        c.id.includes(q)
    );
  }, [customers, customerQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        customerWrapperRef.current &&
        !customerWrapperRef.current.contains(e.target as Node)
      ) {
        setOpenCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTransaction = () => {
    if (cartItems.length === 0) return;

    const payload = buildPayloadTransaction();
    setPayload(payload);
    setOpenConfirm(true);
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
      {/* Header / Summary */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm w-full md:w-2/3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-4 items-center">
              <div className="text-sm text-gray-500">Tanggal</div>
              <div className="bg-gray-100 px-3 py-2 rounded">{new Date().toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">Kasir</div>
              <div className="bg-gray-100 px-3 py-2 rounded">Suhaimi</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-right font-semibold">
              <div className="text-sm text-gray-500">Total Belanja</div>
              <div className="text-3xl">Rp {totals.totalPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk (nama / sku / id)..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
              onClick={resetTransaction}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Reset
            </button>
        </div>
      </header>

      {/* Main: produk kiri + cart kanan */}
      <main className="flex flex-col lg:flex-row gap-6">
        {/* Produk (kiri) */}
        <section className="bg-white rounded-md shadow p-4 h-fit flex-1 overflow-auto">
          <h3 className="font-semibold mb-3">Daftar Produk</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3">ID / SKU</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3">Expired</th>
                  <th className="p-3">Harga normal</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Harga</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="p-3">{p.sku ?? p.id}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.qty}</td>
                    <td className="px-4 py-3">
                      {new Date(p.exp).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">Rp {p.price.toLocaleString()}</td>
                    <td className="p-3">Rp {p.discount.toLocaleString()}</td>
                    <td className="p-3">Rp {(p.price - p.discount).toLocaleString()}</td>
                  </tr>
                ))}

                {stocks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Tidak ada produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-end gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded border px-3 py-1 text-sm"
              >
                «
              </button>

              {Array.from({ length: pagination.total_pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`rounded border px-3 py-1 text-sm ${
                    page === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === pagination.total_pages}
                onClick={() => setPage(page + 1)}
                className="rounded border px-3 py-1 text-sm"
              >
                »
              </button>
            </div>
          )}
        </section>

        {/* Cart (kanan) */}
        <aside className="bg-white rounded-md shadow p-4 w-full lg:w-1/3 flex flex-col">
          <h3 className="font-semibold mb-3">Keranjang</h3>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Subtotal</th>
                  <th className="p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2 text-white">
                        <button
                            onClick={() => updateCartQuantity(c.id, c.qty - 1)}
                            className="px-2 py-1 border bg-red-500 rounded"
                          >
                            -
                          </button>
                        <input
                          value={c.qty}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            updateCartQuantity(c.id, val);
                          }}
                          className="w-12 text-center border text-black rounded px-1 py-1"
                          type="number"
                          min={0}
                          max={c.max_qty}
                        />
                        <button
                            onClick={() => updateCartQuantity(c.id, c.qty + 1)}
                            className="px-2 py-1 border bg-blue-500 rounded"
                          >
                            +
                          </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        Stok: {c.max_qty}
                      </div>
                    </td>
                    <td className="p-2">Rp {(Number(c.price - c.discount) * c.qty).toLocaleString()}</td>
                    <td className="p-2">
                      <button
                        onClick={() => removeFromCart(c.id)}
                        className="text-sm text-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}

                {cartItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      klik produk di kiri untuk menambah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary & Actions */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <div>Total item</div>
              <div>{totals.totalItems}</div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div>Discount member</div>
              <div>Rp {discountMember.toLocaleString()}</div>
            </div>
            <div className="flex justify-between text-lg font-semibold mt-2">
              <div>Total</div>
              <div>Rp {totals.totalPrice.toLocaleString()}</div>
            </div>
            {/* CUSTOMER SELECT */}
            <div ref={customerWrapperRef} className="mb-4 pt-4 relative">
              <label className="text-sm text-gray-600 mb-1 block">
                Customer
              </label>

              <input
                ref={customerInputRef}
                value={selectedCustomer ? selectedCustomer.name : customerQuery}
                onChange={(e) => {
                  setSelectedCustomer(null);
                  setCustomerQuery(e.target.value);
                  setOpenCustomerDropdown(true);
                }}
                onFocus={() => setOpenCustomerDropdown(true)}
                placeholder="Cari customer (nama / HP / ID)"
                className="w-full border rounded-lg px-3 py-2"
              />

              {openCustomerDropdown && !selectedCustomer && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-48 overflow-auto">
                  {filteredCustomers.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Customer tidak ditemukan
                    </div>
                  )}

                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerQuery("");
                        setOpenCustomerDropdown(false);
                        customerInputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {c.phone_number ?? "-"} • ID: {c.id}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedCustomer && (
                <div className="mt-1 text-xs text-green-600">
                  Customer dipilih ✔
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleTransaction()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
              >
                Bayar
              </button>
              <button
                onClick={clearCart}
                className="px-4 py-2 border rounded"
                disabled={cartItems.length === 0}
              >
                Batal
              </button>
            </div>
          </div>
          {discountMember === 0 && selectedCustomer && cartItems.some(i => i.discount > 0) && (
            <div className="text-xs text-orange-500 mt-1">
              Diskon member tidak berlaku karena ada produk promo
            </div>
          )}
        </aside>
      </main>
      {payload && (
        <TransactionConfirmModal
          open={openConfirm}
          transaction={payload}
          onClose={() => {
            setOpenConfirm(false);
            setPayload(null);
          }}
          onSuccess={()=>{
            clearCart(),
            fetchStocks(),
            setSelectedCustomer(null)
          }
          }
        />
      )}
    </div>
  );
}
