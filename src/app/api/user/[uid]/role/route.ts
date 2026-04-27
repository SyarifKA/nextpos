import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_SERVER = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { status: "UNAUTHORIZED", message: "Token not found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const res = await fetch(`${API_SERVER}user/${encodeURIComponent(uid)}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
