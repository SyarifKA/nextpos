import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_SERVER = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "UNAUTHORIZED", message: "Token not found" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";

    const qs = new URLSearchParams({
      page,
      limit,
      search,
    }).toString();

    const res = await fetch(`${API_SERVER}stock-movement?${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        status: "ER500",
        statusMessage: "API server unreachable",
      },
      { status: 500 }
    );
  }
}
