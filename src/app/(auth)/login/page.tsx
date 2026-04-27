"use client";

import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoPath, setLogoPath] = useState<string>("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/company-logo")
      .then((r) => r.json())
      .then((j) => setLogoPath(j?.data?.value || ""))
      .catch(() => {});
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const t = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutSeconds]);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const logoUrl = logoPath
    ? logoPath.startsWith("http")
      ? logoPath
      : `${API_ORIGIN}${logoPath}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/sales");
      } else {
        setError(result.message || "Login gagal. Periksa email dan password.");
        setPassword(""); // clear password input on failure
        if (result.retryAfter && result.retryAfter > 0) {
          setLockoutSeconds(result.retryAfter);
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-3 bg-gray-50">
      {/* Left Section */}
      {/* <section className="hidden md:flex md:col-span-2 items-center justify-center bg-blue03"> */}
        {/* <div className="p-10">
          <Image
              src="/assets/logo3d.png"
              alt="Supercontact Logo"
              width={400}
              height={400}
            />
        </div> */}
      {/* </section> */}
      <section
        className="hidden md:flex md:col-span-2 items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/bg-login.jpg')" }}
      >
      </section>


      {/* Right Section */}
      <section className="flex flex-col md:col-span-1 justify-center px-8 md:px-20 py-10 bg-white">
        <h1 className="text-3xl font-semibold text-gray-900 leading-tight text-center">
          Selamat Datang <br /> di
        </h1>

        {logoUrl ? (
          <div className="flex items-center justify-center mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-16 md:h-20 object-contain"
            />
          </div>
        ) : (
          <h2 className="flex items-center justify-center gap-2 text-3xl font-bold mt-2 text-center">
            <span className="text-blue-600">Safa</span>
            <span className="text-green-600">Bodycare!</span>
          </h2>
        )}

        <p className="mt-2 text-sm text-gray-500 text-center">Login ke akun Anda</p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4" >
        {/* <form className="mt-6 space-y-4" onSubmit={handleSubmit}> */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <div>{error}</div>
              {lockoutSeconds > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-red-500">Coba lagi dalam:</span>
                  <span className="font-mono font-bold text-red-700 text-lg tabular-nums">
                    {formatCountdown(lockoutSeconds)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 pr-10
                          focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Masukkan password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* <div className="flex justify-start">
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              Lupa Password?
            </Link>
          </div> */}

          <button
            type="submit"
            disabled={isLoading || lockoutSeconds > 0}
            className="w-full bg-blue-600 mt-4 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lockoutSeconds > 0
              ? `Terkunci (${formatCountdown(lockoutSeconds)})`
              : isLoading
              ? "Masuk..."
              : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
