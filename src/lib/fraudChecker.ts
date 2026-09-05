import { db } from "@/lib/db";
import { CourierDeliveryStats, FraudCheckResult, FraudRiskLevel, LocalOrderStats, SiteSettings } from "@/lib/types";
import { getPathaoToken } from "@/lib/courier/pathao";

export function cleanAndValidateBdPhone(phone: string): {
  isValid: boolean;
  cleanPhone: string;
  formattedPhone: string;
} {
  let cleaned = phone.replace(/[^0-9]/g, "");
  
  if (cleaned.startsWith("880")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("88") && cleaned.length === 13) {
    cleaned = cleaned.substring(2);
  }

  // BD phone numbers are 11 digits starting with 01[3-9]
  const isValid = /^01[3-9][0-9]{8}$/.test(cleaned);

  return {
    isValid,
    cleanPhone: cleaned,
    formattedPhone: isValid ? `+88${cleaned}` : cleaned,
  };
}

export async function fetchSteadfastFraudStats(
  cleanPhone: string,
  settings: SiteSettings
): Promise<CourierDeliveryStats | null> {
  const apiKey = (settings.steadfastApiKey || process.env.STEADFAST_API_KEY || "").trim();
  const secretKey = (settings.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY || "").trim();

  if (!apiKey || !secretKey) {
    return null;
  }

  try {
    const res = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${cleanPhone}`, {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    // Steadfast structure: total_parcels, total_delivered, total_cancelled, total_fraud_reports
    const totalParcels = Number(data.total_parcels || data.Total_parcels || 0);
    const delivered = Number(data.total_delivered || data.Total_delivered || 0);
    const cancelled = Number(data.total_cancelled || data.Total_cancelled || 0);
    const fraudReports = Number(data.total_fraud_reports || data.Total_fraud_reports || 0);

    const successRate = totalParcels > 0 ? Math.round((delivered / totalParcels) * 100) : 100;
    const cancelRate = totalParcels > 0 ? Math.round((cancelled / totalParcels) * 100) : 0;

    return {
      courier: "Steadfast Courier",
      totalParcels,
      delivered,
      cancelled,
      fraudReports,
      successRate,
      cancelRate,
    };
  } catch (err) {
    console.warn("Error checking Steadfast fraud check API:", err);
    return null;
  }
}

export async function fetchPathaoFraudStats(
  cleanPhone: string,
  settings: SiteSettings
): Promise<CourierDeliveryStats | null> {
  const clientId = (settings.pathaoClientId || process.env.PATHAO_CLIENT_ID || "").trim();
  const clientSecret = (settings.pathaoClientSecret || process.env.PATHAO_CLIENT_SECRET || "").trim();
  const username = (settings.pathaoUsername || process.env.PATHAO_USERNAME || "").trim();
  const password = (settings.pathaoPassword || process.env.PATHAO_PASSWORD || "").trim();

  if (!clientId || !clientSecret || !username || !password) {
    return null;
  }

  try {
    const tokenResult = await getPathaoToken(settings);
    if (!tokenResult.success || !tokenResult.token) {
      return null;
    }

    const baseUrl = settings.pathaoSandbox
      ? "https://courier-api-sandbox.pathao.com"
      : "https://api-hermes.pathao.com";

    const res = await fetch(`${baseUrl}/aladdin/api/v1/orders?search=${cleanPhone}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const ordersList = data.data?.data || (Array.isArray(data.data) ? data.data : []);

    if (!ordersList || ordersList.length === 0) {
      return null;
    }

    const totalParcels = ordersList.length;
    const delivered = ordersList.filter((o: any) =>
      /delivered/i.test(o.order_status || o.status || "")
    ).length;
    const cancelled = ordersList.filter((o: any) =>
      /cancel|return/i.test(o.order_status || o.status || "")
    ).length;

    const successRate = totalParcels > 0 ? Math.round((delivered / totalParcels) * 100) : 100;
    const cancelRate = totalParcels > 0 ? Math.round((cancelled / totalParcels) * 100) : 0;

    return {
      courier: "Pathao Courier",
      totalParcels,
      delivered,
      cancelled,
      fraudReports: 0,
      successRate,
      cancelRate,
    };
  } catch (err) {
    console.warn("Error querying Pathao orders history:", err);
    return null;
  }
}

export async function performFraudCheck(
  phone: string,
  options?: {
    customerName?: string;
    customerAddress?: string;
  }
): Promise<FraudCheckResult> {
  const { isValid, cleanPhone, formattedPhone } = cleanAndValidateBdPhone(phone);
  const settings = await db.getSettings();
  const warnings: string[] = [];

  const isBlacklisted = Boolean(
    settings.blacklistedPhones &&
      settings.blacklistedPhones.some((p) => {
        const c = p.replace(/[^0-9]/g, "");
        return c.includes(cleanPhone) || cleanPhone.includes(c);
      })
  );

  if (isBlacklisted) {
    warnings.push("এই নাম্বারটি আপনার স্টোরের ব্ল্যাকলিস্টে (Blocklist) রয়েছে!");
  }

  if (!isValid) {
    warnings.push("মোবাইল নাম্বারটি সঠিক বাংলাদেশী ১১-ডিজিট ফরম্যাটে নেই।");
  }

  // Local Store Order History
  const localOrders = await db.getOrdersByPhone(cleanPhone);
  const localStats: LocalOrderStats = {
    totalOrders: localOrders.length,
    completedOrders: localOrders.filter((o) => o.status === "delivered").length,
    cancelledOrders: localOrders.filter((o) => o.status === "cancelled" || o.status === "returned").length,
    incompleteOrders: localOrders.filter((o) => o.status === "incomplete").length,
  };

  // Check for duplicate recent orders (spammer behavior)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const recentDuplicates = localOrders.filter(
    (o) => o.createdAt >= fifteenMinutesAgo && o.status !== "cancelled"
  );
  if (recentDuplicates.length >= 2) {
    warnings.push(`গত ১৫ মিনিটে একই নাম্বার থেকে ${recentDuplicates.length}টি অর্ডার সাবমিট করা হয়েছে (সম্ভাব্য স্প্যাম)।`);
  }

  // Check address quality
  if (options?.customerAddress) {
    const addr = options.customerAddress.trim().toLowerCase();
    const isJunkAddress =
      addr.length < 6 ||
      /^(asdf|test|fake|xxx|1234|aaaa|bbbb|none|dhaka|bd)+$/i.test(addr) ||
      /(.)\1{4,}/.test(addr);
    if (isJunkAddress) {
      warnings.push("ঠিকানাটি অসম্পূর্ণ বা সন্দেহজনক মনে হচ্ছে (Suspicious Address Text)।");
    }
  }

  // Fetch Courier Delivery Stats in parallel (Steadfast + Pathao)
  const [steadfastStats, pathaoStats] = await Promise.all([
    fetchSteadfastFraudStats(cleanPhone, settings),
    fetchPathaoFraudStats(cleanPhone, settings),
  ]);

  // Combined Courier Aggregation
  let courierStats: CourierDeliveryStats | undefined;
  const couriersWithData = [steadfastStats, pathaoStats].filter(Boolean) as CourierDeliveryStats[];

  if (couriersWithData.length > 0) {
    const totalParcels = couriersWithData.reduce((sum, c) => sum + c.totalParcels, 0);
    const delivered = couriersWithData.reduce((sum, c) => sum + c.delivered, 0);
    const cancelled = couriersWithData.reduce((sum, c) => sum + c.cancelled, 0);
    const fraudReports = couriersWithData.reduce((sum, c) => sum + c.fraudReports, 0);

    const successRate = totalParcels > 0 ? Math.round((delivered / totalParcels) * 100) : 100;
    const cancelRate = totalParcels > 0 ? Math.round((cancelled / totalParcels) * 100) : 0;

    const names = couriersWithData.map((c) => c.courier.replace(" Courier", "")).join(" & ");

    courierStats = {
      courier: `${names} Network`,
      totalParcels,
      delivered,
      cancelled,
      fraudReports,
      successRate,
      cancelRate,
    };
  }

  // Compute Risk Score (0 to 100)
  let riskScore = 0;

  if (isBlacklisted) {
    riskScore += 90;
  }

  if (!isValid) {
    riskScore += 40;
  }

  if (courierStats) {
    if (courierStats.fraudReports > 0) {
      riskScore += 50;
      warnings.push(`অন্যান্য মার্চেন্টরা এই নাম্বারে ${courierStats.fraudReports}টি ফ্রড/প্রতারণা রিপোর্ট করেছে!`);
    }

    if (courierStats.totalParcels >= 2) {
      if (courierStats.successRate < 40) {
        riskScore += 50;
        warnings.push(`কুরিয়ারে ডেলিভারি সফলতার হার মাত্র ${courierStats.successRate}% (${courierStats.cancelled}টি পার্সেল রিটার্ন/বাতিল)।`);
      } else if (courierStats.successRate < 65) {
        riskScore += 30;
        warnings.push(`কুরিয়ারে ডেলিভারি সফলতার হার ${courierStats.successRate}% (মাঝারি ঝুঁকি)।`);
      } else if (courierStats.successRate >= 85) {
        riskScore = Math.max(0, riskScore - 15);
      }
    }
  }

  if (localStats.cancelledOrders >= 2) {
    riskScore += 35;
    warnings.push(`আপনার দোকানে পূর্বে ${localStats.cancelledOrders}টি অর্ডার বাতিল বা রিটার্ন হয়েছে।`);
  }

  if (recentDuplicates.length >= 2) {
    riskScore += 25;
  }

  // Clamp risk score
  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel: FraudRiskLevel = "low";
  let recommendation = "Safe Order - Recommended for regular COD dispatch";
  let recommendationBn = "নিরাপদ কাস্টমার - ক্যাশ অন ডেলিভারিতে পার্সেল পাঠাতে পারেন";

  if (riskScore >= 60 || isBlacklisted) {
    riskLevel = "high";
    recommendation = "High Return Risk / Fake Order - Require advance courier charge or cancel";
    recommendationBn = "উচ্চ ঝুঁকি / ভুয়া অর্ডার সতর্কতা - ডেলিভারি চার্জ অগ্রিম নিন অথবা অর্ডার বাতিল করুন";
  } else if (riskScore >= 30) {
    riskLevel = "medium";
    recommendation = "Moderate Risk - Call customer to verify address and intent before packing";
    recommendationBn = "মাঝারি ঝুঁকি - পার্সেল প্যাক করার আগে কাস্টমারকে কল দিয়ে ঠিকানা নিশ্চিত করুন";
  }

  return {
    phone: cleanPhone,
    formattedPhone,
    isValidPhone: isValid,
    riskLevel,
    riskScore,
    recommendation,
    recommendationBn,
    isBlacklisted,
    courierStats,
    steadfastStats: steadfastStats || undefined,
    pathaoStats: pathaoStats || undefined,
    localStats,
    warnings,
    checkedAt: new Date().toISOString(),
  };
}
