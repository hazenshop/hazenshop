import { Category, Order, Product, SiteSettings } from "@/lib/types";

export const initialCategories: Category[] = [
  {
    id: "cat-bedsheets",
    slug: "luxury-bedsheets",
    name: "Luxury Bedsheets (বিছানার চাদর)",
    description: "100% Egyptian & Organic Combed Cotton 300+ TC bedsheet sets with matching pillow & bolster covers",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop",
    featured: true,
    productCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-window-curtains",
    slug: "window-curtains",
    name: "Window Curtains & Porda (জানালার পর্দা)",
    description: "Premium Jacquard, textured window drapery and sheer panels with anti-rust brass eyelet rings",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    featured: true,
    productCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-blackout-curtains",
    slug: "blackout-curtains",
    name: "100% Blackout Curtains (ব্ল্যাকআউট পর্দা)",
    description: "Triple-weave thermal insulated room-darkening curtains for serene sleep and sound reduction",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
    featured: true,
    productCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-comforters",
    slug: "comforters-quilts",
    name: "Comforters & AC Quilts (কমফোর্টার ও এসি কুইল্ট)",
    description: "All-season 350 GSM cloud microfiber quilts and reversible luxury duvet bedding sets",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
    featured: true,
    productCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-sheer-curtains",
    slug: "sheer-curtains",
    name: "Sheer & Net Curtains (শিয়ার ও শিফন পর্দা)",
    description: "Light-filtering airy sheer window panels with elegant drape for living and dining spaces",
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?q=80&w=800&auto=format&fit=crop",
    featured: false,
    productCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-fitted-bedsheets",
    slug: "fitted-bedsheets",
    name: "Fitted Elastic Bedsheets (ফিটেড চাদর)",
    description: "360-degree all-around elastic grip bedsheets that stay wrinkle-free on any mattress",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop",
    featured: false,
    productCount: 0,
    createdAt: new Date().toISOString(),
  },
];

// Clean initial empty products array ready for real products from Admin
export const initialProducts: Product[] = [];

// Clean initial empty orders array ready for real customer orders
export const initialOrders: Order[] = [];

export const initialSiteSettings: SiteSettings = {
  siteName: "HAZENSHOP BD — Luxury Living",
  tagline: "Artisanal Bedsheets & Designer Window Curtains",
  hotline: "+880 1700-000000",
  whatsappNumber: "8801700000000",
  supportEmail: "support@hazenshopbd.com",
  dhakaDeliveryFee: 60,
  outsideDhakaDeliveryFee: 120,
  suburbsDeliveryFee: 100,
  freeShippingThreshold: 2500,
  announcementBarActive: true,
  announcementBarText: "✨ বিশেষ অফার: hazenshopbd.com এর সকল বেডশিট ও পর্দা কালেকশনে ক্যাশ অন ডেলিভারি সুবিধা!",
  seoTitle: "HAZENSHOP BD (hazenshopbd.com) — Luxury Bedsheets & Window Curtains in Bangladesh",
  seoDescription: "Shop export-quality 100% Egyptian cotton bedsheets, comforters, and blackout window curtains online at hazenshopbd.com with Cash on Delivery nationwide.",
  seoKeywords: [
    "hazenshopbd",
    "hazenshopbd.com",
    "hazenshop",
    "hazenshop.com",
    "bedsheets bangladesh",
    "badsheet",
    "bichanar chador",
    "window porda",
    "curtains bd",
    "blackout curtains dhaka",
    "egyptian cotton bedsheet",
    "comforter sets",
    "luxury bedding"
  ],
  facebookPixelId: "2242388576616945",
  facebookTestEventCode: "TEST82490",
  heroBanners: [
    {
      id: "hero-1",
      title: "Luxury Bedsheets & Designer Window Curtains",
      subtitle: "Export-grade 100% Egyptian cotton bedsheet sets, 100% blackout window drapes, and cloud comforters delivered with Cash on Delivery nationwide across Bangladesh.",
      buttonText: "Explore Collections",
      buttonLink: "/products",
      image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop",
      badge: "Seasonal Home Living Edition",
    }
  ]
};
