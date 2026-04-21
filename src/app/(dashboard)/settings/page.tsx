"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Settings as SettingsIcon, Upload, Image as ImageIcon, Lock, User } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const toastSuccess = (title: string, text?: string) =>
  MySwal.fire({
    icon: "success",
    title,
    text,
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

type Me = {
  id: string;
  user_name: string;
  email: string;
  role: string;
  photo: string;
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");

const buildAssetUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
};

export default function SettingsPage() {
  const { role } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  // Logo upload
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);

  // Change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchMe = async () => {
    const res = await fetch("/api/profile/me");
    const json = await res.json();
    if (res.ok) setMe(json.data);
  };

  const fetchLogo = async () => {
    const res = await fetch("/api/setting/company_logo");
    const json = await res.json();
    if (res.ok) setLogoUrl(json?.data?.value || "");
  };

  useEffect(() => {
    fetchMe();
    fetchLogo();
  }, []);

  // ================== PHOTO ==================
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastError("File terlalu besar", "Maksimal 5MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSavePhoto = async () => {
    if (!photoFile) return;
    setSavingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", photoFile);
      const res = await fetch("/api/profile/photo", { method: "PUT", body: fd });
      if (res.ok) {
        toastSuccess("Foto profile berhasil diupdate");
        setPhotoFile(null);
        setPhotoPreview("");
        fetchMe();
        // Broadcast so Sidebar & Navbar auto-refresh
        window.dispatchEvent(new Event("profile-updated"));
      } else {
        const json = await res.json();
        toastError("Gagal upload foto", json?.statusMessage);
      }
    } catch {
      toastError("Gagal upload foto", "Tidak dapat terhubung ke server");
    } finally {
      setSavingPhoto(false);
    }
  };

  // ================== LOGO ==================
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastError("File terlalu besar", "Maksimal 5MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveLogo = async () => {
    if (!logoFile) return;
    setSavingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", logoFile);
      const res = await fetch("/api/company-logo", { method: "PUT", body: fd });
      if (res.ok) {
        toastSuccess("Logo perusahaan berhasil diupdate");
        setLogoFile(null);
        setLogoPreview("");
        fetchLogo();
        // Broadcast so Sidebar auto-refresh
        window.dispatchEvent(new Event("logo-updated"));
      } else {
        const json = await res.json();
        toastError("Gagal upload logo", json?.statusMessage);
      }
    } catch {
      toastError("Gagal upload logo", "Tidak dapat terhubung ke server");
    } finally {
      setSavingLogo(false);
    }
  };

  // ================== PASSWORD ==================
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toastError("Semua field password wajib diisi");
      return;
    }
    if (newPassword.length < 6) {
      toastError("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError("Konfirmasi password tidak sama");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      if (res.ok) {
        toastSuccess("Password berhasil diubah");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const json = await res.json();
        toastError("Gagal ubah password", json?.statusMessage);
      }
    } catch {
      toastError("Gagal ubah password", "Tidak dapat terhubung ke server");
    } finally {
      setSavingPassword(false);
    }
  };

  const currentPhoto = me?.photo ? buildAssetUrl(me.photo) : "/assets/boy.png";
  const currentLogo = logoUrl ? buildAssetUrl(logoUrl) : "";

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2 md:gap-3">
        <SettingsIcon className="w-6 h-6 md:w-8 md:h-8" />
        Pengaturan
      </h1>

      {/* ============ FOTO PROFILE ============ */}
      <div className="bg-white rounded-xl border shadow-sm p-4 md:p-6">
        <h2 className="font-semibold text-base md:text-lg flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          Foto Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview || currentPhoto}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-500">Saat ini</span>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div>
              <p className="text-sm text-gray-700">
                <strong>{me?.user_name}</strong>
              </p>
              <p className="text-xs text-gray-500">
                {me?.email} &bull; {me?.role}
              </p>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Pilih Foto
              </button>
              {photoFile && (
                <>
                  <button
                    onClick={handleSavePhoto}
                    disabled={savingPhoto}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:bg-gray-400"
                  >
                    {savingPhoto ? "Mengupload..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Batal
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Format: JPG, PNG, WEBP. Maks 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* ============ LOGO PERUSAHAAN (ADMIN ONLY) ============ */}
      {role === "Admin" && (
        <div className="bg-white rounded-xl border shadow-sm p-4 md:p-6">
          <h2 className="font-semibold text-base md:text-lg flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-green-600" />
            Logo Perusahaan
            <span className="text-xs font-normal text-gray-500">
              (hanya Admin)
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-32 h-24 md:w-40 md:h-28 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                {logoPreview || currentLogo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoPreview || currentLogo}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-blue-600 font-bold text-sm">Safa</div>
                    <div className="text-green-600 font-bold text-sm">
                      Bodycare
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">Saat ini</span>
            </div>

            <div className="flex-1 w-full space-y-3">
              <p className="text-sm text-gray-700">
                Logo ini akan muncul di sidebar aplikasi menggantikan teks
                default.
              </p>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Pilih Logo
                </button>
                {logoFile && (
                  <>
                    <button
                      onClick={handleSaveLogo}
                      disabled={savingLogo}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:bg-gray-400"
                    >
                      {savingLogo ? "Mengupload..." : "Simpan"}
                    </button>
                    <button
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Batal
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Format: JPG, PNG, SVG, WEBP. Maks 5MB.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============ RESET PASSWORD ============ */}
      <div className="bg-white rounded-xl border shadow-sm p-4 md:p-6">
        <h2 className="font-semibold text-base md:text-lg flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-red-600" />
          Ubah Password
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm text-gray-700">Password Lama</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:bg-gray-400"
          >
            {savingPassword ? "Menyimpan..." : "Ubah Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
