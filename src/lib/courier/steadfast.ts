import { Order, SiteSettings } from "@/lib/types";

export interface SteadfastCreateOrderResponse {
  status: number;
  message?: string;
  consignment?: {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
  };
  errors?: Record<string, string[]>;
}

export async function createSteadfastOrder(
  order: Order,
  settings: SiteSettings
): Promise<{ success: boolean; trackingCode?: string; consignmentId?: string; message: string; raw?: unknown }> {
  const apiKey = (settings.steadfastApiKey || process.env.STEADFAST_API_KEY || "").trim();
  const secretKey = (settings.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY || "").trim();

  if (!apiKey || !secretKey) {
    return {
      success: false,
      message: "Steadfast API Key or Secret Key is missing. Please configure them in Admin Settings.",
    };
  }

  const itemsSummary = order.items
    .map((i) => `${i.productName}${i.variantName ? ` (${i.variantName})` : ""} x${i.quantity}`)
    .join(", ");

  const payload = {
    invoice: order.id,
    recipient_name: order.customerName,
    recipient_phone: order.customerPhone.replace(/[^0-9]/g, ""),
    recipient_address: order.customerAddress,
    cod_amount: Number(order.totalAmount),
    note: order.notes ? `${order.notes} | Items: ${itemsSummary}` : `Items: ${itemsSummary}`,
  };

  try {
    const res = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: SteadfastCreateOrderResponse = await res.json();

    if (data.status === 200 && data.consignment) {
      return {
        success: true,
        trackingCode: data.consignment.tracking_code,
        consignmentId: String(data.consignment.consignment_id),
        message: data.message || "Order sent to Steadfast Courier successfully!",
        raw: data,
      };
    }

    // Format error message
    let errorMsg = data.message || "Failed to create order on Steadfast";
    if (data.errors) {
      const errorList = Object.values(data.errors).flat().join(", ");
      if (errorList) errorMsg += `: ${errorList}`;
    }

    return {
      success: false,
      message: errorMsg,
      raw: data,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error contacting Steadfast API";
    return {
      success: false,
      message,
    };
  }
}

export async function getSteadfastBalance(
  settings: SiteSettings
): Promise<{ success: boolean; currentBalance?: number; message: string }> {
  const apiKey = (settings.steadfastApiKey || process.env.STEADFAST_API_KEY || "").trim();
  const secretKey = (settings.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY || "").trim();

  if (!apiKey || !secretKey) {
    return {
      success: false,
      message: "Steadfast API Key or Secret Key is missing",
    };
  }

  try {
    const res = await fetch("https://portal.steadfast.com.bd/api/v1/get_balance", {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
      },
    });

    const data = await res.json();
    if (data.status === 200 && typeof data.current_balance !== "undefined") {
      return {
        success: true,
        currentBalance: Number(data.current_balance),
        message: "Steadfast connection verified!",
      };
    }

    return {
      success: false,
      message: data.message || "Failed to retrieve balance from Steadfast",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}
