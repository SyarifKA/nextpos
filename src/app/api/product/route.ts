// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { products } from "@/data/dummy";
import { TypeProduct } from "@/models/type";

// GET /api/products
export async function GET() {
  return NextResponse.json({
    success: true,
    data: products,
  });
}

// POST /api/products
export async function POST(req: Request) {
  const body = (await req.json()) as Omit<TypeProduct, "id">;

  const newProduct: TypeProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    ...body,
  };

  products.push(newProduct);

  return NextResponse.json({
    success: true,
    message: "Product added",
    data: newProduct,
  });
}
