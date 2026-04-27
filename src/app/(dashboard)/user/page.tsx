"use client";

import { useEffect, useState, useCallback } from "react";
import { Pagination } from "@/models/type";
import { Users, UserPlus, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const toastSuccess = (title: string) =>
  MySwal.fire({
    icon: "success",
    title,
    timer: 1800,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
  });

const toastError = (title: string, text?: string) =>
  MySwal.fire({
    icon: "error",
    title,
    text,
    timer: 2200,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
  });

type UserItem = {
  id: string;
  user_name: string;
  email: string;
  role_id: string;
  role_name: string;
  photo: string;
  created_at: string;
};

type Role = { id: string; name: string };

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 10;

  // Add user modal
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    user_name: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit role modal
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editingRoleId, setEditingRoleId] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/user?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      const json = await res.json();
      setUsers(json.data || []);
      setPagination(json.pagination);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/user/roles");
      const json = await res.json();
      setRoles(json.data || []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async () => {
    if (!form.user_name || !form.email || !form.password || !form.role_id) {
      toastError("Semua field wajib diisi");
      return;
    }
    if (form.password.length < 6) {
      toastError("Password minimal 6 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toastSuccess("User berhasil dibuat");
        setOpenAdd(false);
        setForm({ user_name: "", email: "", password: "", role_id: "" });
        fetchUsers();
      } else {
        const json = await res.json();
        toastError("Gagal membuat user", json?.statusMessage);
      }
    } catch {
      toastError("Gagal membuat user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRole = async () => {
    if (!editingUser || !editingRoleId) return;
    setSavingRole(true);
    try {
      const res = await fetch(`/api/user/${editingUser.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: editingRoleId }),
      });
      if (res.ok) {
        toastSuccess("Role berhasil diupdate");
        setEditingUser(null);
        fetchUsers();
      } else {
        const json = await res.json();
        toastError("Gagal update role", json?.statusMessage);
      }
    } catch {
      toastError("Gagal update role");
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4">
      <h1 className="text-xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2 md:gap-3">
        <Users className="w-6 h-6 md:w-8 md:h-8" />
        Manajemen User
      </h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Cari nama / email"
          className="w-full md:w-64 rounded-lg border px-3 py-2 text-sm"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Tanggal Daftar</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">Loading...</td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.user_name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role_name === "Admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.role_name || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setEditingRoleId(u.role_id);
                    }}
                    className="inline-flex items-center gap-1 rounded bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600"
                  >
                    <Pencil size={12} />
                    Edit Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-2">
        {loading && (
          <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
        )}
        {!loading && users.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            Data tidak ditemukan
          </div>
        )}
        {users.map((u) => (
          <div key={u.id} className="border rounded-lg p-3 bg-white">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{u.user_name}</div>
                <div className="text-xs text-gray-500 truncate">{u.email}</div>
              </div>
              <span
                className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                  u.role_name === "Admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {u.role_name || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-gray-400">
                {u.created_at
                  ? new Date(u.created_at).toLocaleDateString("id-ID")
                  : "-"}
              </span>
              <button
                onClick={() => {
                  setEditingUser(u);
                  setEditingRoleId(u.role_id);
                }}
                className="inline-flex items-center gap-1 rounded bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600"
              >
                <Pencil size={12} />
                Edit Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center md:justify-end gap-1 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
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
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            »
          </button>
        </div>
      )}

      {/* ADD USER MODAL */}
      {openAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Tambah User Baru</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Nama</label>
                <input
                  type="text"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Nama user"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="email@domain.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Role</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setOpenAdd(false);
                  setForm({ user_name: "", email: "", password: "", role_id: "" });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">Edit Role</h2>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{editingUser.user_name}</strong> &bull; {editingUser.email}
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Role</label>
              <select
                value={editingRoleId}
                onChange={(e) => setEditingRoleId(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRole}
                disabled={savingRole || editingRoleId === editingUser.role_id}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm disabled:bg-gray-400"
              >
                {savingRole ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
