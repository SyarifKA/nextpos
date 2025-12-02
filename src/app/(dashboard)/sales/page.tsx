"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { products as dummyProducts, Product } from "@/data/dummy";

type CartItem = Product & { quantity: number };

export default function PosPage() {
  // Produk (dari dummy / nanti dari API)
  const [products, setProducts] = useState<Product[]>([]);
  // Filtered list berdasarkan search
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Keranjang/cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load initial data (dummy)
  useEffect(() => {
    setProducts(dummyProducts);
  }, []);

  // Debounce sederhana untuk search (300ms)
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Filtered products memoized
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [products, searchTerm]);

  // Tambah produk ke cart (klik di tabel kiri)
  const addToCart = useCallback(
    (product: Product) => {
      setCartItems((prev) => {
        const found = prev.find((c) => c.id === product.id);
        if (found) {
          // jika sudah ada, tambah quantity (jika stok cukup)
          if (found.quantity + 1 > product.stock) return prev;
          return prev.map((c) =>
            c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        } else {
          // tambah item baru
          return [...prev, { ...product, quantity: 1 }];
        }
      });
    },
    [setCartItems]
  );

  // Ubah quantity di cart (increase / decrease)
  const updateCartQuantity = useCallback((id: number, newQty: number) => {
    setCartItems((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: Math.max(0, newQty) } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Total harga dan total item
  const totals = useMemo(() => {
    const totalItems = cartItems.reduce((s, c) => s + c.quantity, 0);
    const totalPrice = cartItems.reduce((s, c) => s + c.quantity * c.price, 0);
    return { totalItems, totalPrice };
  }, [cartItems]);

  // Reset cart (mis. saat transaksi selesai)
  const clearCart = useCallback(() => setCartItems([]), []);

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk (nama / sku / id)..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white"
            />
          </div>
          <button
            onClick={() => {
              // fokus ke input / atau bersihkan pencarian
              setQuery("");
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main: produk kiri + cart kanan */}
      <main className="flex flex-col lg:flex-row gap-6">
        {/* Produk (kiri) */}
        <section className="bg-white rounded-md shadow p-4 flex-1 overflow-auto">
          <h3 className="font-semibold mb-3">Daftar Produk</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3">ID / SKU</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3">Harga</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="cursor-pointer hover:bg-gray-50"
                    title="Klik untuk tambah ke keranjang"
                  >
                    <td className="p-3">{p.sku ?? p.id}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">Rp {p.price.toLocaleString()}</td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Tidak ada produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(c.id, Math.max(0, c.quantity - 1))
                          }
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <input
                          value={c.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const limited = Math.min(val, c.stock);
                            updateCartQuantity(c.id, limited);
                          }}
                          className="w-12 text-center border rounded px-1 py-1"
                          type="number"
                          min={0}
                          max={c.stock}
                        />
                        <button
                          onClick={() =>
                            updateCartQuantity(c.id, Math.min(c.stock, c.quantity + 1))
                          }
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">Stok: {c.stock}</div>
                    </td>
                    <td className="p-2">Rp {(c.price * c.quantity).toLocaleString()}</td>
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
            <div className="flex justify-between text-lg font-semibold mt-2">
              <div>Total</div>
              <div>Rp {totals.totalPrice.toLocaleString()}</div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  // contoh: proses pembayaran sederhana (hanya clear cart)
                  // di aplikasi nyata: kirim ke API, buat transaksi, dsb.
                  if (cartItems.length === 0) return;
                  alert(`Transaksi selesai. Total: Rp ${totals.totalPrice.toLocaleString()}`);
                  clearCart();
                }}
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
        </aside>
      </main>
    </div>
  );
}
