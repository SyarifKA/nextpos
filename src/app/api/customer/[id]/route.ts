import { NextRequest, NextResponse } from "next/server";
import { Customers } from "@/data/dummy";
import { TypeCustomer } from "@/models/type";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/product/[id]
export async function GET(
  _req: NextRequest,
  { params }: Context
) {
  const { id } = await params;
//   const customerId = id;

  const customer = Customers.find((p) => p.id === id);

  if (!customer) {
    return NextResponse.json(
      { success: false, message: "customer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: customer,
  });
}

// PUT /api/customer/[id]
export async function PUT(
  req: NextRequest,
  { params }: Context
) {
  const { id } = await params;
  const customerId = Number(id);

  const body = (await req.json()) as Partial<TypeCustomer>;

  const index = Customers.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json(
      { success: false, message: "customer not found" },
      { status: 404 }
    );
  }

  Customers[index] = {
    ...Customers[index],
    ...body,
  };

  return NextResponse.json({
    success: true,
    data: Customers[index],
  });
}

// DELETE /api/customer/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: Context
) {
  const { id } = await params;
//   const customerId = Number(id);

  const index = Customers.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json(
      { success: false, message: "customer not found" },
      { status: 404 }
    );
  }

  const deleted = Customers.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: "customer deleted",
    data: deleted[0],
  });
}
