import { Order, OrderItem, Product, ProductVariant } from "./types";

declare global {
  interface Window {
    dataLayer?: any[];
    _ga4_last_view_item?: string;
  }
}

/**
 * Pushes event data to the dataLayer according to GA4 Ecommerce schema.
 * Clears the previous ecommerce object before pushing new data.
 */
export function pushEcommerceEvent(eventName: string, ecommerceData: Record<string, any>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
    window.dataLayer.push({
      event: eventName,
      ecommerce: ecommerceData,
    });
  }
}

/**
 * ২. প্রোডাক্ট ভিউ ইভেন্ট (view_item)
 * Triggered on product details page load.
 */
export function trackGA4ViewItem(
  product: Product,
  variant?: ProductVariant,
  quantity: number = 1
) {
  if (typeof window === "undefined" || !product) return;

  const unitPrice = variant
    ? (variant.salePrice ?? variant.price)
    : (product.salePrice ?? product.price);

  const itemId = variant?.sku || product.sku || variant?.id || product.id;
  const itemName = product.name;

  pushEcommerceEvent("view_item", {
    currency: "BDT",
    value: Number(unitPrice),
    items: [
      {
        item_id: String(itemId),
        item_name: String(itemName),
        price: Number(unitPrice),
        quantity: Number(quantity || 1),
      },
    ],
  });
}

/**
 * ৩. চেকআউট শুরু ইভেন্ট (begin_checkout)
 * Triggered on checkout page load with current checkout items.
 */
export function trackGA4BeginCheckout(items: OrderItem[], totalValue: number) {
  if (typeof window === "undefined" || !items || items.length === 0) return;

  const formattedItems = items.map((item) => ({
    item_id: String(item.variantId || item.productId),
    item_name: String(item.productName),
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));

  pushEcommerceEvent("begin_checkout", {
    currency: "BDT",
    value: Number(totalValue),
    items: formattedItems,
  });
}

/**
 * ৪. পারচেজ বা অর্ডার সফল ইভেন্ট (purchase)
 * Triggered on order success / thank you page with dynamic database values.
 */
export function trackGA4Purchase(order: {
  id: string;
  totalAmount: number;
  deliveryFee?: number;
  items?: {
    productId?: string;
    variantId?: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}) {
  if (typeof window === "undefined" || !order) return;

  const formattedItems = (order.items || []).map((item) => ({
    item_id: String(item.variantId || item.productId || "UNKNOWN"),
    item_name: String(item.productName),
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));

  pushEcommerceEvent("purchase", {
    transaction_id: String(order.id),
    value: Number(order.totalAmount),
    shipping: Number(order.deliveryFee ?? 0),
    tax: 0.0,
    currency: "BDT",
    items: formattedItems,
  });
}
