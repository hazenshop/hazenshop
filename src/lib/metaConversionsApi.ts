import crypto from "crypto";
import { NextRequest } from "next/server";
import { Order, SiteSettings } from "./types";

/**
 * Meta Conversions API (CAPI) Integration
 * Direct server-to-server tracking for 100% reliable conversion attribution
 * Bypasses ad-blockers, iOS 14+ tracking blocks, and slow mobile network drops.
 */

function hashValue(val?: string | null): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash("sha256").update(clean).digest("hex");
}

function normalizeAndHashPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/[^0-9]/g, "");
  // Normalize BD phone format
  if (digits.startsWith("01") && digits.length === 11) {
    digits = "880" + digits.substring(1);
  } else if (digits.startsWith("1") && digits.length === 10) {
    digits = "880" + digits;
  }
  if (!digits) return undefined;
  return crypto.createHash("sha256").update(digits).digest("hex");
}

export function extractClientInfo(req?: NextRequest | Request) {
  let clientIp: string | undefined;
  let userAgent: string | undefined;
  let fbp: string | undefined;
  let fbc: string | undefined;

  if (req) {
    // Extract IP
    const xForwardedFor = req.headers.get("x-forwarded-for");
    if (xForwardedFor) {
      clientIp = xForwardedFor.split(",")[0].trim();
    } else {
      clientIp = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || undefined;
    }

    // Extract User Agent
    userAgent = req.headers.get("user-agent") || undefined;

    // Extract cookies for Meta Click ID (_fbc) and Browser ID (_fbp)
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = cookieHeader.split(";").reduce((acc, pair) => {
      const [k, v] = pair.trim().split("=");
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {} as Record<string, string>);

    fbp = cookies["_fbp"];
    fbc = cookies["_fbc"];
  }

  return { clientIp, userAgent, fbp, fbc };
}

export async function sendMetaPurchaseEvent(
  order: Order,
  req?: NextRequest | Request,
  settings?: SiteSettings
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const pixelId = settings?.facebookPixelId || process.env.NEXT_PUBLIC_FB_PIXEL_ID || "2147237946145364";
    const accessToken = settings?.facebookAccessToken || process.env.FB_CONVERSIONS_API_TOKEN;

    if (!accessToken) {
      console.log("[Meta CAPI] No facebookAccessToken configured. Skipping server-side event.");
      return { success: false, error: "No Access Token configured" };
    }

    const { clientIp, userAgent, fbp, fbc } = extractClientInfo(req);

    // Split customer name
    const nameParts = (order.customerName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const hashedPhone = normalizeAndHashPhone(order.customerPhone);
    const hashedFn = hashValue(firstName);
    const hashedLn = hashValue(lastName);
    const hashedCity = hashValue(order.customerCity || order.deliveryZone || "dhaka");

    const userData: Record<string, any> = {
      ...(hashedPhone ? { ph: [hashedPhone] } : {}),
      ...(hashedFn ? { fn: [hashedFn] } : {}),
      ...(hashedLn ? { ln: [hashedLn] } : {}),
      ...(hashedCity ? { ct: [hashedCity] } : {}),
      ...(clientIp ? { client_ip_address: clientIp } : {}),
      ...(userAgent ? { client_user_agent: userAgent } : {}),
      ...(fbp ? { fbp } : {}),
      ...(fbc ? { fbc } : {}),
    };

    const contents = (order.items || []).map((it) => ({
      id: it.productId,
      quantity: it.quantity,
      item_price: Number(it.price),
    }));

    const totalQuantity = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

    const eventPayload: Record<string, any> = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: order.id, // Exact match with browser pixel for Meta automatic deduplication
      event_source_url: "https://hazenshopbd.com/checkout",
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: "BDT",
        value: Number(order.totalAmount),
        content_type: "product",
        contents,
        content_ids: (order.items || []).map((it) => it.productId),
        num_items: totalQuantity,
        order_id: order.id,
      },
    };

    const requestBody: Record<string, any> = {
      data: [eventPayload],
    };

    // Attach test_event_code only if active for testing
    if (settings?.facebookTestEventCode && settings.facebookTestEventCode.trim()) {
      requestBody.test_event_code = settings.facebookTestEventCode.trim();
    }

    const endpoint = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const resJson = await response.json();

    if (!response.ok) {
      console.error("[Meta CAPI Error]", resJson);
      return { success: false, error: resJson?.error?.message || "Failed to send CAPI event" };
    }

    console.log(`[Meta CAPI Success] Purchase event recorded for Order #${order.id}:`, resJson);
    return { success: true, data: resJson };
  } catch (err: any) {
    console.error("[Meta CAPI Exception]", err);
    return { success: false, error: err?.message || "Unexpected exception" };
  }
}

/**
 * Send a sample Test Event to verify Meta Conversions API connection
 */
export async function sendMetaTestEvent(
  pixelId: string,
  accessToken: string,
  testEventCode?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!pixelId || !accessToken) {
      return { success: false, error: "Pixel ID and Access Token are required" };
    }

    const testId = `test-order-${Date.now()}`;
    const requestBody: Record<string, any> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: testId,
          event_source_url: "https://hazenshopbd.com/admin/settings",
          action_source: "website",
          user_data: {
            ph: [normalizeAndHashPhone("01700000000")],
            fn: [hashValue("Test")],
            ln: [hashValue("Customer")],
            ct: [hashValue("dhaka")],
            client_ip_address: "127.0.0.1",
            client_user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
          custom_data: {
            currency: "BDT",
            value: 1250,
            content_type: "product",
            contents: [
              {
                id: "test-product",
                quantity: 1,
                item_price: 1250,
              },
            ],
            num_items: 1,
            order_id: testId,
          },
        },
      ],
    };

    if (testEventCode && testEventCode.trim()) {
      requestBody.test_event_code = testEventCode.trim();
    }

    const endpoint = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.error?.message || "Meta API returned an error" };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to communicate with Meta API" };
  }
}
