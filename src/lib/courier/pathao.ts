import { Order, SiteSettings } from "@/lib/types";

export interface PathaoTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface PathaoStore {
  store_id: number;
  store_name: string;
  store_address: string;
  is_active: number;
}

function getPathaoBaseUrl(sandbox = false): string {
  return sandbox
    ? "https://courier-api-sandbox.pathao.com"
    : "https://api-hermes.pathao.com";
}

export async function getPathaoToken(
  settings: SiteSettings
): Promise<{ success: boolean; token?: string; message: string }> {
  const clientId = (settings.pathaoClientId || process.env.PATHAO_CLIENT_ID || "").trim();
  const clientSecret = (settings.pathaoClientSecret || process.env.PATHAO_CLIENT_SECRET || "").trim();
  const username = (settings.pathaoUsername || process.env.PATHAO_USERNAME || "").trim();
  const password = (settings.pathaoPassword || process.env.PATHAO_PASSWORD || "").trim();
  const baseUrl = getPathaoBaseUrl(settings.pathaoSandbox);

  if (!clientId || !clientSecret || !username || !password) {
    return {
      success: false,
      message: "Pathao Client ID, Secret, Email/Username, or Password missing in Admin Settings.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/issue-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
        grant_type: "password",
      }),
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      return {
        success: true,
        token: data.access_token,
        message: "Authenticated successfully with Pathao!",
      };
    }

    return {
      success: false,
      message: data.message || data.error_description || "Failed to authenticate with Pathao",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error authenticating with Pathao",
    };
  }
}

export async function getPathaoStores(
  settings: SiteSettings
): Promise<{ success: boolean; stores?: PathaoStore[]; message: string }> {
  const tokenResult = await getPathaoToken(settings);
  if (!tokenResult.success || !tokenResult.token) {
    return { success: false, message: tokenResult.message };
  }

  const baseUrl = getPathaoBaseUrl(settings.pathaoSandbox);

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/stores`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();

    if (res.ok && data.data?.data) {
      return {
        success: true,
        stores: data.data.data,
        message: "Stores fetched successfully",
      };
    }

    return {
      success: false,
      message: data.message || "Failed to fetch stores from Pathao",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error fetching Pathao stores",
    };
  }
}

export async function createPathaoOrder(
  order: Order,
  settings: SiteSettings,
  options?: {
    storeId?: string;
    itemWeight?: number;
    recipientCity?: number;
    recipientZone?: number;
    recipientArea?: number;
  }
): Promise<{ success: boolean; trackingCode?: string; consignmentId?: string; message: string; raw?: unknown }> {
  const tokenResult = await getPathaoToken(settings);
  if (!tokenResult.success || !tokenResult.token) {
    return { success: false, message: tokenResult.message };
  }

  const baseUrl = getPathaoBaseUrl(settings.pathaoSandbox);
  const storeId = options?.storeId || settings.pathaoStoreId;

  if (!storeId) {
    return {
      success: false,
      message: "Pathao Store ID is missing. Please configure Store ID in Admin Settings or load your stores.",
    };
  }

  const itemsSummary = order.items
    .map((i) => `${i.productName}${i.variantName ? ` (${i.variantName})` : ""} x${i.quantity}`)
    .join(", ");

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0) || 1;

  const payload = {
    store_id: Number(storeId),
    merchant_order_id: order.id,
    recipient_name: order.customerName,
    recipient_phone: order.customerPhone.replace(/[^0-9]/g, ""),
    recipient_address: order.customerAddress,
    recipient_city: options?.recipientCity || 1, // Default Dhaka city or fallback
    recipient_zone: options?.recipientZone || 1,
    recipient_area: options?.recipientArea || 1,
    delivery_type: 48, // Standard 48h delivery
    item_type: 2, // Parcel / standard parcel
    special_instruction: order.notes ? `${order.notes} | ${itemsSummary}` : itemsSummary,
    item_quantity: totalQuantity,
    item_weight: options?.itemWeight || 1.5,
    amount_to_collect: Number(order.totalAmount),
    item_description: itemsSummary,
  };

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.data?.consignment_id) {
      return {
        success: true,
        consignmentId: String(data.data.consignment_id),
        trackingCode: String(data.data.consignment_id),
        message: data.message || "Order sent to Pathao Courier successfully!",
        raw: data,
      };
    }

    let errorMsg = data.message || "Failed to create order on Pathao";
    if (data.errors) {
      const errorDetails = typeof data.errors === "object" ? JSON.stringify(data.errors) : String(data.errors);
      errorMsg += `: ${errorDetails}`;
    }

    return {
      success: false,
      message: errorMsg,
      raw: data,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error creating Pathao order",
    };
  }
}
