import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_SERVER = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { status: "UNAUTHORIZED", message: "Token not found" },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_SERVER}user/roles`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "ER500", statusMessage: "API server unreachable" },
      { status: 500 }
    );
  }
}
