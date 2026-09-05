import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DeliveryZone, Order, OrderItem } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-BD")}`;
}

export function calculateDiscountPercentage(originalPrice: number, salePrice?: number): number {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function generateOrderId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `HZ-${randomNum}`;
}

const ZONE_LABELS: Record<DeliveryZone, string> = {
  dhaka: "Inside Dhaka (৳60)",
  outside_dhaka: "Outside Dhaka (৳120)",
  suburbs: "Suburbs / Dhaka Surrounding (৳100)",
};

export function getDeliveryFee(
  zone: DeliveryZone,
  fees?: { dhaka?: number; outside_dhaka?: number; suburbs?: number }
): number {
  const dFee = fees?.dhaka !== undefined && !isNaN(Number(fees.dhaka)) ? Number(fees.dhaka) : 60;
  const oFee = fees?.outside_dhaka !== undefined && !isNaN(Number(fees.outside_dhaka)) ? Number(fees.outside_dhaka) : 120;
  const sFee = fees?.suburbs !== undefined && !isNaN(Number(fees.suburbs)) ? Number(fees.suburbs) : 100;

  if (zone === "outside_dhaka") return oFee;
  if (zone === "suburbs") return sFee;
  return dFee;
}

export function getDeliveryZoneLabel(zone: DeliveryZone): string {
  return ZONE_LABELS[zone] ?? "Inside Dhaka";
}

export function generateWhatsAppOrderUrl(
  whatsappNumber: string,
  items: { name: string; variant?: string; quantity: number; price: number }[],
  total: number,
  customerInfo?: { name?: string; phone?: string; address?: string }
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  
  let text = `🛍️ *New Order Request from Hazen Store*\n`;
  text += `----------------------------------------\n`;
  
  items.forEach((item, idx) => {
    text += `*Item ${idx + 1}:* ${item.name}\n`;
    if (item.variant) text += `▫️ *Variant/Size:* ${item.variant}\n`;
    text += `▫️ *Quantity:* ${item.quantity}\n`;
    text += `▫️ *Price:* ${formatPrice(item.price * item.quantity)}\n\n`;
  });
  
  text += `💰 *Total Amount:* ${formatPrice(total)}\n`;
  text += `📦 *Payment Method:* Cash on Delivery (COD)\n`;
  
  if (customerInfo && (customerInfo.name || customerInfo.phone || customerInfo.address)) {
    text += `\n*Customer Details:*\n`;
    if (customerInfo.name) text += `👤 Name: ${customerInfo.name}\n`;
    if (customerInfo.phone) text += `📞 Phone: ${customerInfo.phone}\n`;
    if (customerInfo.address) text += `🏠 Address: ${customerInfo.address}\n`;
  } else {
    text += `\nPlease confirm my order. I would like to receive this via Cash on Delivery.`;
  }
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function getCourierTrackingUrl(courierName?: string, trackingCode?: string): string | null {
  if (!trackingCode || !courierName) return null;
  const cleanCode = trackingCode.trim();
  const lowerName = courierName.toLowerCase();

  if (lowerName.includes("steadfast")) {
    return `https://steadfast.com.bd/t/${cleanCode}`;
  }
  if (lowerName.includes("pathao")) {
    return `https://merchant.pathao.com/tracking?consignment_id=${cleanCode}`;
  }
  if (lowerName.includes("redx")) {
    return `https://redx.com.bd/track-parcel/?trackingId=${cleanCode}`;
  }
  if (lowerName.includes("paperfly")) {
    return `https://paperfly.com.bd/tracking.php?tracking_id=${cleanCode}`;
  }
  return null;
}

export function generateOrdersCSV(orders: Order[]): string {
  const headers = [
    "Order ID",
    "Customer Name",
    "Phone Number",
    "Address",
    "Delivery Zone",
    "Products",
    "Subtotal",
    "Delivery Fee",
    "Total Payable (COD)",
    "Status",
    "Courier",
    "Tracking Code",
    "Date",
  ];

  const rows = orders.map((o) => {
    const productSummary = o.items.map((i) => `${i.quantity}x ${i.productName} (${i.variantName || "Default"})`).join(" | ");
    return [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerAddress.replace(/"/g, '""')}"`,
      `"${o.deliveryZone}"`,
      `"${productSummary.replace(/"/g, '""')}"`,
      o.subtotal,
      o.deliveryFee,
      o.totalAmount,
      `"${o.status}"`,
      `"${o.courierName || ""}"`,
      `"${o.trackingCode || ""}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case "pending":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    case "confirmed":
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
    case "packaging":
      return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" };
    case "shipped":
    case "out_for_delivery":
      return { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" };
    case "delivered":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
    case "cancelled":
    case "returned":
      return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" };
    case "incomplete":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    default:
      return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" };
  }
}
