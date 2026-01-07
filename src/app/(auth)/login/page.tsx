"use client";

import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const { login } = useAuth();
  const router = useRouter();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError("");

  //   try {
  //     const success = await login(email, password);
  //     if (success) {
  //       // Redirect to home page after successful login
  //       router.push("/");
  //     } else {
  //       setError("Invalid email or password. Please try again.");
  //     }
  //   } catch (err) {
  //     setError("An error occurred. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-3 bg-gray-50">
      {/* Left Section */}
      <section className="hidden md:flex md:col-span-2 items-center justify-center bg-blue03">
        {/* <div className="p-10">
          <Image
              src="/assets/logo3d.png"
              alt="Supercontact Logo"
              width={400}
              height={400}
            />
        </div> */}
      </section>

      {/* Right Section */}
      <section className="flex flex-col md:col-span-1 justify-center px-8 md:px-20 py-10 bg-white">
        <h1 className="text-3xl font-semibold text-gray-900 leading-tight text-center">
          {/* Selamat Datang <br /> Kembali! */}
          Selamat Datang <br /> di
        </h1>
        
        <h2 className="flex items-center justify-center gap-2 text-3xl font-bold mt-2 text-center">
          <span className="text-blue-600">Suhaimi</span>
          <span className="text-green-600">Store!</span>
        </h2>

        <p className="mt-2 text-sm text-gray-500 text-center">Login ke akun Anda</p>

        <form className="mt-6 space-y-4" >
        {/* <form className="mt-6 space-y-4" onSubmit={handleSubmit}> */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your username"
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
                placeholder="Enter your password"
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
            disabled={isLoading}
            className="w-full bg-blue-600 mt-4 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        {/* <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-300 flex-1" />
          <span className="text-sm text-gray-500">Atau masuk menggunakan</span>
          <div className="h-px bg-gray-300 flex-1" />
        </div> */}

        {/* <button className="w-full border text-primary cursor-pointer rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
          <FcGoogle/>
          Continue with Google
        </button> */}

        {/* <p className="mt-6 text-sm text-gray-600 text-start">
          Belum memiliki akun? {" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Registrasi disini
          </Link>
        </p> */}
      </section>
    </main>
  );
}
