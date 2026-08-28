import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const id = searchParams.get("id");
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search");

    if (id) {
      const order = await db.getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (phone) {
      const orders = await db.getOrdersByPhone(phone);
      return NextResponse.json({ orders });
    }

    const orders = await db.getOrders({
      status: status || undefined,
      search: search || undefined,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.customerPhone || !body.customerAddress || !body.items?.length) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    const createdOrder = await db.createOrder(body);
    return NextResponse.json({ success: true, order: createdOrder }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
