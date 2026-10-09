import { Order, Product, ProductVariant } from "./types";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fb_test_code?: string;
  }
}

export function setPixelTestCode(code?: string) {
  if (typeof window !== "undefined") {
    window._fb_test_code = code?.trim() || undefined;
  }
}

// Deduplication caches for Meta Pixel events
const recentEvents = new Map<string, number>();
let lastViewContentKey = "";
let lastViewContentTime = 0;
let lastAddToCartKey = "";
let lastAddToCartTime = 0;

export function trackPixelEvent(
  eventName: string,
  data?: Record<string, any>,
  options?: { eventID?: string }
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    // Deduplication check: prevent identical event with same name and eventID / payload from firing within 1000ms
    const eventKey = options?.eventID
      ? `${eventName}_${options.eventID}`
      : `${eventName}_${JSON.stringify(data || {})}`;

    const now = Date.now();
    const lastTime = recentEvents.get(eventKey);
    if (lastTime && now - lastTime < 1000) {
      return;
    }
    recentEvents.set(eventKey, now);

    // Prune stale cache entries
    if (recentEvents.size > 50) {
      recentEvents.forEach((time, key) => {
        if (now - time > 10000) {
          recentEvents.delete(key);
        }
      });
    }

    const payload = { ...(data || {}) };
    if (window._fb_test_code && !payload.test_event_code) {
      payload.test_event_code = window._fb_test_code;
    }

    if (options?.eventID) {
      window.fbq("track", eventName, payload, { eventID: options.eventID });
    } else if (Object.keys(payload).length > 0) {
      window.fbq("track", eventName, payload);
    } else {
      window.fbq("track", eventName);
    }
  }
}

export function trackViewContent(product: Product, variant?: ProductVariant) {
  const currentId = String(variant?.id || product.id);
  const now = Date.now();
  // Prevent duplicate ViewContent within 2000ms for the same product/variant
  if (lastViewContentKey === currentId && now - lastViewContentTime < 2000) {
    return;
  }
  lastViewContentKey = currentId;
  lastViewContentTime = now;

  const price = variant ? (variant.salePrice ?? variant.price) : (product.salePrice ?? product.price);
  trackPixelEvent("ViewContent", {
    content_name: product.name,
    content_category: product.categoryName,
    content_ids: [variant?.id || product.id],
    content_type: "product",
    value: price,
    currency: "BDT",
  });
}

export function trackAddToCart(product: Product, variant?: ProductVariant, quantity: number = 1) {
  const currentId = String(variant?.id || product.id);
  const now = Date.now();
  // Prevent duplicate AddToCart within 800ms for the same item (accidental double-click)
  if (lastAddToCartKey === currentId && now - lastAddToCartTime < 800) {
    return;
  }
  lastAddToCartKey = currentId;
  lastAddToCartTime = now;

  const price = variant ? (variant.salePrice ?? variant.price) : (product.salePrice ?? product.price);
  trackPixelEvent("AddToCart", {
    content_name: product.name,
    content_category: product.categoryName,
    content_ids: [variant?.id || product.id],
    content_type: "product",
    value: price * quantity,
    currency: "BDT",
    num_items: quantity,
  });
}

export function trackInitiateCheckout(totalAmount: number, itemCount: number) {
  trackPixelEvent("InitiateCheckout", {
    value: totalAmount,
    currency: "BDT",
    num_items: itemCount,
  });
}

export function trackPurchase(order: {
  id: string;
  totalAmount: number;
  items?: { productId: string; productName: string; quantity: number; price: number }[];
}) {
  if (typeof window !== "undefined") {
    const trackedKey = `fb_tracked_${order.id}`;
    if (sessionStorage.getItem(trackedKey)) {
      return; // Already tracked this order in this browser session
    }
    sessionStorage.setItem(trackedKey, "1");
  }

  trackPixelEvent(
    "Purchase",
    {
      content_type: "product",
      content_ids: order.items?.map((item) => item.productId) || [],
      contents:
        order.items?.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: item.price,
        })) || [],
      value: order.totalAmount,
      currency: "BDT",
      num_items: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
      order_id: order.id,
    },
    { eventID: order.id }
  );
}
