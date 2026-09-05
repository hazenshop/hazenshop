export type ProductVariant = {
  id: string;
  name: string; // e.g. "Size 40 (M)", "1kg Jar", "King Size (7.5ft x 8.5ft)"
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: string; // color name e.g. "Royal Maroon", "Golden Hue", "Emerald Green"
  colorCode?: string; // hex e.g. "#800000"
  material?: string; // "100% Combed Cotton", "Pure Wildflower Honey", "Egyptian Cotton"
  image?: string;
};

export type BundleOffer = {
  id: string;
  title: string; // e.g. "Buy 2 Save ৳200 + Free Delivery"
  quantity: number;
  discountPercentage?: number;
  freeShipping?: boolean;
  tag?: string; // "Most Popular", "Best Value"
};


export type SizeGuideItem = {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
};

export type TrustBadgeItem = {
  icon: "leaf" | "award" | "truck" | "refresh" | "shield" | "check";
  title: string;
  subtitle: string;
};

export type Product = {
  id: string;
  sku?: string; // Product Code / SKU (Google Merchant / Unique ID)
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string; // category slug
  categoryName: string;
  stock: number;
  rating: number;
  reviewCount: number;
  badge?: "Hot Deal" | "Best Seller" | "Trending" | "New Arrival" | "Flash Sale" | "Limited Stock" | "Exclusive" | "Popular" | "Eco Blend" | "Limited Edition" | "Smart Fitted" | string;
  featured?: boolean;
  flashSale?: boolean;
  variantType?: "size" | "weight" | "dimension" | "custom";
  variants: ProductVariant[];
  sizeGuide?: SizeGuideItem[];
  trustBadges?: TrustBadgeItem[];
  bundleOffers?: BundleOffer[];
  features?: string[];
  specifications?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  featured?: boolean;
  productCount?: number;
  createdAt: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
};

export type DeliveryZone = "dhaka" | "outside_dhaka" | "suburbs";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packaging"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "incomplete";

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity?: string;
  deliveryZone: DeliveryZone;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "COD";
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  courierName?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  siteName: string;
  hotline: string;
  whatsappNumber: string;
  supportEmail: string;
  dhakaDeliveryFee: number;
  outsideDhakaDeliveryFee: number;
  suburbsDeliveryFee: number;
  freeShippingThreshold: number;
  announcementBarActive: boolean;
  announcementBarText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  tagline?: string;
  logoUrl?: string;
  facebookPixelId?: string;
  facebookTestEventCode?: string;
  // Steadfast Courier API
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  steadfastEnabled?: boolean;
  // Pathao Courier API
  pathaoApiKey?: string;
  pathaoSecretKey?: string;
  pathaoClientId?: string;
  pathaoClientSecret?: string;
  pathaoUsername?: string;
  pathaoPassword?: string;
  pathaoStoreId?: string;
  pathaoSandbox?: boolean;
  pathaoEnabled?: boolean;
  blacklistedPhones?: string[];
  socialLinks?: Record<string, string>;
  heroBanners?: {
    id: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    badge?: string;
  }[];
};

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  originalSizeBytes?: number;
  format: string;
  width?: number;
  height?: number;
  productId?: string;
  productName?: string;
  categorySlug?: string;
  createdAt: string;
};

export type FraudRiskLevel = "low" | "medium" | "high";

export type CourierDeliveryStats = {
  courier: string;
  totalParcels: number;
  delivered: number;
  cancelled: number;
  fraudReports: number;
  successRate: number;
  cancelRate: number;
};

export type LocalOrderStats = {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  incompleteOrders: number;
};

export type FraudCheckResult = {
  phone: string;
  formattedPhone: string;
  isValidPhone: boolean;
  riskLevel: FraudRiskLevel;
  riskScore: number; // 0 (safest) to 100 (highest risk)
  recommendation: string;
  recommendationBn: string;
  isBlacklisted: boolean;
  courierStats?: CourierDeliveryStats;
  steadfastStats?: CourierDeliveryStats;
  pathaoStats?: CourierDeliveryStats;
  localStats: LocalOrderStats;
  warnings: string[];
  checkedAt: string;
};


