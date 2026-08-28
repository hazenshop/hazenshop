import fs from "fs";
import path from "path";
import { isSupabaseConfigured, supabase } from "./supabase";
import { Category, Order, Product, SiteSettings, OrderStatus } from "./types";
import {
  initialCategories,
  initialOrders,
  initialProducts,
  initialSiteSettings,
} from "../data/initialData";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      // ignore
    }
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading ${filename}`, e);
    }
  }
  return defaultValue;
}

function writeJsonFile<T>(filename: string, data: T) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error writing ${filename}`, e);
  }
}

// In-memory + disk persistence store
let cachedProducts: Product[] = readJsonFile("products.json", initialProducts);
let cachedCategories: Category[] = readJsonFile("categories.json", initialCategories);
let cachedOrders: Order[] = readJsonFile("orders.json", initialOrders);
let cachedSettings: SiteSettings = readJsonFile("settings.json", initialSiteSettings);

export const db = {
  // PRODUCTS
  async getProducts(options?: { category?: string; featured?: boolean; flashSale?: boolean; search?: string }): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (options?.category) query = query.eq("category", options.category);
      if (options?.featured !== undefined) query = query.eq("featured", options.featured);
      if (options?.flashSale !== undefined) query = query.eq("flash_sale", options.flashSale);
      if (options?.search) query = query.ilike("name", `%${options.search}%`);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          shortDescription: item.short_description,
          description: item.description,
          price: Number(item.price),
          salePrice: item.sale_price ? Number(item.sale_price) : undefined,
          images: item.images || [],
          category: item.category,
          categoryName: item.category_name,
          stock: item.stock,
          rating: Number(item.rating || 5),
          reviewCount: item.review_count || 0,
          badge: item.badge,
          featured: item.featured,
          flashSale: item.flash_sale,
          variants: item.variants || [],
          bundleOffers: item.bundle_offers || [],
          features: item.features || [],
          specifications: item.specifications || {},
          seoTitle: item.seo_title,
          seoDescription: item.seo_description,
          createdAt: item.created_at,
        }));
      }
    }

    cachedProducts = readJsonFile("products.json", cachedProducts);
    let result = [...cachedProducts];
    if (options?.category) {
      result = result.filter((p) => p.category === options.category);
    }
    if (options?.featured !== undefined) {
      result = result.filter((p) => p.featured === options.featured);
    }
    if (options?.flashSale !== undefined) {
      result = result.filter((p) => p.flashSale === options.flashSale);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug,
          name: data.name,
          shortDescription: data.short_description,
          description: data.description,
          price: Number(data.price),
          salePrice: data.sale_price ? Number(data.sale_price) : undefined,
          images: data.images || [],
          category: data.category,
          categoryName: data.category_name,
          stock: data.stock,
          rating: Number(data.rating || 5),
          reviewCount: data.review_count || 0,
          badge: data.badge,
          featured: data.featured,
          flashSale: data.flash_sale,
          variants: data.variants || [],
          bundleOffers: data.bundle_offers || [],
          features: data.features || [],
          specifications: data.specifications || {},
          seoTitle: data.seo_title,
          seoDescription: data.seo_description,
          createdAt: data.created_at,
        };
      }
    }

    cachedProducts = readJsonFile("products.json", cachedProducts);
    const item = cachedProducts.find((p) => p.slug === slug || p.id === slug);
    return item || null;
  },

  async createProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from("products").insert({
        id: newProduct.id,
        slug: newProduct.slug,
        name: newProduct.name,
        short_description: newProduct.shortDescription,
        description: newProduct.description,
        price: newProduct.price,
        sale_price: newProduct.salePrice,
        images: newProduct.images,
        category: newProduct.category,
        category_name: newProduct.categoryName,
        stock: newProduct.stock,
        rating: newProduct.rating,
        review_count: newProduct.reviewCount,
        badge: newProduct.badge,
        featured: newProduct.featured,
        flash_sale: newProduct.flashSale,
        variants: newProduct.variants,
        bundle_offers: newProduct.bundleOffers,
        features: newProduct.features,
        specifications: newProduct.specifications,
        seo_title: newProduct.seoTitle,
        seo_description: newProduct.seoDescription,
        created_at: newProduct.createdAt,
      });
    }

    cachedProducts.unshift(newProduct);
    writeJsonFile("products.json", cachedProducts);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    cachedProducts = readJsonFile("products.json", cachedProducts);
    const idx = cachedProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    cachedProducts[idx] = { ...cachedProducts[idx], ...updates };
    writeJsonFile("products.json", cachedProducts);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("products")
        .update({
          name: updates.name,
          slug: updates.slug,
          short_description: updates.shortDescription,
          description: updates.description,
          price: updates.price,
          sale_price: updates.salePrice,
          images: updates.images,
          category: updates.category,
          category_name: updates.categoryName,
          stock: updates.stock,
          badge: updates.badge,
          featured: updates.featured,
          flash_sale: updates.flashSale,
          variants: updates.variants,
          bundle_offers: updates.bundleOffers,
          features: updates.features,
          specifications: updates.specifications,
          seo_title: updates.seoTitle,
          seo_description: updates.seoDescription,
        })
        .eq("id", id);
    }

    return cachedProducts[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    cachedProducts = readJsonFile("products.json", cachedProducts);
    cachedProducts = cachedProducts.filter((p) => p.id !== id);
    writeJsonFile("products.json", cachedProducts);
    if (isSupabaseConfigured && supabase) {
      await supabase.from("products").delete().eq("id", id);
    }
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data) {
        return data.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          image: c.image,
          featured: c.featured,
          productCount: c.product_count,
          createdAt: c.created_at || new Date().toISOString(),
        }));
      }
    }
    cachedCategories = readJsonFile("categories.json", cachedCategories);
    return cachedCategories;
  },

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from("categories").insert({
        id: newCategory.id,
        slug: newCategory.slug,
        name: newCategory.name,
        description: newCategory.description,
        image: newCategory.image,
        featured: newCategory.featured,
        product_count: 0,
      });
    }
    cachedCategories.push(newCategory);
    writeJsonFile("categories.json", cachedCategories);
    return newCategory;
  },

  // ORDERS
  async getOrders(options?: { status?: OrderStatus; search?: string }): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (options?.status) query = query.eq("status", options.status);
      const { data, error } = await query;
      if (!error && data) {
        return data.map((o) => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerAddress: o.customer_address,
          customerCity: o.customer_city,
          deliveryZone: o.delivery_zone,
          deliveryFee: Number(o.delivery_fee),
          subtotal: Number(o.subtotal),
          discount: Number(o.discount || 0),
          totalAmount: Number(o.total_amount),
          paymentMethod: o.payment_method,
          status: o.status,
          notes: o.notes,
          items: o.items || [],
          courierName: o.courier_name,
          trackingCode: o.tracking_code,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        }));
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    let result = [...cachedOrders];
    if (options?.status) {
      result = result.filter((o) => o.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
      if (!error && data) {
        return {
          id: data.id,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          customerAddress: data.customer_address,
          customerCity: data.customer_city,
          deliveryZone: data.delivery_zone,
          deliveryFee: Number(data.delivery_fee),
          subtotal: Number(data.subtotal),
          discount: Number(data.discount || 0),
          totalAmount: Number(data.total_amount),
          paymentMethod: data.payment_method,
          status: data.status,
          notes: data.notes,
          items: data.items || [],
          courierName: data.courier_name,
          trackingCode: data.tracking_code,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    const cleanId = id.trim().toUpperCase();
    const order = cachedOrders.find((o) => o.id.toUpperCase() === cleanId);
    return order || null;
  },

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .ilike("customer_phone", `%${cleanPhone}%`)
        .order("created_at", { ascending: false });
      if (data) {
        return data.map((o) => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerAddress: o.customer_address,
          customerCity: o.customer_city,
          deliveryZone: o.delivery_zone,
          deliveryFee: Number(o.delivery_fee),
          subtotal: Number(o.subtotal),
          discount: Number(o.discount || 0),
          totalAmount: Number(o.total_amount),
          paymentMethod: o.payment_method,
          status: o.status,
          notes: o.notes,
          items: o.items || [],
          courierName: o.courier_name,
          trackingCode: o.tracking_code,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        }));
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    return cachedOrders.filter((o) => {
      const orderPhone = o.customerPhone.replace(/[^0-9]/g, "");
      return orderPhone.includes(cleanPhone) || cleanPhone.includes(orderPhone);
    });
  },

  async createOrder(orderData: Omit<Order, "createdAt" | "updatedAt">): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from("orders").insert({
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        customer_address: newOrder.customerAddress,
        customer_city: newOrder.customerCity,
        delivery_zone: newOrder.deliveryZone,
        delivery_fee: newOrder.deliveryFee,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        status: newOrder.status,
        notes: newOrder.notes,
        items: newOrder.items,
        courier_name: newOrder.courierName,
        tracking_code: newOrder.trackingCode,
        created_at: newOrder.createdAt,
        updated_at: newOrder.updatedAt,
      });
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    cachedOrders.unshift(newOrder);
    writeJsonFile("orders.json", cachedOrders);

    // Decrement inventory stock for ordered products
    try {
      cachedProducts = readJsonFile("products.json", cachedProducts);
      newOrder.items.forEach((item) => {
        const prodIndex = cachedProducts.findIndex((p) => p.id === item.productId);
        if (prodIndex > -1) {
          const currentProd = cachedProducts[prodIndex];
          currentProd.stock = Math.max(0, currentProd.stock - item.quantity);
          if (item.variantId && currentProd.variants) {
            const vIndex = currentProd.variants.findIndex((v) => v.id === item.variantId);
            if (vIndex > -1) {
              currentProd.variants[vIndex].stock = Math.max(0, currentProd.variants[vIndex].stock - item.quantity);
            }
          }
          currentProd.updatedAt = new Date().toISOString();
        }
      });
      writeJsonFile("products.json", cachedProducts);
    } catch (err) {
      console.error("Failed to update product stock", err);
    }

    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus, courierInfo?: { courierName?: string; trackingCode?: string }): Promise<Order | null> {
    cachedOrders = readJsonFile("orders.json", cachedOrders);
    const idx = cachedOrders.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    cachedOrders[idx] = {
      ...cachedOrders[idx],
      status,
      ...(courierInfo?.courierName ? { courierName: courierInfo.courierName } : {}),
      ...(courierInfo?.trackingCode ? { trackingCode: courierInfo.trackingCode } : {}),
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile("orders.json", cachedOrders);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("orders")
        .update({
          status,
          ...(courierInfo?.courierName ? { courier_name: courierInfo.courierName } : {}),
          ...(courierInfo?.trackingCode ? { tracking_code: courierInfo.trackingCode } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    return cachedOrders[idx];
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("site_settings").select("*").eq("id", "primary").single();
      if (data) {
        return {
          siteName: data.site_name || data.store_name || "Hazen",
          tagline: data.tagline,
          logoUrl: data.logo_url,
          hotline: data.hotline,
          whatsappNumber: data.whatsapp_number,
          supportEmail: data.support_email,
          announcementBarText: data.announcement_bar_text,
          announcementBarActive: data.announcement_bar_active,
          dhakaDeliveryFee: Number(data.dhaka_delivery_fee),
          outsideDhakaDeliveryFee: Number(data.outside_dhaka_delivery_fee),
          suburbsDeliveryFee: Number(data.suburbs_delivery_fee),
          freeShippingThreshold: Number(data.free_shipping_threshold),
          heroBanners: data.hero_banners || [],
          seoTitle: data.seo_title,
          seoDescription: data.seo_description,
          seoKeywords: data.seo_keywords || [],
          socialLinks: data.social_links || {},
        };
      }
    }
    cachedSettings = readJsonFile("settings.json", cachedSettings);
    return cachedSettings;
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    cachedSettings = readJsonFile("settings.json", cachedSettings);
    cachedSettings = { ...cachedSettings, ...updates };
    writeJsonFile("settings.json", cachedSettings);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("site_settings")
        .upsert({
          id: "primary",
          store_name: cachedSettings.siteName,
          tagline: cachedSettings.tagline,
          logo_url: cachedSettings.logoUrl,
          hotline: cachedSettings.hotline,
          whatsapp_number: cachedSettings.whatsappNumber,
          support_email: cachedSettings.supportEmail,
          announcement_bar_text: cachedSettings.announcementBarText,
          announcement_bar_active: cachedSettings.announcementBarActive,
          dhaka_delivery_fee: cachedSettings.dhakaDeliveryFee,
          outside_dhaka_delivery_fee: cachedSettings.outsideDhakaDeliveryFee,
          suburbs_delivery_fee: cachedSettings.suburbsDeliveryFee,
          free_shipping_threshold: cachedSettings.freeShippingThreshold,
          hero_banners: cachedSettings.heroBanners,
          seo_title: cachedSettings.seoTitle,
          seo_description: cachedSettings.seoDescription,
          seo_keywords: cachedSettings.seoKeywords,
          social_links: cachedSettings.socialLinks,
          updated_at: new Date().toISOString(),
        });
    }

    return cachedSettings;
  },
};
