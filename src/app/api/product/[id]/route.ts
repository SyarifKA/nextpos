// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { products } from "@/data/dummy";
import {TypeProduct } from "@/models/type";

interface Params {
  params: { id: string };
}

// GET /api/products/:id
export async function GET(_: Request, { params }: Params) {
  const id = Number(params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: product });
}

// PUT /api/products/:id
// export async function PUT(req: Request, { params }: Params) {
//   const id = Number(params.id);
//   const body = (await req.json()) as Partial<TypeProduct>;

//   const index = products.findIndex((p) => p.id === id);
//   if (index === -1) {
//     return NextResponse.json(
//       { success: false, message: "Product not found" },
//       { status: 404 }
//     );
//   }

//   products[index] = {
//     ...products[index],
//     ...body,
//   };

//   return NextResponse.json({
//     success: true,
//     message: "Product updated",
//     data: products[index],
//   });
// }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params; // ⬅️ WAJIB await
  const productId = Number(id);

  const body = await req.json();

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return Response.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }

  products[index] = {
    ...products[index],
    ...body,
  };

  return Response.json({
    success: true,
    data: products[index],
  });
}


// DELETE /api/products/:id
export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params; // ⬅️ ambil id
  const productId = Number(id); // ⬅️ convert ke number

  if (Number.isNaN(productId)) {
    return NextResponse.json(
      { success: false, message: "Invalid product id" },
      { status: 400 }
    );
  }

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
