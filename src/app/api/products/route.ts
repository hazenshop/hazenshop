import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Name, price and category are required" }, { status: 400 });
    }

    const created = await db.createProduct(body);
    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
