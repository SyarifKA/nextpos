"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Search, Sparkles, Percent, Check, Settings2 } from "lucide-react";
import TransactionConfirmModal from "@/components/modal/transaction/CreateTransaction";
import { TypeCustomer, PayloadTransaction, Pagination} from "@/models/type";
import { TypeStock } from "@/models/type_stock";
import { useAuth } from "@/lib/context/AuthContext";

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
  const { username, role } = useAuth();
  const [cash, setCash] = useState<string>("");

  // 10% discount feature
  const [discount10Enabled, setDiscount10Enabled] = useState<boolean>(false);
  const [useDiscount10, setUseDiscount10] = useState<boolean>(false);
  const [togglingDiscount10, setTogglingDiscount10] = useState(false);

  // Load admin toggle from backend setting
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch("/api/setting/discount_10_enabled");
        const json = await res.json();
        setDiscount10Enabled(json?.data?.value === "true");
      } catch {
        // silent — default to false
      }
    };
    fetchSetting();
  }, []);

  const toggleDiscount10Feature = async () => {
    if (togglingDiscount10) return;
    const next = !discount10Enabled;

    // Optimistic update
    setDiscount10Enabled(next);
    if (!next) setUseDiscount10(false);

    setTogglingDiscount10(true);
    try {
      const res = await fetch("/api/setting/discount_10_enabled", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: String(next) }),
      });
      if (!res.ok) {
        // Revert on failure
        setDiscount10Enabled(!next);
      }
    } catch {
      setDiscount10Enabled(!next);
    } finally {
      setTogglingDiscount10(false);
    }
  };

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
      use_discount_10: useDiscount10,
      transaction: cartItems.map((item) => ({
        product_id: item.product_id,
        stock_id: item.stock_id,
        qty: item.qty,
      })),
    };
  };
  
  const limit = 10;
  const fetchStocks = async () => {
    try {
      setLoading(true);
      // Saat search, gunakan page=1 agar produk mudah ditemukan
      const fetchPage = searchTerm ? 1 : page;
      const res = await fetch(`/api/stock?page=${fetchPage}&limit=${limit}&search=${searchTerm}`);
      const json = await res.json();
      setStocks(json.data || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error("Failed fetch Stocks", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stocks dengan search term spesifik (tanpa perlu set state)
  const fetchStocksImmediate = async (search: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stock?page=1&limit=${limit}&search=${search}`);
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch stocks saat mount atau saat searchTerm/page berubah
  useEffect(() => {
    fetchStocks();
  }, [searchTerm, page]);
  
  // Debounce untuk search (150ms untuk respons lebih cepat)
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(query.trim());
    }, 150);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const addToCart = useCallback((stock: TypeStock) => {
    // Prevent adding products with no stock
    if (!stock.qty || stock.qty <= 0) {
      return;
    }

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
  }, []);

  // Auto-select produk ketika hasil pencarian tepat 1 (untuk barcode scanning)
  useEffect(() => {
    if (stocks.length === 1 && query.trim() !== "") {
      const stock = stocks[0];
      // Cek jika query cocok dengan SKU atau barcode
      const isMatch = 
        stock.sku?.toLowerCase() === query.trim().toLowerCase() ||
        stock.id.toLowerCase() === query.trim().toLowerCase();
      
      // if (isMatch) {
      //   addToCart(stock);
        // setQuery(""); // Reset input setelah produk ditambahkan
      // }
    }
  }, [stocks, query, addToCart]);

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

  // Effective per-unit discount: 10% flat if useDiscount10, else product's own discount
  const effectiveItemDiscount = useCallback(
    (item: CartItem) =>
      useDiscount10 ? Math.floor(item.price * 0.1) : item.discount,
    [useDiscount10]
  );

  // Gross subtotal (price * qty, pre-discount) — matches BE's subtotal
  const grossSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  }, [cartItems]);

  // Sum of per-product discounts (discount * qty)
  const productDiscountTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.qty * effectiveItemDiscount(item),
      0
    );
  }, [cartItems, effectiveItemDiscount]);

  // Subtotal after product discounts (what the user typically sees as "subtotal")
  const subtotal = useMemo(
    () => grossSubtotal - productDiscountTotal,
    [grossSubtotal, productDiscountTotal]
  );

  const discountMember = useMemo(() => {
    // Member 2% only applies when not using 10% AND no product discount exists
    if (useDiscount10) return 0;
    if (!selectedCustomer?.id) return 0;
    if (productDiscountTotal > 0) return 0;
    return Math.floor(grossSubtotal * 0.02);
  }, [selectedCustomer, grossSubtotal, productDiscountTotal, useDiscount10]);

  const totals = useMemo(() => {
    const totalItems = cartItems.reduce((s, c) => s + c.qty, 0);
    return {
      totalItems,
      totalPrice: subtotal - discountMember,
    };
  }, [cartItems, subtotal, discountMember]);
  
  const formatRupiah = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRupiah = (value: string) => {
    return Number(value.replace(/\D/g, "")) || 0;
  };

  const cashNumber = useMemo(() => {
    return parseRupiah(cash);
  }, [cash]);

  const change = useMemo(() => {
    if (cashNumber <= 0) return 0;
    return cashNumber - totals.totalPrice;
  }, [cashNumber, totals.totalPrice]);

  
  // Reset cart (mis. saat transaksi selesai)
  const clearCart = useCallback(() => setCartItems([]), []);

  const resetTransaction = useCallback(() => {
    setQuery("");
    setSearchTerm("");
    setCartItems([]);
    setSelectedCustomer(null);
    setCustomerQuery("");
    setOpenCustomerDropdown(false);
    setCash("");
    setUseDiscount10(false);

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

  // Helper: generate page numbers dengan ellipsis
  const getPaginationPages = (current: number, total: number): (number | "...")[] => {
    const delta = 1; // halaman di kiri & kanan halaman aktif
    const pages: (number | "...")[] = [];

    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    pages.push(1);
    if (rangeStart > 2) pages.push("...");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < total - 1) pages.push("...");
    if (total > 1) pages.push(total);

    return pages;
  };

  return (
    <div className="w-full min-h-screen p-3 md:p-6 bg-gray-50">
      {/* Header / Summary */}
      <header className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-stretch md:justify-between gap-3 md:gap-4">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm w-full md:w-2/3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex flex-wrap gap-2 md:gap-4 items-center text-xs md:text-sm">
              <div className="text-gray-500">Tanggal</div>
              <div className="bg-gray-100 px-2 md:px-3 py-1 md:py-2 rounded">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-gray-500">Kasir</div>
              <div className="bg-gray-100 px-2 md:px-3 py-1 md:py-2 rounded truncate max-w-30">
                {username}
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-md text-right font-semibold">
              <div className="text-xs md:text-sm text-gray-500">Total Belanja</div>
              <div className="text-xl md:text-3xl">
                Rp {totals.totalPrice.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex items-center gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                setPage(1);
                const pastedText = e.clipboardData.getData('text');
                setQuery(pastedText);
                setSearchTerm(pastedText.trim());
                fetchStocksImmediate(pastedText.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  setPage(1);
                  setSearchTerm(query.trim());
                  fetchStocksImmediate(query.trim());
                }
              }}
              onBlur={() => {
                if (query.trim()) {
                  setSearchTerm(query.trim());
                }
              }}
              placeholder="Cari produk..."
              className="w-full pl-9 md:pl-10 pr-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={resetTransaction}
            className="px-3 md:px-4 py-2 text-sm bg-primary text-white rounded-lg whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main: produk kiri + cart kanan */}
      <main className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Produk (kiri) */}
        <section className="bg-white rounded-md shadow p-3 md:p-4 h-fit flex-1 overflow-auto">
          <h3 className="font-semibold mb-3">Daftar Produk</h3>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3">Expired</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Disc</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`cursor-pointer hover:bg-gray-50 ${(!p.qty || p.qty <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <td className="p-3">{p.sku ?? p.id}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">
                      {p.qty <= 0 ? (
                        <span className="text-red-500 font-semibold">Habis</span>
                      ) : (
                        p.qty
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(p.exp).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">Rp {p.price.toLocaleString()}</td>
                    <td className="p-3">
                      {p.discount > 0 ? (
                        <span className="text-green-600">Rp {p.discount.toLocaleString()}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}

                {stocks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Tidak ada produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {stocks.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(p)}
                disabled={!p.qty || p.qty <= 0}
                className={`w-full text-left border rounded-lg p-3 transition active:scale-[0.98] ${
                  !p.qty || p.qty <= 0
                    ? "opacity-60 cursor-not-allowed bg-gray-50"
                    : "bg-white hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.sku ?? p.id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      Rp {p.price.toLocaleString()}
                    </div>
                    {p.discount > 0 && (
                      <div className="text-xs text-green-600">
                        -Rp {p.discount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">
                    Exp: {new Date(p.exp).toLocaleDateString("id-ID")}
                  </span>
                  <span
                    className={`font-medium ${
                      p.qty <= 0 ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    {p.qty <= 0 ? "Habis" : `Stok: ${p.qty}`}
                  </span>
                </div>
              </button>
            ))}

            {stocks.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                Tidak ada produk.
              </div>
            )}
          </div>

          {/* PAGINATION — ellipsis style */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-end items-center gap-1 mt-3">
              {/* First */}
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Halaman pertama"
              >
                «
              </button>
              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Sebelumnya"
              >
                ‹
              </button>

              {/* Nomor halaman */}
              {getPaginationPages(page, pagination.total_pages).map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 py-1 text-sm text-gray-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`rounded border px-3 py-1 text-sm ${
                      page === p
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                disabled={page === pagination.total_pages}
                onClick={() => setPage(page + 1)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Berikutnya"
              >
                ›
              </button>
              {/* Last */}
              <button
                disabled={page === pagination.total_pages}
                onClick={() => setPage(pagination.total_pages)}
                className="rounded border px-2 py-1 text-sm disabled:opacity-40 hover:bg-gray-100"
                title="Halaman terakhir"
              >
                »
              </button>
            </div>
          )}
        </section>

        {/* Cart (kanan) */}
        <aside className="bg-white rounded-md shadow p-3 md:p-4 w-full lg:w-1/3 flex flex-col">
          <h3 className="font-semibold mb-3">
            Keranjang{" "}
            {cartItems.length > 0 && (
              <span className="text-sm text-gray-500 font-normal">
                ({cartItems.length} item)
              </span>
            )}
          </h3>

          <div className="flex-1 overflow-auto">
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Disc</th>
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
                      {c.discount > 0 ? (
                        <span className="text-green-600">
                          Rp {(c.discount * c.qty).toLocaleString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
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
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      klik produk di kiri untuk menambah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {cartItems.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-3 bg-white"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      {c.discount > 0 && (
                        <div className="text-xs text-green-600">
                          Diskon: Rp {(c.discount * c.qty).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(c.id)}
                      className="text-xs text-red-600 font-medium shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-white">
                      <button
                        onClick={() => updateCartQuantity(c.id, c.qty - 1)}
                        className="w-8 h-8 bg-red-500 rounded font-bold"
                      >
                        -
                      </button>
                      <input
                        value={c.qty}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          updateCartQuantity(c.id, val);
                        }}
                        className="w-12 text-center border text-black rounded h-8"
                        type="number"
                        min={0}
                        max={c.max_qty}
                      />
                      <button
                        onClick={() => updateCartQuantity(c.id, c.qty + 1)}
                        className="w-8 h-8 bg-blue-500 rounded font-bold"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400 ml-1">
                        / {c.max_qty}
                      </span>
                    </div>
                    <div className="text-sm font-semibold">
                      Rp {(Number(c.price - c.discount) * c.qty).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">
                  Klik produk di atas untuk menambah.
                </div>
              )}
            </div>
          </div>

          {/* Summary & Actions */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <div>Total item</div>
              <div>{totals.totalItems}</div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div>Subtotal</div>
              <div>Rp {grossSubtotal.toLocaleString()}</div>
            </div>
            {productDiscountTotal > 0 && (
              <div className="flex justify-between text-sm text-orange-600 font-medium">
                <div>{useDiscount10 ? "Diskon 10% produk" : "Diskon produk"}</div>
                <div>- Rp {productDiscountTotal.toLocaleString()}</div>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <div>Discount member</div>
              <div>Rp {discountMember.toLocaleString()}</div>
            </div>

            {/* Diskon 10% Card - visible if admin enabled */}
            {discount10Enabled && cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => setUseDiscount10((v) => !v)}
                className={`group w-full mt-3 relative overflow-hidden rounded-xl p-0.5 transition-all duration-300 active:scale-[0.98] ${
                  useDiscount10
                    ? "bg-linear-to-r from-emerald-400 via-green-500 to-emerald-600 shadow-lg shadow-emerald-200"
                    : "bg-linear-to-r from-amber-400 via-orange-500 to-pink-500 shadow-md hover:shadow-lg hover:shadow-orange-200"
                }`}
              >
                <div
                  className={`flex items-center justify-between rounded-[10px] px-4 py-3 transition ${
                    useDiscount10
                      ? "bg-linear-to-r from-emerald-500 to-green-600 text-white"
                      : "bg-white group-hover:bg-linear-to-r group-hover:from-amber-50 group-hover:to-orange-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        useDiscount10
                          ? "bg-white/25"
                          : "bg-linear-to-br from-amber-400 to-orange-500 text-white"
                      }`}
                    >
                      {useDiscount10 ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        <Percent className="w-5 h-5" strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="text-left">
                      <div
                        className={`text-sm font-bold ${
                          useDiscount10 ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {useDiscount10 ? "Diskon 10% Aktif" : "Promo Diskon 10%"}
                      </div>
                      <div
                        className={`text-[11px] ${
                          useDiscount10 ? "text-emerald-50" : "text-gray-500"
                        }`}
                      >
                        {useDiscount10
                          ? "Klik untuk membatalkan"
                          : "Hemat 10% dari semua produk"}
                      </div>
                    </div>
                  </div>
                  <Sparkles
                    className={`w-5 h-5 ${
                      useDiscount10
                        ? "text-yellow-200"
                        : "text-orange-400 group-hover:animate-pulse"
                    }`}
                  />
                </div>
              </button>
            )}

            <div className="flex justify-between text-xl font-bold mt-3 pt-3 border-t">
              <div>Total</div>
              <div className={useDiscount10 ? "text-emerald-600" : ""}>
                Rp {totals.totalPrice.toLocaleString()}
              </div>
            </div>

            {/* Admin-only toggle (compact) */}
            {role === "Admin" && (
              <button
                type="button"
                onClick={toggleDiscount10Feature}
                disabled={togglingDiscount10}
                className="mt-2 w-full flex items-center justify-center gap-1.5 text-[14px] text-gray-400 hover:text-gray-600 transition py-1 disabled:opacity-50"
                title="Kelola fitur diskon 10%"
              >
                <Settings2 className="w-3 h-3" />
                Fitur Diskon 10%:
                <span
                  className={`font-semibold ${
                    discount10Enabled ? "text-blue-600" : "text-red-500"
                  }`}
                >
                  {togglingDiscount10
                    ? "..."
                    : discount10Enabled
                    ? "AKTIF"
                    : "NONAKTIF"}
                </span>
              </button>
            )}
            {/* CUSTOMER SELECT */}
            <div ref={customerWrapperRef} className="mb-4 pt-4 relative">
              <label className="text-sm text-gray-600 mb-1 block">
                Pelanggan
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
                      Pelanggan tidak ditemukan
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
                  Pelanggan dipilih ✔
                </div>
              )}
            </div>
            {/* INPUT UANG */}
            <input
              type="text"
              value={formatRupiah(cash)}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setCash(raw);
              }}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Masukkan nominal uang"
            />


            {/* KEMBALIAN */}
            <div className="flex justify-between text-lg mt-2">
              <div>Kembalian</div>
              <div className={change < 0 ? "text-red-600" : "text-green-600"}>
                Rp {change > 0 ? change.toLocaleString() : 0}
              </div>
            </div>

            {cashNumber > 0 && change < 0 && (
              <div className="text-xs text-red-500 mt-1">
                Uang tidak mencukupi
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleTransaction()}
                disabled={cartItems.length === 0 || change < 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
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
          {useDiscount10 && selectedCustomer && (
            <div className="text-xs text-orange-500 mt-1">
              Diskon member tidak berlaku karena menggunakan diskon 10%
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
            setSelectedCustomer(null),
            setCash("");
          }
          }
        />
      )}
    </div>
  );
}