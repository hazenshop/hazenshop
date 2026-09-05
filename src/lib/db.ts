import fs from "fs";
import path from "path";
import { isSupabaseConfigured, supabase, supabaseAdmin } from "./supabase";
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

const dbClient = supabaseAdmin || supabase;

// In-memory + disk persistence store
let cachedProducts: Product[] = readJsonFile("products.json", initialProducts);
let cachedCategories: Category[] = readJsonFile("categories.json", initialCategories);
let cachedOrders: Order[] = readJsonFile("orders.json", initialOrders);
let cachedSettings: SiteSettings = readJsonFile("settings.json", initialSiteSettings);
let cachedMedia: MediaItem[] = readJsonFile("media.json", []);

export const db = {

  // PRODUCTS
  async getProducts(options?: { category?: string; featured?: boolean; flashSale?: boolean; search?: string }): Promise<Product[]> {
    if (isSupabaseConfigured && dbClient) {
      try {
        let query = dbClient.from("products").select("*").order("created_at", { ascending: false });
        if (options?.category) query = query.eq("category", options.category);
        if (options?.featured !== undefined) query = query.eq("featured", options.featured);
        if (options?.flashSale !== undefined) query = query.eq("flash_sale", options.flashSale);
        if (options?.search) query = query.ilike("name", `%${options.search}%`);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            sku: item.sku || item.id,
            slug: item.slug,
            name: item.name,
            shortDescription: item.short_description || item.name,
            description: item.description || item.short_description || item.name,
            price: Number(item.price),
            salePrice: item.sale_price ? Number(item.sale_price) : undefined,
            images: item.images || [],
            category: item.category,
            categoryName: item.category_name,
            stock: item.is_unlimited_stock || Number(item.stock) >= 9999 ? 999999 : Number(item.stock || 0),
            isUnlimitedStock: Boolean(item.is_unlimited_stock || Number(item.stock) >= 9999),
            rating: Number(item.rating || 5),
            reviewCount: item.review_count || 0,
            badge: item.badge,
            featured: item.featured,
            flashSale: item.flash_sale,
            variants: item.variants || [],
            bundleOffers: item.bundle_offers || [],
            features: item.features || [],
            specifications: item.specifications || {},
            seoTitle: item.seo_title || item.name,
            seoDescription: item.seo_description || item.short_description || item.name,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase getProducts warning, using local fallback:", err);
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
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data, error } = await dbClient
          .from("products")
          .select("*")
          .or(`slug.eq.${slug},id.eq.${slug},sku.eq.${slug}`)
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            sku: data.sku || data.id,
            slug: data.slug,
            name: data.name,
            shortDescription: data.short_description || data.name,
            description: data.description || data.short_description || data.name,
            price: Number(data.price),
            salePrice: data.sale_price ? Number(data.sale_price) : undefined,
            images: data.images || [],
            category: data.category,
            categoryName: data.category_name,
            stock: data.is_unlimited_stock || Number(data.stock) >= 9999 ? 999999 : Number(data.stock || 0),
            isUnlimitedStock: Boolean(data.is_unlimited_stock || Number(data.stock) >= 9999),
            rating: Number(data.rating || 5),
            reviewCount: data.review_count || 0,
            badge: data.badge,
            featured: data.featured,
            flashSale: data.flash_sale,
            variants: data.variants || [],
            bundleOffers: data.bundle_offers || [],
            features: data.features || [],
            specifications: data.specifications || {},
            seoTitle: data.seo_title || data.name,
            seoDescription: data.seo_description || data.short_description || data.name,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn("Supabase getProductBySlug error:", err);
      }
    }

    cachedProducts = readJsonFile("products.json", cachedProducts);
    const item = cachedProducts.find((p) => p.slug === slug || p.id === slug || p.sku === slug);
    return item || null;
  },

  async createProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    cachedProducts = readJsonFile("products.json", cachedProducts);

    // Ensure slug is clean and unique
    let finalSlug = product.slug?.trim() || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!finalSlug) finalSlug = `product-${Date.now().toString().slice(-6)}`;

    // Collision check against existing products
    if (cachedProducts.some((p) => p.slug === finalSlug)) {
      finalSlug = `${finalSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const shortDesc = product.shortDescription?.trim() || product.name.trim() || "Premium export quality fabric";
    const fullDesc = product.description?.trim() || shortDesc;

    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      sku: product.sku || `HZN-${Date.now().toString().slice(-6)}`,
      slug: finalSlug,
      name: product.name.trim(),
      category: product.category || "luxury-bedsheets",
      categoryName: product.categoryName || "Luxury Bedsheets",
      price: Number(product.price) || 0,
      salePrice: product.salePrice !== undefined && product.salePrice !== null ? Number(product.salePrice) : undefined,
      stock: product.isUnlimitedStock ? 999999 : (product.stock !== undefined ? Number(product.stock) : 20),
      isUnlimitedStock: Boolean(product.isUnlimitedStock),
      shortDescription: shortDesc,
      description: fullDesc,
      badge: product.badge || "Best Seller",
      featured: product.featured ?? true,
      flashSale: Boolean(product.flashSale),
      variantType: product.variantType || "dimension",
      rating: Number(product.rating || 5),
      reviewCount: Number(product.reviewCount || 42),
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ["/logo.jpg"],
      variants: Array.isArray(product.variants) ? product.variants : [],
      bundleOffers: Array.isArray(product.bundleOffers) ? product.bundleOffers : [],
      features: Array.isArray(product.features) ? product.features : [],
      specifications: product.specifications || {},
      seoTitle: product.seoTitle?.trim() || product.name.trim(),
      seoDescription: product.seoDescription?.trim() || shortDesc,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && dbClient) {
      try {
        const { error } = await dbClient.from("products").insert({
          id: newProduct.id,
          sku: newProduct.sku,
          slug: newProduct.slug,
          name: newProduct.name,
          short_description: newProduct.shortDescription,
          description: newProduct.description,
          price: newProduct.price,
          sale_price: newProduct.salePrice ?? null,
          images: newProduct.images,
          category: newProduct.category,
          category_name: newProduct.categoryName,
          stock: newProduct.stock,
          is_unlimited_stock: newProduct.isUnlimitedStock,
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

        if (error) {
          console.error("Supabase insert product error:", error);
        }
      } catch (sbErr) {
        console.warn("Supabase insert product warning, persisting to disk fallback:", sbErr);
      }
    }

    cachedProducts.unshift(newProduct);
    writeJsonFile("products.json", cachedProducts);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (isSupabaseConfigured && dbClient) {
      const supabasePayload: Record<string, any> = {};
      if (updates.sku !== undefined) supabasePayload.sku = updates.sku;
      if (updates.name !== undefined) supabasePayload.name = updates.name;
      if (updates.slug !== undefined) supabasePayload.slug = updates.slug;
      if (updates.shortDescription !== undefined) supabasePayload.short_description = updates.shortDescription;
      if (updates.description !== undefined) supabasePayload.description = updates.description;
      if (updates.price !== undefined) supabasePayload.price = Number(updates.price);
      if (updates.salePrice !== undefined) supabasePayload.sale_price = updates.salePrice ? Number(updates.salePrice) : null;
      if (updates.images !== undefined) supabasePayload.images = updates.images;
      if (updates.category !== undefined) supabasePayload.category = updates.category;
      if (updates.categoryName !== undefined) supabasePayload.category_name = updates.categoryName;
      if (updates.stock !== undefined) supabasePayload.stock = updates.isUnlimitedStock ? 999999 : Number(updates.stock);
      if (updates.isUnlimitedStock !== undefined) supabasePayload.is_unlimited_stock = Boolean(updates.isUnlimitedStock);
      if (updates.badge !== undefined) supabasePayload.badge = updates.badge;
      if (updates.featured !== undefined) supabasePayload.featured = updates.featured;
      if (updates.flashSale !== undefined) supabasePayload.flash_sale = updates.flashSale;
      if (updates.variants !== undefined) supabasePayload.variants = updates.variants;
      if (updates.bundleOffers !== undefined) supabasePayload.bundle_offers = updates.bundleOffers;
      if (updates.features !== undefined) supabasePayload.features = updates.features;
      if (updates.specifications !== undefined) supabasePayload.specifications = updates.specifications;
      if (updates.seoTitle !== undefined) supabasePayload.seo_title = updates.seoTitle;
      if (updates.seoDescription !== undefined) supabasePayload.seo_description = updates.seoDescription;

      try {
        const { data, error } = await dbClient
          .from("products")
          .update(supabasePayload)
          .eq("id", id)
          .select()
          .maybeSingle();

        if (error) {
          console.error("Supabase updateProduct error:", error);
        } else if (data) {
          const updatedProduct: Product = {
            id: data.id,
            sku: data.sku || data.id,
            slug: data.slug,
            name: data.name,
            shortDescription: data.short_description || data.name,
            description: data.description || data.short_description || data.name,
            price: Number(data.price),
            salePrice: data.sale_price ? Number(data.sale_price) : undefined,
            images: data.images || [],
            category: data.category,
            categoryName: data.category_name,
            stock: data.is_unlimited_stock || Number(data.stock) >= 9999 ? 999999 : Number(data.stock || 0),
            isUnlimitedStock: Boolean(data.is_unlimited_stock || Number(data.stock) >= 9999),
            rating: Number(data.rating || 5),
            reviewCount: data.review_count || 0,
            badge: data.badge,
            featured: data.featured,
            flashSale: data.flash_sale,
            variants: data.variants || [],
            bundleOffers: data.bundle_offers || [],
            features: data.features || [],
            specifications: data.specifications || {},
            seoTitle: data.seo_title || data.name,
            seoDescription: data.seo_description || data.short_description || data.name,
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
      } catch (err) {
        console.warn("Supabase updateProduct exception:", err);
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

    if (isSupabaseConfigured && dbClient) {
      try {
        const { data } = await dbClient.from("products").select("images, variants").eq("id", id).maybeSingle();
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
        await dbClient.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteProduct error:", err);
      }
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
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data, error } = await dbClient.from("categories").select("*").order("created_at", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description || "",
            image: c.image || "/logo.jpg",
            featured: c.featured ?? true,
            productCount: c.product_count || 0,
            createdAt: c.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn("Supabase getCategories error:", err);
      }
    }
    cachedCategories = readJsonFile("categories.json", cachedCategories);
    return cachedCategories;
  },

  async getCategoryById(id: string): Promise<Category | null> {
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data, error } = await dbClient
          .from("categories")
          .select("*")
          .or(`id.eq.${id},slug.eq.${id}`)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            slug: data.slug,
            name: data.name,
            description: data.description || "",
            image: data.image || "/logo.jpg",
            featured: data.featured ?? true,
            productCount: data.product_count || 0,
            createdAt: data.created_at || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("Supabase getCategoryById warning:", err);
      }
    }

    cachedCategories = readJsonFile("categories.json", cachedCategories);
    const item = cachedCategories.find((c) => c.id === id || c.slug === id);
    return item || null;
  },

  async createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: category.slug ? `cat-${category.slug}` : `cat-${Date.now()}`,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    if (isSupabaseConfigured && dbClient) {
      try {
        const { error } = await dbClient.from("categories").insert({
          id: newCategory.id,
          slug: newCategory.slug,
          name: newCategory.name,
          description: newCategory.description || "",
          image: newCategory.image || "/logo.jpg",
          featured: newCategory.featured ?? true,
          product_count: 0,
          created_at: newCategory.createdAt,
        });
        if (error) console.error("Supabase createCategory error:", error);
      } catch (err) {
        console.warn("Supabase createCategory warning:", err);
      }
    }
    cachedCategories.push(newCategory);
    writeJsonFile("categories.json", cachedCategories);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    let updatedCat: Category | null = null;
    cachedCategories = readJsonFile("categories.json", cachedCategories);
    const localIdx = cachedCategories.findIndex((c) => c.id === id || c.slug === id);

    if (isSupabaseConfigured && dbClient) {
      try {
        const updatePayload: Record<string, any> = {};
        if (updates.name !== undefined) updatePayload.name = updates.name;
        if (updates.slug !== undefined) updatePayload.slug = updates.slug;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.image !== undefined) updatePayload.image = updates.image;
        if (updates.featured !== undefined) updatePayload.featured = updates.featured;

        let { data, error } = await dbClient
          .from("categories")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();

        if (!data) {
          const res = await dbClient
            .from("categories")
            .update(updatePayload)
            .eq("slug", id)
            .select()
            .maybeSingle();
          data = res.data;
          error = res.error;
        }

        if (!error && data) {
          updatedCat = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            description: data.description || "",
            image: data.image || "/logo.jpg",
            featured: data.featured ?? true,
            productCount: data.product_count || 0,
            createdAt: data.created_at || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("Supabase updateCategory warning:", err);
      }
    }

    if (localIdx > -1) {
      cachedCategories[localIdx] = {
        ...cachedCategories[localIdx],
        ...updates,
        ...(updatedCat || {}),
      };
      writeJsonFile("categories.json", cachedCategories);
      return cachedCategories[localIdx];
    } else if (updatedCat) {
      cachedCategories.push(updatedCat);
      writeJsonFile("categories.json", cachedCategories);
      return updatedCat;
    }

    const fallbackCat: Category = {
      id: id.startsWith("cat-") ? id : `cat-${Date.now()}`,
      slug: updates.slug || id,
      name: updates.name || id,
      description: updates.description || "",
      image: updates.image || "/logo.jpg",
      featured: updates.featured ?? true,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    cachedCategories.push(fallbackCat);
    writeJsonFile("categories.json", cachedCategories);
    return fallbackCat;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured && dbClient) {
      try {
        await dbClient.from("categories").delete().or(`id.eq.${id},slug.eq.${id}`);
      } catch (err) {
        console.warn("Supabase deleteCategory error:", err);
      }
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
    if (isSupabaseConfigured && dbClient) {
      try {
        let query = dbClient.from("orders").select("*").order("created_at", { ascending: false });
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
      } catch (err) {
        console.warn("Supabase getOrders error:", err);
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
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data, error } = await dbClient.from("orders").select("*").eq("id", id).maybeSingle();
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
      } catch (err) {
        console.warn("Supabase getOrderById error:", err);
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    const cleanId = id.trim().toUpperCase();
    const order = cachedOrders.find((o) => o.id.toUpperCase() === cleanId);
    return order || null;
  },

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data } = await dbClient
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
      } catch (err) {
        console.warn("Supabase getOrdersByPhone error:", err);
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

    if (isSupabaseConfigured && dbClient) {
      try {
        await dbClient.from("orders").insert({
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
      } catch (err) {
        console.warn("Supabase createOrder error:", err);
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    cachedOrders.unshift(newOrder);
    writeJsonFile("orders.json", cachedOrders);

    // Decrement inventory stock for ordered products (unless marked as unlimited stock)
    try {
      cachedProducts = readJsonFile("products.json", cachedProducts);
      for (const item of newOrder.items) {
        const prodIndex = cachedProducts.findIndex(
          (p) => p.id === item.productId || p.slug === item.productId
        );
        if (prodIndex > -1) {
          const currentProd = cachedProducts[prodIndex];
          if (!currentProd.isUnlimitedStock) {
            currentProd.stock = Math.max(0, currentProd.stock - item.quantity);
          }
          if (item.variantId && currentProd.variants) {
            const vIndex = currentProd.variants.findIndex((v) => v.id === item.variantId);
            if (vIndex > -1 && !currentProd.variants[vIndex].isUnlimitedStock) {
              currentProd.variants[vIndex].stock = Math.max(
                0,
                currentProd.variants[vIndex].stock - item.quantity
              );
            }
          }
          currentProd.updatedAt = new Date().toISOString();

          // Sync stock to Supabase if configured
          if (isSupabaseConfigured && dbClient) {
            await dbClient
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
    if (isSupabaseConfigured && dbClient) {
      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (courierInfo?.courierName) updatePayload.courier_name = courierInfo.courierName;
      if (courierInfo?.trackingCode) updatePayload.tracking_code = courierInfo.trackingCode;

      try {
        const { data, error } = await dbClient
          .from("orders")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();

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
      } catch (err) {
        console.warn("Supabase updateOrderStatus error:", err);
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

    // Auto-restock inventory if an active order gets cancelled/returned (only for limited stock)
    if (wasActive && isNowCancelled && cachedOrders[idx].items?.length) {
      try {
        cachedProducts = readJsonFile("products.json", cachedProducts);
        for (const item of cachedOrders[idx].items) {
          const prodIndex = cachedProducts.findIndex(
            (p) => p.id === item.productId || p.slug === item.productId
          );
          if (prodIndex > -1) {
            const currentProd = cachedProducts[prodIndex];
            if (!currentProd.isUnlimitedStock) {
              currentProd.stock += item.quantity;
            }
            if (item.variantId && currentProd.variants) {
              const vIndex = currentProd.variants.findIndex((v) => v.id === item.variantId);
              if (vIndex > -1 && !currentProd.variants[vIndex].isUnlimitedStock) {
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

  async deleteOrder(id: string): Promise<boolean> {
    if (isSupabaseConfigured && dbClient) {
      try {
        await dbClient.from("orders").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteOrder error:", err);
      }
    }

    cachedOrders = readJsonFile("orders.json", cachedOrders);
    cachedOrders = cachedOrders.filter((o) => o.id !== id);
    writeJsonFile("orders.json", cachedOrders);
    return true;
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    const base = readJsonFile("settings.json", cachedSettings);
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data, error } = await dbClient.from("site_settings").select("*").eq("id", "primary").maybeSingle();
        if (data && !error) {
          const parsedDhaka = data.dhaka_delivery_fee !== null && data.dhaka_delivery_fee !== undefined ? Number(data.dhaka_delivery_fee) : NaN;
          const parsedOutside = data.outside_dhaka_delivery_fee !== null && data.outside_dhaka_delivery_fee !== undefined ? Number(data.outside_dhaka_delivery_fee) : NaN;
          const parsedSuburbs = data.suburbs_delivery_fee !== null && data.suburbs_delivery_fee !== undefined ? Number(data.suburbs_delivery_fee) : NaN;
          const parsedThreshold = data.free_shipping_threshold !== null && data.free_shipping_threshold !== undefined ? Number(data.free_shipping_threshold) : NaN;

          cachedSettings = {
            ...base,
            siteName: data.site_name || data.store_name || base.siteName || "HAZENSHOP BD",
            tagline: data.tagline ?? base.tagline,
            logoUrl: data.logo_url ?? base.logoUrl,
            hotline: data.hotline || base.hotline,
            whatsappNumber: data.whatsapp_number || base.whatsappNumber,
            supportEmail: data.support_email || base.supportEmail,
            announcementBarText: data.announcement_bar_text ?? base.announcementBarText,
            announcementBarActive: data.announcement_bar_active ?? base.announcementBarActive,
            dhakaDeliveryFee: !isNaN(parsedDhaka) ? parsedDhaka : (base.dhakaDeliveryFee !== undefined ? Number(base.dhakaDeliveryFee) : 60),
            outsideDhakaDeliveryFee: !isNaN(parsedOutside) ? parsedOutside : (base.outsideDhakaDeliveryFee !== undefined ? Number(base.outsideDhakaDeliveryFee) : 120),
            suburbsDeliveryFee: !isNaN(parsedSuburbs) ? parsedSuburbs : (base.suburbsDeliveryFee !== undefined ? Number(base.suburbsDeliveryFee) : 100),
            freeShippingThreshold: !isNaN(parsedThreshold) ? parsedThreshold : (base.freeShippingThreshold !== undefined ? Number(base.freeShippingThreshold) : 2500),
            heroBanners: Array.isArray(data.hero_banners) && data.hero_banners.length > 0 ? data.hero_banners : base.heroBanners,
            seoTitle: data.seo_title || base.seoTitle,
            seoDescription: data.seo_description || base.seoDescription,
            seoKeywords: Array.isArray(data.seo_keywords) ? data.seo_keywords : base.seoKeywords,
            facebookPixelId: data.facebook_pixel_id || base.facebookPixelId,
            facebookTestEventCode: data.facebook_test_event_code || base.facebookTestEventCode,
            socialLinks: data.social_links ?? base.socialLinks,
            steadfastApiKey: data.steadfast_api_key || base.steadfastApiKey,
            steadfastSecretKey: data.steadfast_secret_key || base.steadfastSecretKey,
            steadfastEnabled: data.steadfast_enabled ?? base.steadfastEnabled,
            pathaoClientId: data.pathao_client_id || base.pathaoClientId,
            pathaoClientSecret: data.pathao_client_secret || base.pathaoClientSecret,
            pathaoUsername: data.pathao_username || base.pathaoUsername,
            pathaoPassword: data.pathao_password || base.pathaoPassword,
            pathaoStoreId: data.pathao_store_id || base.pathaoStoreId,
            pathaoSandbox: data.pathao_sandbox ?? base.pathaoSandbox,
            pathaoEnabled: data.pathao_enabled ?? base.pathaoEnabled,
          };
          return cachedSettings;
        }
      } catch (err) {
        console.warn("Error fetching Supabase settings, using local fallback:", err);
      }
    }
    cachedSettings = base;
    return cachedSettings;
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const base = readJsonFile("settings.json", cachedSettings);
    cachedSettings = {
      ...base,
      ...updates,
      dhakaDeliveryFee: updates.dhakaDeliveryFee !== undefined ? Number(updates.dhakaDeliveryFee) : (base.dhakaDeliveryFee !== undefined ? Number(base.dhakaDeliveryFee) : 60),
      outsideDhakaDeliveryFee: updates.outsideDhakaDeliveryFee !== undefined ? Number(updates.outsideDhakaDeliveryFee) : (base.outsideDhakaDeliveryFee !== undefined ? Number(base.outsideDhakaDeliveryFee) : 120),
      suburbsDeliveryFee: updates.suburbsDeliveryFee !== undefined ? Number(updates.suburbsDeliveryFee) : (base.suburbsDeliveryFee !== undefined ? Number(base.suburbsDeliveryFee) : 100),
      freeShippingThreshold: updates.freeShippingThreshold !== undefined ? Number(updates.freeShippingThreshold) : (base.freeShippingThreshold !== undefined ? Number(base.freeShippingThreshold) : 2500),
    };
    writeJsonFile("settings.json", cachedSettings);

    if (isSupabaseConfigured && dbClient) {
      try {
        await dbClient
          .from("site_settings")
          .upsert({
            id: "primary",
            store_name: cachedSettings.siteName,
            site_name: cachedSettings.siteName,
            tagline: cachedSettings.tagline,
            logo_url: cachedSettings.logoUrl,
            hotline: cachedSettings.hotline,
            whatsapp_number: cachedSettings.whatsappNumber,
            support_email: cachedSettings.supportEmail,
            announcement_bar_text: cachedSettings.announcementBarText,
            announcement_bar_active: cachedSettings.announcementBarActive,
            dhaka_delivery_fee: Number(cachedSettings.dhakaDeliveryFee),
            outside_dhaka_delivery_fee: Number(cachedSettings.outsideDhakaDeliveryFee),
            suburbs_delivery_fee: Number(cachedSettings.suburbsDeliveryFee),
            free_shipping_threshold: Number(cachedSettings.freeShippingThreshold),
            hero_banners: cachedSettings.heroBanners,
            seo_title: cachedSettings.seoTitle,
            seo_description: cachedSettings.seoDescription,
            seo_keywords: cachedSettings.seoKeywords,
            facebook_pixel_id: cachedSettings.facebookPixelId,
            facebook_test_event_code: cachedSettings.facebookTestEventCode,
            social_links: cachedSettings.socialLinks,
            steadfast_api_key: cachedSettings.steadfastApiKey,
            steadfast_secret_key: cachedSettings.steadfastSecretKey,
            steadfast_enabled: cachedSettings.steadfastEnabled,
            pathao_client_id: cachedSettings.pathaoClientId,
            pathao_client_secret: cachedSettings.pathaoClientSecret,
            pathao_username: cachedSettings.pathaoUsername,
            pathao_password: cachedSettings.pathaoPassword,
            pathao_store_id: cachedSettings.pathaoStoreId,
            pathao_sandbox: cachedSettings.pathaoSandbox,
            pathao_enabled: cachedSettings.pathaoEnabled,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn("Supabase settings upsert error (saved locally):", err);
      }
    }

    return cachedSettings;
  },

  // MEDIA STORAGE CRUD
  async getMediaItems(): Promise<MediaItem[]> {
    cachedMedia = readJsonFile("media.json", cachedMedia);

    // Auto-discover and sync any images stored on disk in public/uploads or public/
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      let modified = false;

      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          if (file.startsWith(".")) continue;
          const fileUrl = `/uploads/${file}`;
          const existingIdx = cachedMedia.findIndex((m) => m.url === fileUrl || m.name === file);
          const filePath = path.join(uploadsDir, file);
          const stat = fs.statSync(filePath);
          const ext = path.extname(file).replace(".", "").toLowerCase();

          if (existingIdx === -1) {
            cachedMedia.unshift({
              id: `disk-${file}`,
              name: file,
              url: fileUrl,
              sizeBytes: stat.size,
              originalSizeBytes: stat.size,
              format: ext === "jpg" ? "jpeg" : ext || "webp",
              createdAt: stat.mtime.toISOString(),
            });
            modified = true;
          } else if (!cachedMedia[existingIdx].sizeBytes || cachedMedia[existingIdx].sizeBytes === 0) {
            cachedMedia[existingIdx].sizeBytes = stat.size;
            if (!cachedMedia[existingIdx].originalSizeBytes) {
              cachedMedia[existingIdx].originalSizeBytes = stat.size;
            }
            modified = true;
          }
        }
      }

      if (modified) {
        writeJsonFile("media.json", cachedMedia);
      }
    } catch (e) {
      console.warn("Notice during disk media sync:", e);
    }

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
      if (isSupabaseConfigured && dbClient && item.url.includes("/product-images/")) {
        const fileName = item.url.split("/").pop();
        if (fileName) {
          await dbClient.storage.from("product-images").remove([fileName]);
        }
      }
      deleteFileFromDisk(item.url);
      cachedMedia = cachedMedia.filter((m) => m.id !== id && m.url !== id && m.url !== item.url);
      writeJsonFile("media.json", cachedMedia);
      return true;
    }
    return false;
  },

  async deleteFileByUrl(url: string): Promise<boolean> {
    if (isSupabaseConfigured && dbClient && url.includes("/product-images/")) {
      const fileName = url.split("/").pop();
      if (fileName) {
        await dbClient.storage.from("product-images").remove([fileName]);
      }
    }
    deleteFileFromDisk(url);
    cachedMedia = readJsonFile("media.json", cachedMedia);
    cachedMedia = cachedMedia.filter((m) => m.url !== url);
    writeJsonFile("media.json", cachedMedia);
    return true;
  },
};

