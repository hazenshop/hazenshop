import fs from "fs";
import path from "path";
import { isSupabaseConfigured, supabase } from "./supabase";
import { Category, Order, Product, SiteSettings, OrderStatus, MediaItem } from "./types";
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

function deleteFileFromDisk(fileUrl: string) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  try {
    const filename = path.basename(fileUrl);
    const diskPath = path.join(process.cwd(), "public", "uploads", filename);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  } catch (err) {
    console.error("Error deleting file from disk:", fileUrl, err);
  }
}

// In-memory + disk persistence store
let cachedProducts: Product[] = readJsonFile("products.json", initialProducts);
let cachedCategories: Category[] = readJsonFile("categories.json", initialCategories);
let cachedOrders: Order[] = readJsonFile("orders.json", initialOrders);
let cachedSettings: SiteSettings = readJsonFile("settings.json", initialSiteSettings);
let cachedMedia: MediaItem[] = readJsonFile("media.json", []);

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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .limit(1)
        .single();
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
    if (isSupabaseConfigured && supabase) {
      const supabasePayload: Record<string, any> = {};
      if (updates.name !== undefined) supabasePayload.name = updates.name;
      if (updates.slug !== undefined) supabasePayload.slug = updates.slug;
      if (updates.shortDescription !== undefined) supabasePayload.short_description = updates.shortDescription;
      if (updates.description !== undefined) supabasePayload.description = updates.description;
      if (updates.price !== undefined) supabasePayload.price = updates.price;
      if (updates.salePrice !== undefined) supabasePayload.sale_price = updates.salePrice;
      if (updates.images !== undefined) supabasePayload.images = updates.images;
      if (updates.category !== undefined) supabasePayload.category = updates.category;
      if (updates.categoryName !== undefined) supabasePayload.category_name = updates.categoryName;
      if (updates.stock !== undefined) supabasePayload.stock = updates.stock;
      if (updates.badge !== undefined) supabasePayload.badge = updates.badge;
      if (updates.featured !== undefined) supabasePayload.featured = updates.featured;
      if (updates.flashSale !== undefined) supabasePayload.flash_sale = updates.flashSale;
      if (updates.variants !== undefined) supabasePayload.variants = updates.variants;
      if (updates.bundleOffers !== undefined) supabasePayload.bundle_offers = updates.bundleOffers;
      if (updates.features !== undefined) supabasePayload.features = updates.features;
      if (updates.specifications !== undefined) supabasePayload.specifications = updates.specifications;
      if (updates.seoTitle !== undefined) supabasePayload.seo_title = updates.seoTitle;
      if (updates.seoDescription !== undefined) supabasePayload.seo_description = updates.seoDescription;

      const { data, error } = await supabase
        .from("products")
        .update(supabasePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const updatedProduct: Product = {
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

        cachedProducts = readJsonFile("products.json", cachedProducts);
        const idx = cachedProducts.findIndex((p) => p.id === id);
        if (idx > -1) {
          cachedProducts[idx] = updatedProduct;
        } else {
          cachedProducts.unshift(updatedProduct);
        }
        writeJsonFile("products.json", cachedProducts);

        return updatedProduct;
      }
    }

    cachedProducts = readJsonFile("products.json", cachedProducts);
    const idx = cachedProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    cachedProducts[idx] = { ...cachedProducts[idx], ...updates };
    writeJsonFile("products.json", cachedProducts);

    return cachedProducts[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const imagesToDelete = new Set<string>();

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("products").select("images, variants").eq("id", id).single();
      if (data?.images && Array.isArray(data.images)) {
        data.images.forEach((img: string) => {
          if (img && typeof img === "string" && img.startsWith("/uploads/")) {
            imagesToDelete.add(img);
          }
        });
      }
      if (data?.variants && Array.isArray(data.variants)) {
        data.variants.forEach((v: any) => {
          if (v?.image && typeof v.image === "string" && v.image.startsWith("/uploads/")) {
            imagesToDelete.add(v.image);
          }
        });
      }
      await supabase.from("products").delete().eq("id", id);
    }

    cachedProducts = readJsonFile("products.json", cachedProducts);
    const prodToDelete = cachedProducts.find((p) => p.id === id);

    if (prodToDelete) {
      if (prodToDelete.images && Array.isArray(prodToDelete.images)) {
        prodToDelete.images.forEach((img) => {
          if (img && typeof img === "string" && img.startsWith("/uploads/")) {
            imagesToDelete.add(img);
          }
        });
      }
      if (prodToDelete.variants && Array.isArray(prodToDelete.variants)) {
        prodToDelete.variants.forEach((v) => {
          if (v.image && typeof v.image === "string" && v.image.startsWith("/uploads/")) {
            imagesToDelete.add(v.image);
          }
        });
      }
    }

    imagesToDelete.forEach((imgUrl) => {
      deleteFileFromDisk(imgUrl);
    });

    cachedProducts = cachedProducts.filter((p) => p.id !== id);
    writeJsonFile("products.json", cachedProducts);

    cachedMedia = readJsonFile("media.json", cachedMedia);
    cachedMedia = cachedMedia.filter((m) => !imagesToDelete.has(m.url));
    writeJsonFile("media.json", cachedMedia);

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

  async getCategoryById(id: string): Promise<Category | null> {
    cachedCategories = readJsonFile("categories.json", cachedCategories);
    const item = cachedCategories.find((c) => c.id === id || c.slug === id);
    return item || null;
  },

  async createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      productCount: 0,
      createdAt: new Date().toISOString(),
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
        created_at: newCategory.createdAt,
      });
    }
    cachedCategories.push(newCategory);
    writeJsonFile("categories.json", cachedCategories);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (isSupabaseConfigured && supabase) {
      const updatePayload: Record<string, any> = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.slug !== undefined) updatePayload.slug = updates.slug;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.image !== undefined) updatePayload.image = updates.image;
      if (updates.featured !== undefined) updatePayload.featured = updates.featured;

      const { data, error } = await supabase
        .from("categories")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const updatedCat: Category = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          image: data.image,
          featured: data.featured,
          productCount: data.product_count || 0,
          createdAt: data.created_at || new Date().toISOString(),
        };

        cachedCategories = readJsonFile("categories.json", cachedCategories);
        const idx = cachedCategories.findIndex((c) => c.id === id || c.slug === id);
        if (idx > -1) {
          cachedCategories[idx] = updatedCat;
        } else {
          cachedCategories.push(updatedCat);
        }
        writeJsonFile("categories.json", cachedCategories);

        return updatedCat;
      }
    }

    cachedCategories = readJsonFile("categories.json", cachedCategories);
    const idx = cachedCategories.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) return null;

    cachedCategories[idx] = { ...cachedCategories[idx], ...updates };
    writeJsonFile("categories.json", cachedCategories);
    return cachedCategories[idx];
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("categories").delete().eq("id", id);
    }

    cachedCategories = readJsonFile("categories.json", cachedCategories);
    const idx = cachedCategories.findIndex((c) => c.id === id || c.slug === id);
    if (idx > -1) {
      const cat = cachedCategories[idx];
      if (cat.image && typeof cat.image === "string" && cat.image.startsWith("/uploads/")) {
        deleteFileFromDisk(cat.image);
        cachedMedia = readJsonFile("media.json", cachedMedia);
        cachedMedia = cachedMedia.filter((m) => m.url !== cat.image && m.categorySlug !== cat.slug);
        writeJsonFile("media.json", cachedMedia);
      }
      cachedCategories.splice(idx, 1);
      writeJsonFile("categories.json", cachedCategories);
    }
    return true;
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
      for (const item of newOrder.items) {
        const prodIndex = cachedProducts.findIndex(
          (p) => p.id === item.productId || p.slug === item.productId
        );
        if (prodIndex > -1) {
          const currentProd = cachedProducts[prodIndex];
          currentProd.stock = Math.max(0, currentProd.stock - item.quantity);
          if (item.variantId && currentProd.variants) {
            const vIndex = currentProd.variants.findIndex((v) => v.id === item.variantId);
            if (vIndex > -1) {
              currentProd.variants[vIndex].stock = Math.max(
                0,
                currentProd.variants[vIndex].stock - item.quantity
              );
            }
          }
          currentProd.updatedAt = new Date().toISOString();

          // Sync stock to Supabase if configured
          if (isSupabaseConfigured && supabase) {
            await supabase
              .from("products")
              .update({
                stock: currentProd.stock,
                variants: currentProd.variants,
              })
              .eq("id", currentProd.id);
          }
        }
      }
      writeJsonFile("products.json", cachedProducts);
    } catch (err) {
      console.error("Failed to update product stock", err);
    }

    return newOrder;
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    courierInfo?: { courierName?: string; trackingCode?: string }
  ): Promise<Order | null> {
    if (isSupabaseConfigured && supabase) {
      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (courierInfo?.courierName) updatePayload.courier_name = courierInfo.courierName;
      if (courierInfo?.trackingCode) updatePayload.tracking_code = courierInfo.trackingCode;

      const { data, error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const updatedOrder: Order = {
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

        cachedOrders = readJsonFile("orders.json", cachedOrders);
        const idx = cachedOrders.findIndex((o) => o.id === id);
        if (idx > -1) {
          cachedOrders[idx] = updatedOrder;
        } else {
          cachedOrders.unshift(updatedOrder);
        }
        writeJsonFile("orders.json", cachedOrders);

        return updatedOrder;
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    const idx = cachedOrders.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    const previousStatus = cachedOrders[idx].status;
    const isNowCancelled = status === "cancelled" || status === "returned";
    const wasActive = previousStatus !== "cancelled" && previousStatus !== "returned";

    cachedOrders[idx] = {
      ...cachedOrders[idx],
      status,
      ...(courierInfo?.courierName ? { courierName: courierInfo.courierName } : {}),
      ...(courierInfo?.trackingCode ? { trackingCode: courierInfo.trackingCode } : {}),
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile("orders.json", cachedOrders);

    // Auto-restock inventory if an active order gets cancelled/returned
    if (wasActive && isNowCancelled && cachedOrders[idx].items?.length) {
      try {
        cachedProducts = readJsonFile("products.json", cachedProducts);
        for (const item of cachedOrders[idx].items) {
          const prodIndex = cachedProducts.findIndex(
            (p) => p.id === item.productId || p.slug === item.productId
          );
          if (prodIndex > -1) {
            const currentProd = cachedProducts[prodIndex];
            currentProd.stock += item.quantity;
            if (item.variantId && currentProd.variants) {
              const vIndex = currentProd.variants.findIndex((v) => v.id === item.variantId);
              if (vIndex > -1) {
                currentProd.variants[vIndex].stock += item.quantity;
              }
            }
            currentProd.updatedAt = new Date().toISOString();
          }
        }
        writeJsonFile("products.json", cachedProducts);
      } catch (err) {
        console.error("Failed to restock cancelled order products", err);
      }
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

  // MEDIA STORAGE CRUD
  async getMediaItems(): Promise<MediaItem[]> {
    cachedMedia = readJsonFile("media.json", cachedMedia);
    return cachedMedia;
  },

  async createMediaItem(item: MediaItem): Promise<MediaItem> {
    cachedMedia = readJsonFile("media.json", cachedMedia);
    cachedMedia.unshift(item);
    writeJsonFile("media.json", cachedMedia);
    return item;
  },

  async deleteMediaItem(id: string): Promise<boolean> {
    cachedMedia = readJsonFile("media.json", cachedMedia);
    const item = cachedMedia.find((m) => m.id === id || m.url === id);
    if (item) {
      deleteFileFromDisk(item.url);
      cachedMedia = cachedMedia.filter((m) => m.id !== id && m.url !== id && m.url !== item.url);
      writeJsonFile("media.json", cachedMedia);
      return true;
    }
    return false;
  },

  async deleteFileByUrl(url: string): Promise<boolean> {
    deleteFileFromDisk(url);
    cachedMedia = readJsonFile("media.json", cachedMedia);
    cachedMedia = cachedMedia.filter((m) => m.url !== url);
    writeJsonFile("media.json", cachedMedia);
    return true;
  },
};

