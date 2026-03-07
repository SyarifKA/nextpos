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
    
    const filter = searchParams.get("filter") || "today";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    // Build query params
    let queryParams = "";
    if (startDate && endDate) {
      queryParams = `?start_date=${startDate}&end_date=${endDate}`;
    } else {
      queryParams = `?filter=${filter}`;
    }

    const res = await fetch(`${API_SERVER}dashboard${queryParams}`, {
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
