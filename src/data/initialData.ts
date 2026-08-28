import { Category, Product, SiteSettings } from "@/lib/types";

export const initialCategories: Category[] = [
  {
    id: "cat-panjabi",
    slug: "mens-panjabi-fashion",
    name: "Men's Panjabi & Fashion",
    description: "Premium embroidered & solid combed cotton designer Panjabis for Eid & festivities",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    productCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-agro",
    slug: "organic-agro-food",
    name: "Organic Agro & Pure Food",
    description: "100% pure Sundarban raw honey, wood-pressed mustard oil & traditional cow ghee",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop",
    productCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-bedsheets",
    slug: "luxury-bedsheets",
    name: "Luxury Bedsheets",
    description: "100% Egyptian & Organic Cotton 300+ TC bedsheet sets with pillow covers",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop",
    productCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-comforters",
    slug: "comforters-quilts",
    name: "Comforters & Quilts",
    description: "All-season microfiber cloud comforters and lightweight AC quilts",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
    productCount: 1,
    createdAt: new Date().toISOString(),
  },
];

export const initialProducts: Product[] = [
  // 1. Mens Fashion / Panjabi
  {
    id: "prod-panjabi-maroon",
    slug: "royal-maroon-embroidered-cotton-panjabi",
    name: "Royal Maroon Embroidered Semi-Fit Cotton Panjabi",
    shortDescription: "Premium 100% Combed Cotton with intricate collar & placket embroidery. Perfect for festivities & special occasions.",
    description: `Experience unparalleled elegance with our Royal Maroon Embroidered Panjabi. Crafted from premium breathable combed cotton with high color fastness.

Key Highlights:
• Fabric: 100% Pure Combed Cotton (Breathable & Soft)
• Fit: Modern Semi-Fit with fine tailored stitching
• Neckline: Mandarin Band Collar with delicate embroidery
• Sleeve: Regular full sleeve with matching embroidered cuffs
• Includes: 1 Panjabi with designer snap buttons`,
    price: 2450,
    salePrice: 1750,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    ],
    category: "mens-panjabi-fashion",
    categoryName: "Men's Panjabi & Fashion",
    stock: 24,
    rating: 4.9,
    reviewCount: 64,
    badge: "Hot Deal",
    featured: true,
    flashSale: true,
    variantType: "size",
    variants: [
      {
        id: "v-pj-38",
        name: "Size 38 (S)",
        price: 2450,
        salePrice: 1750,
        stock: 6,
        color: "Royal Maroon",
        colorCode: "#7A1C2C",
        material: "100% Combed Cotton",
      },
      {
        id: "v-pj-40",
        name: "Size 40 (M)",
        price: 2450,
        salePrice: 1750,
        stock: 8,
        color: "Royal Maroon",
        colorCode: "#7A1C2C",
        material: "100% Combed Cotton",
      },
      {
        id: "v-pj-42",
        name: "Size 42 (L)",
        price: 2450,
        salePrice: 1750,
        stock: 6,
        color: "Royal Maroon",
        colorCode: "#7A1C2C",
        material: "100% Combed Cotton",
      },
      {
        id: "v-pj-44",
        name: "Size 44 (XL)",
        price: 2450,
        salePrice: 1750,
        stock: 4,
        color: "Royal Maroon",
        colorCode: "#7A1C2C",
        material: "100% Combed Cotton",
      },
    ],
    sizeGuide: [
      { size: "38 (S)", chest: '39"', length: '39"', sleeve: '23.5"' },
      { size: "40 (M)", chest: '41"', length: '41"', sleeve: '24.5"' },
      { size: "42 (L)", chest: '43"', length: '43"', sleeve: '25.5"' },
      { size: "44 (XL)", chest: '45"', length: '45"', sleeve: '26.0"' },
      { size: "46 (XXL)", chest: '47"', length: '46"', sleeve: '26.5"' },
    ],
    trustBadges: [
      { icon: "award", title: "100% Combed Cotton", subtitle: "Export Quality Fabric" },
      { icon: "refresh", title: "7 Days Size Exchange", subtitle: "Hassle-Free Fit" },
      { icon: "truck", title: "Fast Cash on Delivery", subtitle: "Nationwide Parcel" },
    ],
    bundleOffers: [
      {
        id: "b-panjabi-2",
        title: "Buy 2 Panjabis — Save ৳300 + Free Delivery",
        quantity: 2,
        discountPercentage: 15,
        freeShipping: true,
        tag: "Most Popular",
      },
    ],
    features: [
      "100% Pure Combed Cotton Fabric",
      "Semi-Fit Tailored Silhouette",
      "Color Fastness & Anti-Shrink Guaranteed",
      "7 Days Hassle-Free Size Exchange",
    ],
    specifications: {
      "Fabric Type": "100% Combed Cotton",
      "Weave Type": "Jacquard Slub Weave",
      "Collar / Neck": "Mandarin Band Collar",
      "Sleeve Length": "Full Length",
      "Care Instructions": "Hand wash or gentle machine wash in cold water",
    },
    seoTitle: "Buy Royal Maroon Embroidered Panjabi Online in Bangladesh | Hazen",
    seoDescription: "Shop 100% pure combed cotton designer Panjabi with Cash on Delivery across Bangladesh.",
    createdAt: new Date().toISOString(),
  },

  // 2. Organic Agro / Raw Honey
  {
    id: "prod-agro-honey",
    slug: "pure-sundarban-wildflower-raw-honey",
    name: "100% Pure Organic Sundarban Raw Wild Honey (খাঁটি সুন্দরবনের মধু)",
    shortDescription: "Unprocessed, unfiltered 100% raw wild honeycomb honey collected directly by Mowali from Sundarban deep mangrove forests.",
    description: `Our 100% Pure Sundarban Raw Wild Honey is directly harvested from the mangrove forests by traditional honey-hunters (Mowali). 

Unpasteurized and raw, it retains all natural enzymes, pollen, and therapeutic antioxidants without any added sugar or chemical processing.

Purity Guarantee:
• 100% Natural Raw Honey directly from deep Sundarban
• No added sugar, syrup, or artificial preservatives
• Lab-tested moisture content < 19%
• Boosts natural immunity, throat wellness & energy`,
    price: 1100,
    salePrice: 850,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=800&auto=format&fit=crop",
    ],
    category: "organic-agro-food",
    categoryName: "Organic Agro & Pure Food",
    stock: 35,
    rating: 5.0,
    reviewCount: 92,
    badge: "Best Seller",
    featured: true,
    flashSale: true,
    variantType: "weight",
    variants: [
      {
        id: "v-honey-500g",
        name: "500g Glass Jar",
        price: 1100,
        salePrice: 850,
        stock: 20,
        color: "Amber Gold",
        colorCode: "#D97706",
        material: "100% Pure Raw Honey",
      },
      {
        id: "v-honey-1kg",
        name: "1kg Family Glass Jar",
        price: 2100,
        salePrice: 1600,
        stock: 15,
        color: "Amber Gold",
        colorCode: "#D97706",
        material: "100% Pure Raw Honey",
      },
    ],
    trustBadges: [
      { icon: "leaf", title: "100% Raw & Organic", subtitle: "Zero Chemicals / No Sugar" },
      { icon: "shield", title: "Lab Tested Purity", subtitle: "Direct from Forest" },
      { icon: "truck", title: "Cash on Delivery", subtitle: "Open & Check Parcel" },
    ],
    bundleOffers: [
      {
        id: "b-honey-2",
        title: "Buy 2 Jars (1kg Total) — Save ৳200 + Free Delivery",
        quantity: 2,
        discountPercentage: 12,
        freeShipping: true,
        tag: "Best Value",
      },
    ],
    features: [
      "100% Pure Wild Honey from deep Sundarban",
      "Completely Unpasteurized & Unheated",
      "Preserves all Natural Bee Pollen & Active Enzymes",
      "Cash on Delivery nationwide with safe packaging",
    ],
    specifications: {
      "Origin": "Sundarban Mangrove Forest, Bangladesh",
      "Harvest Method": "Traditional Sustainable Mowali Wild Harvest",
      "Purity Grade": "100% Natural Raw (No additives)",
      "Shelf Life": "24 Months in cool room temperature",
    },
    seoTitle: "Buy 100% Pure Sundarban Raw Honey in Bangladesh | Hazen Agro",
    seoDescription: "Order pure organic Sundarban wild honey online with 100% cash on delivery across BD.",
    createdAt: new Date().toISOString(),
  },

  // 3. Bedding / Luxury Bedsheet Set
  {
    id: "prod-bedsheet-emerald",
    slug: "royal-emerald-cotton-bedsheet-set",
    name: "Royal Emerald 100% Egyptian Cotton King Bedsheet Set",
    shortDescription: "Ultra-luxurious 300 Thread Count pure Egyptian cotton king bedsheet with 2 matching pillow covers.",
    description: `Transform your bedroom into a 5-star sanctuary with the Royal Emerald Bedding Set. Made from 100% long-staple Egyptian cotton for silky softness and all-season breathability.

Package Details:
• 1 King Size Bedsheet: 7.5ft x 8.5ft (90" x 100")
• 2 Matching Pillow Covers: 18" x 28" (Standard flap closure)
• Color Fastness Guarantee & Anti-Pilling finish`,
    price: 1850,
    salePrice: 1350,
    images: [
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop",
    ],
    category: "luxury-bedsheets",
    categoryName: "Luxury Bedsheets",
    stock: 18,
    rating: 4.9,
    reviewCount: 48,
    badge: "Best Seller",
    featured: true,
    flashSale: true,
    variantType: "dimension",
    variants: [
      {
        id: "v-bs-king",
        name: "King Size (7.5ft x 8.5ft)",
        price: 1850,
        salePrice: 1350,
        stock: 12,
        color: "Emerald Green",
        colorCode: "#047857",
        material: "100% Egyptian Cotton",
      },
      {
        id: "v-bs-queen",
        name: "Queen Size (7ft x 8ft)",
        price: 1750,
        salePrice: 1250,
        stock: 6,
        color: "Emerald Green",
        colorCode: "#047857",
        material: "100% Egyptian Cotton",
      },
    ],
    trustBadges: [
      { icon: "award", title: "100% Pure Cotton", subtitle: "300 Thread Count" },
      { icon: "truck", title: "Fast Delivery", subtitle: "Cash on Delivery" },
      { icon: "refresh", title: "7 Days Return", subtitle: "Color Guarantee" },
    ],
    bundleOffers: [
      {
        id: "b-bed-2",
        title: "Buy 2 Bedsheet Sets — Save ৳200 + Free Delivery",
        quantity: 2,
        discountPercentage: 10,
        freeShipping: true,
        tag: "Best Value",
      },
    ],
    features: [
      "300 Thread Count Long-Staple Pure Cotton",
      "Pre-washed for Ultra-Soft Hand Feel",
      "Vibrant Color Fastness Guarantee",
      "Includes 1 King Bedsheet + 2 Matching Pillow Covers",
    ],
    specifications: {
      "Fabric Material": "100% Egyptian Cotton",
      "Thread Count": "300 TC Percale",
      "Bedsheet Dimensions": '7.5ft x 8.5ft (90" x 100")',
      "Pillow Cover Size": '18" x 28" (2 Pieces)',
      "Care Instructions": "Machine wash cold, tumble dry low",
    },
    seoTitle: "Buy Royal Emerald Cotton King Bedsheet in BD | Hazen",
    seoDescription: "Order 100% Egyptian cotton luxury king bedsheet online with Cash on Delivery in Bangladesh.",
    createdAt: new Date().toISOString(),
  },

  // 4. Comforters & Quilts
  {
    id: "prod-comforter-cloud",
    slug: "cloud-comfort-microfiber-winter-comforter",
    name: "Cloud Comfort Microfiber All-Season Comforter Set",
    shortDescription: "Ultra-soft 350 GSM hollow microfiber comforter for cozy sleep in winter and air-conditioned rooms.",
    description: `Sleep like on a cloud with our Cloud Comfort Microfiber Comforter. Crafted with hypoallergenic microfibers and box-stitching to ensure uniform warmth without clumping.

Package Includes:
• 1 All-Season Comforter: 7.5ft x 8.5ft
• Breathable anti-allergic microfiber casing`,
    price: 2800,
    salePrice: 2150,
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop",
    ],
    category: "comforters-quilts",
    categoryName: "Comforters & Quilts",
    stock: 14,
    rating: 4.8,
    reviewCount: 32,
    badge: "Trending",
    featured: true,
    flashSale: false,
    variantType: "dimension",
    variants: [
      {
        id: "v-comf-king",
        name: "Double / King Size (7.5ft x 8.5ft)",
        price: 2800,
        salePrice: 2150,
        stock: 10,
        color: "Silver Grey",
        colorCode: "#64748B",
        material: "350 GSM Microfiber",
      },
      {
        id: "v-comf-single",
        name: "Single Size (5ft x 7.5ft)",
        price: 2200,
        salePrice: 1750,
        stock: 4,
        color: "Silver Grey",
        colorCode: "#64748B",
        material: "350 GSM Microfiber",
      },
    ],
    trustBadges: [
      { icon: "award", title: "350 GSM Microfiber", subtitle: "Cloud-Like Warmth" },
      { icon: "shield", title: "Hypoallergenic", subtitle: "Dust & Mite Free" },
      { icon: "truck", title: "Free Delivery", subtitle: "Nationwide COD" },
    ],
    features: [
      "350 GSM Ultra-Warm Hollow Microfiber Fill",
      "Box-Stitched to Prevent Filling Shift",
      "Soft Touch Peach-Finish Microfiber Fabric",
      "Machine Washable & Long Lasting",
    ],
    specifications: {
      "Filling": "350 GSM Virgin Siliconized Microfiber",
      "Shell Fabric": "Brushed Microfiber Peach Finish",
      "Dimensions": '7.5ft x 8.5ft (Double/King)',
      "Stitching": "End-to-End Box Quilted",
    },
    seoTitle: "Buy Cloud Comfort Microfiber Comforter in Bangladesh | Hazen",
    seoDescription: "Order premium 350 GSM winter and AC comforter with Cash on Delivery across BD.",
    createdAt: new Date().toISOString(),
  },
];

export const initialSiteSettings: SiteSettings = {
  siteName: "Hazen",
  hotline: "+880 1788-990011",
  whatsappNumber: "01788990011",
  supportEmail: "support@hazenbd.com",
  dhakaDeliveryFee: 60,
  outsideDhakaDeliveryFee: 120,
  suburbsDeliveryFee: 100,
  freeShippingThreshold: 2000,
  announcementBarActive: true,
  announcementBarText: "🎉 Special Promo: Free Cash on Delivery Nationwide on orders over ৳2,000!",
  seoTitle: "Hazen | Buy Premium Bedsheets, Panjabi, Organic Agro & Lifestyle in Bangladesh",
  seoDescription: "Order authentic Egyptian cotton bedsheets, designer Panjabi & 100% organic agro products with Cash on Delivery in Bangladesh.",
  seoKeywords: [
    "Hazen",
    "bedsheet bd",
    "panjabi online shopping bd",
    "sundarban raw honey bd",
    "pure cow ghee bd",
    "cash on delivery bangladesh",
    "egyptian cotton bedsheet",
  ],
};

export const initialOrders: import("@/lib/types").Order[] = [
  {
    id: "HZ-82914",
    customerName: "Kazi Tanjil",
    customerPhone: "01711223344",
    customerAddress: "House 42, Road 11, Sector 4, Uttara, Dhaka",
    deliveryZone: "dhaka",
    deliveryFee: 60,
    subtotal: 1750,
    discount: 0,
    totalAmount: 1810,
    paymentMethod: "COD",
    status: "shipped",
    courierName: "Steadfast Courier",
    trackingCode: "ST-BD-99881",
    items: [
      {
        productId: "prod-panjabi-maroon",
        productName: "Royal Maroon Embroidered Semi-Fit Cotton Panjabi",
        productSlug: "royal-maroon-embroidered-cotton-panjabi",
        productImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
        variantId: "v-pj-40",
        variantName: "Size 40 (M)",
        quantity: 1,
        price: 1750,
        total: 1750,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
