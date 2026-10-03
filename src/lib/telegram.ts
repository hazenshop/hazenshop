import { Order, SiteSettings } from "@/lib/types";

/**
 * Escapes characters for Telegram HTML parse mode.
 */
function escapeHtml(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Formats a phone number for telephone click links.
 */
function cleanPhoneNumber(phone: string = ""): string {
  const digits = phone.replace(/[^0-9+]/g, "");
  if (digits.startsWith("01")) {
    return "+88" + digits;
  }
  return digits;
}

/**
 * Formats Dhaka date and time string.
 */
function formatOrderDateTime(isoString?: string): string {
  try {
    const date = isoString ? new Date(isoString) : new Date();
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return new Date().toLocaleString();
  }
}

/**
 * Constructs a beautifully styled HTML message for Telegram.
 */
export function formatTelegramOrderMessage(
  order: Order,
  storeName: string = "HAZEN SHOP BD",
  siteUrl?: string
): string {
  const cleanPhone = cleanPhoneNumber(order.customerPhone);
  const formattedTime = formatOrderDateTime(order.createdAt);

  const itemsText = (order.items || [])
    .map((item, idx) => {
      const variant = item.variantName ? ` <i>(${escapeHtml(item.variantName)})</i>` : "";
      return `  <b>${idx + 1}.</b> ${escapeHtml(item.productName)}${variant}\n      ▫️ <b>Qty:</b> ${item.quantity} × ৳${item.price.toLocaleString("en-BD")} = <b>৳${item.total.toLocaleString("en-BD")}</b>`;
    })
    .join("\n\n");

  const zoneLabel =
    order.deliveryZone === "dhaka"
      ? "Inside Dhaka"
      : order.deliveryZone === "suburbs"
      ? "Dhaka Suburbs"
      : "Outside Dhaka";

  const discountLine =
    order.discount && order.discount > 0
      ? `\n🎟️ <b>Discount:</b> -৳${order.discount.toLocaleString("en-BD")}`
      : "";

  const notesLine = order.notes
    ? `\n📝 <b>Customer Note:</b> <i>${escapeHtml(order.notes)}</i>`
    : "";

  const lines = [
    `🛍️ <b>NEW ORDER RECEIVED!</b>`,
    `🏪 <b>Store:</b> ${escapeHtml(storeName)}`,
    `📅 <b>Time:</b> ${formattedTime} (BST)`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🆔 <b>Order ID:</b> <code>#${escapeHtml(order.id)}</code>`,
    `👤 <b>Customer:</b> <b>${escapeHtml(order.customerName)}</b>`,
    `📞 <b>Phone:</b> <a href="tel:${cleanPhone}">${escapeHtml(order.customerPhone)}</a>`,
    `📍 <b>Address:</b> ${escapeHtml(order.customerAddress)}${order.customerCity ? `, ${escapeHtml(order.customerCity)}` : ""}`,
    `🚚 <b>Zone:</b> ${zoneLabel}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 <b>ORDERED ITEMS:</b>`,
    itemsText || "  <i>No items specified</i>",
    `━━━━━━━━━━━━━━━━━━━━`,
    `💵 <b>Subtotal:</b> ৳${order.subtotal.toLocaleString("en-BD")}`,
    `🛵 <b>Delivery Fee:</b> ৳${order.deliveryFee.toLocaleString("en-BD")}${discountLine}`,
    `💰 <b>TOTAL PAYABLE:</b> <b>৳${order.totalAmount.toLocaleString("en-BD")}</b>`,
    `💳 <b>Payment:</b> Cash On Delivery (COD)${notesLine}`,
  ];

  if (siteUrl) {
    const adminOrderUrl = `${siteUrl.replace(/\/$/, "")}/admin/orders?search=${encodeURIComponent(order.id)}`;
    lines.push(`\n🔗 <a href="${adminOrderUrl}">👉 Open Order in Admin Portal</a>`);
  }

  return lines.join("\n");
}

/**
 * Sends a Telegram notification when a new order is received.
 */
export async function sendTelegramOrderNotification(
  order: Order,
  settings?: SiteSettings
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = (settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = (settings?.telegramChatId || process.env.TELEGRAM_CHAT_ID || "").trim();

  // If enabled setting is explicitly set to false, skip
  if (settings && settings.telegramEnabled === false) {
    return { success: false, error: "Telegram notifications are disabled in settings" };
  }

  // If credentials are not configured, exit gracefully
  if (!token || !chatId) {
    return {
      success: false,
      error: "Telegram Bot Token or Chat ID not configured (missing in settings and env)",
    };
  }

  const storeName = settings?.siteName || "HAZEN SHOP BD";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hazenshopbd.com";

  const messageText = formatTelegramOrderMessage(order, storeName, siteUrl);

  const cleanPhone = cleanPhoneNumber(order.customerPhone);
  const adminOrderUrl = `${siteUrl.replace(/\/$/, "")}/admin/orders?search=${encodeURIComponent(order.id)}`;

  // Telegram Inline Keyboard for quick 1-tap admin actions
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "🌐 View in Admin",
          url: adminOrderUrl.startsWith("http") ? adminOrderUrl : `https://${adminOrderUrl}`,
        },
        {
          text: "📞 Call Customer",
          url: `https://wa.me/${cleanPhone.replace(/[^0-9]/g, "")}`,
        },
      ],
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errDetail = data?.description || `HTTP ${response.status} ${response.statusText}`;
      console.error("[Telegram Bot] Send message failed:", errDetail);
      return { success: false, error: errDetail };
    }

    return { success: true, messageId: data.result?.message_id };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : "Unknown network error";
    console.error("[Telegram Bot] Exception while sending order alert:", message);
    return { success: false, error: message };
  }
}

/**
 * Sends a test message to verify the Telegram bot credentials and chat ID.
 */
export async function sendTelegramTestNotification(
  token: string,
  chatId: string,
  storeName: string = "HAZEN SHOP BD"
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const cleanToken = token.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken) {
    return { success: false, error: "Bot Token is required" };
  }
  if (!cleanChatId) {
    return { success: false, error: "Chat ID is required" };
  }

  const now = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const testMessage = [
    `🔔 <b>TELEGRAM BOT TEST NOTIFICATION</b>`,
    `🏪 <b>Store:</b> ${escapeHtml(storeName)}`,
    `📅 <b>Sent At:</b> ${now} (BST)`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ <b>Status:</b> Connected Successfully!`,
    ``,
    `🎉 Congratulations! Your Hazen Shop Telegram Bot is configured and working perfectly.`,
    ``,
    `Whenever a customer places an order on your website, you will receive real-time alerts with full order details, customer phone number, address, and products right here!`,
  ].join("\n");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: testMessage,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errDetail = data?.description || `HTTP ${response.status}`;
      return { success: false, error: errDetail };
    }

    return { success: true, messageId: data.result?.message_id };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to connect to Telegram API",
    };
  }
}
