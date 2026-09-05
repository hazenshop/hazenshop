import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSteadfastOrder } from "@/lib/courier/steadfast";
import { createPathaoOrder } from "@/lib/courier/pathao";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, courier, weight, storeId } = body;

    if (!orderId || !courier) {
      return NextResponse.json(
        { success: false, message: "Order ID and Courier type ('steadfast' | 'pathao') are required." },
        { status: 400 }
      );
    }

    const order = await db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    const settings = await db.getSettings();

    let result: {
      success: boolean;
      trackingCode?: string;
      consignmentId?: string;
      message: string;
      raw?: unknown;
    };

    let resolvedCourierName = "Steadfast Courier";

    if (courier === "steadfast") {
      resolvedCourierName = "Steadfast Courier";
      result = await createSteadfastOrder(order, settings);
    } else if (courier === "pathao") {
      resolvedCourierName = "Pathao Courier";
      result = await createPathaoOrder(order, settings, {
        storeId,
        itemWeight: weight ? Number(weight) : 1.5,
      });
    } else {
      return NextResponse.json(
        { success: false, message: `Unsupported courier: ${courier}` },
        { status: 400 }
      );
    }

    if (!result.success || !result.trackingCode) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to dispatch order to courier.",
          raw: result.raw,
        },
        { status: 422 }
      );
    }

    // Automatically update order status to shipped with courier info
    const updatedOrder = await db.updateOrderStatus(order.id, "shipped", {
      courierName: resolvedCourierName,
      trackingCode: result.trackingCode,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      trackingCode: result.trackingCode,
      consignmentId: result.consignmentId,
      order: updatedOrder,
    });
  } catch (error: unknown) {
    console.error("Courier send API error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
