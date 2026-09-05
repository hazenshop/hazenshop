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
    const res = await fetch("https://portal.packzy.com/api/v1/create_order", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: SteadfastCreateOrderResponse | any = {};
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: `Steadfast Server error (${res.status}): ${text.slice(0, 150)}`,
        raw: text,
      };
    }

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
): Promise<{ success: boolean; currentBalance?: number; message: string; diagnostic?: string }> {
  const apiKey = (settings.steadfastApiKey || process.env.STEADFAST_API_KEY || "").trim();
  const secretKey = (settings.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY || "").trim();

  if (!apiKey || !secretKey) {
    return {
      success: false,
      message: "Steadfast API Key or Secret Key is missing",
      diagnostic: "API Key or Secret Key field is empty.",
    };
  }

  try {
    const res = await fetch("https://portal.packzy.com/api/v1/get_balance", {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: `Steadfast Server returned HTTP ${res.status}: ${text.slice(0, 150)}`,
        diagnostic: `Raw response from Steadfast: ${text.slice(0, 300)}`,
      };
    }

    if (res.status === 200 && (data.status === 200 || typeof data.current_balance !== "undefined")) {
      return {
        success: true,
        currentBalance: Number(data.current_balance || 0),
        message: "Steadfast connection verified!",
      };
    }

    const errorMsg = data.message || data.error || (res.status === 401 ? "Invalid API Key or Secret Key (Unauthorized 401)" : `Steadfast status code ${res.status}`);
    return {
      success: false,
      message: errorMsg,
      diagnostic: `HTTP ${res.status} | Data: ${JSON.stringify(data)}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error",
      diagnostic: err instanceof Error ? err.stack : undefined,
    };
  }
}
