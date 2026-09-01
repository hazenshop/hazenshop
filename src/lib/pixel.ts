import { Order, Product, ProductVariant } from "./types";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fb_test_code?: string;
  }
}

export function setPixelTestCode(code: string) {
  if (typeof window !== "undefined") {
    window._fb_test_code = code;
  }
}

export function trackPixelEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    const payload = { ...(data || {}) };
    if (window._fb_test_code && !payload.test_event_code) {
      payload.test_event_code = window._fb_test_code;
    }

    if (Object.keys(payload).length > 0) {
      window.fbq("track", eventName, payload);
    } else {
      window.fbq("track", eventName);
    }
  }
}

export function trackViewContent(product: Product, variant?: ProductVariant) {
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
  trackPixelEvent("Purchase", {
    content_type: "product",
    content_ids: order.items?.map((item) => item.productId) || [],
    value: order.totalAmount,
    currency: "BDT",
    num_items: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
    order_id: order.id,
  });
}
