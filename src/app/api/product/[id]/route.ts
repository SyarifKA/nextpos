import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/dummy";
import { TypeProduct } from "@/models/type";

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
  const productId = Number(id);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: product,
  });
}

// PUT /api/product/[id]
export async function PUT(
  req: NextRequest,
  { params }: Context
) {
  const { id } = await params;
  const productId = Number(id);

  const body = (await req.json()) as Partial<TypeProduct>;

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }

  products[index] = {
    ...products[index],
    ...body,
  };

  return NextResponse.json({
    success: true,
    data: products[index],
  });
}

// DELETE /api/product/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: Context
) {
  const { id } = await params;
  const productId = Number(id);

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }

  const deleted = products.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: "Product deleted",
    data: deleted[0],
  });
}
