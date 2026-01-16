// src/app/api/customers/route.ts
import { NextResponse } from "next/server";
import { Customers } from "@/data/dummy";
import { TypeCustomer } from "@/models/type";

// GET /api/customers
export async function GET() {
  return NextResponse.json({
    success: true,
    data: Customers,
  });
}

// POST /api/customers
export async function POST(req: Request) {
  const body = (await req.json()) as Omit<TypeCustomer, "id">;

  const newIdCust = Customers.length ? Customers[Customers.length - 1].id + 1 : 1 
  const newcustomer: TypeCustomer = {
    id: newIdCust.toString(),
    ...body,
  };

  Customers.push(newcustomer);

  return NextResponse.json({
    success: true,
    message: "customer added",
    data: newcustomer,
  });
}
