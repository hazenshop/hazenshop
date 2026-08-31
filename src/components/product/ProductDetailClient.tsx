"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  ShoppingBag,
  MessageCircle,
  Award,
  ChevronRight,
  Ruler,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Product, ProductVariant, SiteSettings, TrustBadgeItem } from "@/lib/types";
import {
  formatPrice,
  calculateDiscountPercentage,
  generateWhatsAppOrderUrl,
} from "@/lib/utils";
import { trackViewContent, trackAddToCart as trackFBCart } from "@/lib/pixel";
import ProductGallery from "@/components/product/ProductGallery";
import FastCheckoutForm from "@/components/product/FastCheckoutForm";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function ProductDetailClient({
  product,
  settings,
  relatedProducts,
}: {
  product: Product;
  settings: SiteSettings;
  relatedProducts: Product[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);

  // Trigger Facebook Pixel ViewContent on load & variant change
  useEffect(() => {
    trackViewContent(product, selectedVariant);
  }, [product, selectedVariant]);

  const unitPrice = selectedVariant
    ? selectedVariant.salePrice ?? selectedVariant.price
    : product.salePrice ?? product.price;

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const discountPercent = calculateDiscountPercentage(originalPrice, unitPrice);

  const handleSelectBundle = (bundle: NonNullable<Product["bundleOffers"]>[number]) => {
    setSelectedBundleId(bundle.id);
    setQuantity(bundle.quantity);
    showToast(`Applied ${bundle.title}`);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity, { silent: false });
    trackFBCart(product, selectedVariant, quantity);
    showToast(`Added ${quantity}x "${product.name}" to bag.`);
  };

  const handleScrollToOrder = () => {
    const el = document.getElementById("fast-order");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      addToCart(product, selectedVariant, quantity, { silent: true });
      trackFBCart(product, selectedVariant, quantity);
      router.push("/checkout");
    }
  };

  const whatsAppOrderUrl = generateWhatsAppOrderUrl(
    settings.whatsappNumber,
    [
      {
        name: product.name,
        variant: selectedVariant?.name,
        quantity,
        price: unitPrice,
      },
    ],
    unitPrice * quantity
  );

  const getVariantLabel = () => {
    switch (product.variantType) {
      case "size":
        return "সাইজ / পরিমাপ বাছাই করুন (Select Size):";
      case "weight":
        return "ওজন / পরিমাপ বাছাই করুন (Select Weight):";
      case "dimension":
        return "পর্দার মাপ বাছাই করুন (Select Dimension):";
      default:
        return "সাইজ / অপশন বাছাই করুন:";
    }
  };

  const defaultTrustBadges: TrustBadgeItem[] = [
    { icon: "award", title: "১০০% প্রিমিয়াম কোয়ালিটি", subtitle: "এক্সপোর্ট গ্রেড ফেব্রিক" },
    { icon: "truck", title: "ক্যাশ অন ডেলিভারি", subtitle: "৬৪ জেলায় হোম ডেলিভারি" },
    { icon: "shield", title: "নিরাপদ প্যাকেজিং", subtitle: "প্যাকেট দেখে পেমেন্ট" },
  ];

  const activeTrustBadges = product.trustBadges && product.trustBadges.length > 0
    ? product.trustBadges
    : defaultTrustBadges;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-10 sm:space-y-14">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-maroon-700 transition-colors">
          হোম
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link href="/products" className="hover:text-brand-maroon-700 transition-colors">
          কালেকশন
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link
          href={`/category/${product.category}`}
          className="hover:text-brand-maroon-700 transition-colors"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* ========================================================================= */}
      {/* TOP 2-COLUMN PRODUCT SHOWCASE (Left: Gallery & Specs, Right: Options & CTA) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Gallery & Authentic Product Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Gallery */}
          <div className="bg-white rounded-3xl p-2 sm:p-4 border border-black/[0.06] shadow-card">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-3">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-100">
                পণ্যের বিস্তারিত বিবরণ (Product Description)
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* Specifications Table (if provided) */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-4">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-100">
                ফেব্রিক ও স্পেসিফিকেশন (Fabric & Specs)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex justify-between items-center"
                  >
                    <span className="text-slate-500 font-medium">{key}</span>
                    <span className="font-bold text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size & Dimension Guide (if provided) */}
          {product.sizeGuide && product.sizeGuide.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Ruler className="w-4 h-4 text-brand-maroon-700" />
                  <span>সাইজ গাইড ও মাপ (Size & Dimension Guide)</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">সাইজ</th>
                      <th className="p-3">প্রস্থ (Width)</th>
                      <th className="p-3">দৈর্ঘ্য (Length)</th>
                      {product.sizeGuide.some((s) => s.sleeve) && <th className="p-3">হাতা (Sleeve)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {product.sizeGuide.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{item.size}</td>
                        <td className="p-3">{item.chest}</td>
                        <td className="p-3">{item.length}</td>
                        {item.sleeve && <td className="p-3">{item.sleeve}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Options, Pricing & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-black/[0.06] shadow-card space-y-5">
            {/* Header & Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Link
                  href={`/category/${product.category}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon-700 bg-brand-maroon-50 px-2.5 py-0.5 rounded-full border border-brand-maroon-200 hover:bg-brand-maroon-100 transition-colors"
                >
                  {product.categoryName}
                </Link>
                {product.badge && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-brand-gold-300 px-2.5 py-0.5 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 line-clamp-2">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Price Row */}
            <div className="flex flex-wrap items-baseline gap-3 pt-3 border-t border-slate-100">
              <span className="text-2xl sm:text-3xl font-heading font-black text-brand-maroon-700 tracking-tight">
                {formatPrice(unitPrice)}
              </span>

              {discountPercent > 0 && (
                <>
                  <span className="text-sm sm:text-base text-slate-400 line-through font-medium">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    {discountPercent}% ছাড়
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-semibold text-slate-700">
                {product.stock > 0 ? (
                  <>ইন স্টক ({product.stock} সেট রেডি টু শিপ)</>
                ) : (
                  <span className="text-rose-600">স্টক আউট</span>
                )}
              </span>
            </div>

            {/* Variants Selector (Mobile-Friendly Stacked Option Cards) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-900 uppercase tracking-wider">
                    {getVariantLabel()}
                  </label>
                  {selectedVariant && (
                    <span className="font-bold text-brand-maroon-700 bg-brand-maroon-50 px-2 py-0.5 rounded-md text-[11px]">
                      {selectedVariant.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const variantPrice = v.salePrice ?? v.price;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`group w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 min-h-[48px] ${
                          isSelected
                            ? "bg-brand-maroon-50/70 border-brand-maroon-700 text-slate-900 shadow-subtle ring-1 ring-brand-maroon-700"
                            : "bg-slate-50/70 hover:bg-slate-100/90 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Radio Indicator */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-brand-maroon-700 bg-brand-maroon-700"
                                : "border-slate-300 bg-white group-hover:border-slate-400"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Color Swatch if present */}
                          {v.colorCode && (
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          )}

                          {/* Variant Title - Wrap cleanly on mobile */}
                          <span
                            className={`text-xs sm:text-sm leading-snug break-words ${
                              isSelected ? "font-bold text-brand-maroon-900" : "font-medium text-slate-800"
                            }`}
                          >
                            {v.name}
                          </span>
                        </div>

                        {/* Price Tag on Right */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`text-xs sm:text-sm font-extrabold block ${
                              isSelected ? "text-brand-maroon-700" : "text-slate-700"
                            }`}
                          >
                            {formatPrice(variantPrice)}
                          </span>
                          {v.salePrice && v.salePrice < v.price && (
                            <span className="text-[10px] text-slate-400 line-through block">
                              {formatPrice(v.price)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                পরিমাণ (Quantity):
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-full p-1 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-base transition-colors shadow-subtle min-h-[36px] min-w-[36px]"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white flex items-center justify-center font-bold text-base transition-colors shadow-subtle min-h-[36px] min-w-[36px]"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  মোট মূল্য: <strong className="text-slate-900 font-bold">{formatPrice(unitPrice * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Bundle Offers (if any) */}
            {product.bundleOffers && product.bundleOffers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  স্পেশাল অফার প্যাক (Special Combos):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {product.bundleOffers.map((bundle) => {
                    const isSelected = selectedBundleId === bundle.id;
                    return (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => handleSelectBundle(bundle)}
                        className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between min-h-[44px] ${
                          isSelected
                            ? "bg-brand-maroon-50/70 border-brand-maroon-700 text-brand-maroon-900 font-bold shadow-subtle ring-1 ring-brand-maroon-700"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-gold-500 shrink-0" />
                          <span>{bundle.title}</span>
                        </div>
                        {bundle.tag && (
                          <span className="bg-brand-gold-300 text-brand-dark text-[10px] font-black px-2 py-0.5 rounded-full">
                            {bundle.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {/* Direct 1-Click Order Anchor CTA */}
              <button
                type="button"
                onClick={handleScrollToOrder}
                className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider min-h-[48px] group"
              >
                <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
                <ArrowRight className="w-4 h-4 text-brand-gold-300 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Add To Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-slate-800 font-bold py-3.5 px-6 rounded-full border border-slate-200 transition-all flex items-center justify-center gap-2 text-xs min-h-[44px]"
              >
                <ShoppingBag className="w-4 h-4 text-brand-maroon-700" />
                <span>ব্যাগে যোগ করুন (Add to Cart)</span>
              </button>

              {/* WhatsApp Inquiry */}
              <a
                href={whatsAppOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-50 hover:bg-emerald-100 active:scale-[0.99] text-emerald-800 font-bold py-3 px-6 rounded-full border border-emerald-200 transition-all flex items-center justify-center gap-2 text-xs min-h-[42px]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp এ সরাসরি যোগাযোগ</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
              {activeTrustBadges.map((b, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-200/50 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-brand-maroon-50 text-brand-maroon-700 flex items-center justify-center mx-auto text-xs">
                    ✓
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800 leading-tight">{b.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">{b.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM FULL-WIDTH CASH ON DELIVERY (COD) EXPRESS CHECKOUT SECTION */}
      {/* ========================================================================= */}
      <section className="pt-4 sm:pt-6">
        <div className="max-w-3xl mx-auto">
          <FastCheckoutForm
            product={product}
            selectedVariant={selectedVariant}
            quantity={quantity}
            settings={settings}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RELATED PRODUCTS SHOWCASE */}
      {/* ========================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-black/[0.05] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-maroon-700 tracking-widest block mb-1">
                More in this Collection
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                সম্পর্কিত পণ্যসমূহ (Related Products)
              </h3>
            </div>
            <Link
              href={`/category/${product.category}`}
              className="text-xs font-semibold text-slate-600 hover:text-brand-maroon-700 flex items-center gap-1"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
