import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_SERVER = process.env.NEXT_PUBLIC_API_URL;

// ========================
// GET /api/customer/[id]
// ========================
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const token = cookies().get("access_token")?.value;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "UNAUTHORIZED", message: "Token not found" },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_SERVER}customer/${params.id}`, {
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
      { status: "ER500", statusMessage: "API server unreachable" },
      { status: 500 }
    );
  }
}

// ========================
// PUT /api/customer/[id]
// ========================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const token = cookies().get("access_token")?.value;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "UNAUTHORIZED", message: "Token not found" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const res = await fetch(`${API_SERVER}customer/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { status: "ER500", statusMessage: "API server unreachable" },
      { status: 500 }
    );
  }
}

// ========================
// DELETE /api/customer/[id]
// ========================
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const token = await cookies().get("access_token")?.value;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "UNAUTHORIZED", message: "Token not found" },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_SERVER}customer/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { status: "ER500", statusMessage: "API server unreachable" },
      { status: 500 }
    );
  }
}
