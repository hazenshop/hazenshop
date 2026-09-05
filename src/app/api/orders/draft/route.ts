import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Order } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cleanPhone = (body.customerPhone || "").replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 6) {
      return NextResponse.json({ success: false, message: "Valid phone number required" }, { status: 400 });
    }

    const draftId = body.id || `INC-${Date.now().toString().slice(-6)}`;
    
    // Check if order already exists and is already completed/confirmed
    const existing = await db.getOrderById(draftId);
    if (existing && existing.status !== "incomplete") {
      // Don't overwrite confirmed/shipped orders
      return NextResponse.json({ success: true, id: existing.id });
    }

    const draftOrder: Order = {
      id: draftId,
      customerName: (body.customerName || "Customer (Unsaved)").trim(),
      customerPhone: cleanPhone,
      customerAddress: (body.customerAddress || "Address Not Entered").trim(),
      deliveryZone: body.deliveryZone || "dhaka",
      deliveryFee: Number(body.deliveryFee || 0),
      subtotal: Number(body.subtotal || body.totalAmount || 0),
      discount: Number(body.discount || 0),
      totalAmount: Number(body.totalAmount || body.subtotal || 0),
      paymentMethod: "COD",
      status: "incomplete",
      notes: body.notes || "Incomplete Checkout / Abandoned Lead",
      items: Array.isArray(body.items) && body.items.length > 0 ? body.items : [
        {
          productId: "prod-draft",
          productName: body.productName || "Product (Draft)",
          productSlug: "",
          productImage: "/logo.jpg",
          quantity: 1,
          price: Number(body.totalAmount || 0),
          total: Number(body.totalAmount || 0),
        }
      ],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await db.updateOrderStatus(draftId, "incomplete");
    } else {
      await db.createOrder(draftOrder);
    }

    return NextResponse.json({ success: true, id: draftId });
  } catch (error: unknown) {
    console.error("Incomplete order draft save error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to record draft" },
      { status: 500 }
    );
  }
}
