import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const flashSale = searchParams.get("flashSale") === "true" ? true : undefined;
    const search = searchParams.get("search") || undefined;

    const products = await db.getProducts({ category, featured, flashSale, search });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.name || (!body.price && body.price !== 0)) {
      return NextResponse.json({ error: "Product name and price are required." }, { status: 400 });
    }

    // Default category if none passed
    if (!body.category) {
      const categories = await db.getCategories();
      body.category = categories[0]?.slug || "general";
      body.categoryName = categories[0]?.name || "General Collection";
    }

    const created = await db.createProduct({
      ...body,
      price: Number(body.price),
      salePrice: body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "" ? Number(body.salePrice) : undefined,
    });
    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
  }
}
