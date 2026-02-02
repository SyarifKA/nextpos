import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  // contoh: cek token login di cookie
  // const token = (await cookies()).get("auth_token");

  // if (!token) {
    // kalau belum login → ke /login
  //   redirect("/login");
  // }

  // kalau sudah login → ke dashboard
  redirect("/dashboard");
}