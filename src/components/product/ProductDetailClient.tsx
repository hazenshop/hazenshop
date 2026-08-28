"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Award,
  Leaf,
  ChevronRight,
  Ruler,
  X,
  ArrowRight,
} from "lucide-react";
import { Product, ProductVariant, SiteSettings, TrustBadgeItem } from "@/lib/types";
import {
  formatPrice,
  calculateDiscountPercentage,
  generateWhatsAppOrderUrl,
} from "@/lib/utils";
import ProductGallery from "@/components/product/ProductGallery";
import UrgencyTimer from "@/components/product/UrgencyTimer";
import FastCheckoutForm from "@/components/product/FastCheckoutForm";
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
    product.variants[0] || undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

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
    showToast(`Added ${quantity}x "${product.name}" to bag.`);
  };

  const handleDirectOrderNow = () => {
    // Scroll smoothly to the fast checkout section
    const el = document.getElementById("fast-order");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      addToCart(product, selectedVariant, quantity, { silent: true });
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
        return "Select Dimensions / Size:";
      case "weight":
        return "Select Package / Weight:";
      case "dimension":
        return "Select Bedding Size:";
      default:
        return "Select Option:";
    }
  };

  const renderBadgeIcon = (iconName: TrustBadgeItem["icon"]) => {
    switch (iconName) {
      case "leaf":
        return <Leaf className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />;
      case "shield":
        return <ShieldCheck className="w-4 h-4 text-slate-700 mx-auto mb-1.5" />;
      case "truck":
        return <Truck className="w-4 h-4 text-slate-700 mx-auto mb-1.5" />;
      case "refresh":
        return <RefreshCw className="w-4 h-4 text-slate-700 mx-auto mb-1.5" />;
      default:
        return <Award className="w-4 h-4 text-brand-600 mx-auto mb-1.5" />;
    }
  };

  const defaultTrustBadges: TrustBadgeItem[] = [
    { icon: "award", title: "100% Authentic", subtitle: "Export Grade" },
    { icon: "truck", title: "Cash on Delivery", subtitle: "Nationwide" },
    { icon: "refresh", title: "7 Days Exchange", subtitle: "Hassle-Free" },
  ];

  const activeTrustBadges = product.trustBadges && product.trustBadges.length > 0
    ? product.trustBadges
    : defaultTrustBadges;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 pb-28 md:pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-normal overflow-x-auto whitespace-nowrap pb-1 tracking-wide">
        <Link href="/" className="hover:text-brand-dark transition-colors">Overview</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href="/products" className="hover:text-brand-dark transition-colors">Collections</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href={`/category/${product.category}`} className="hover:text-brand-dark transition-colors">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery & Trust Badges */}
        <div className="lg:col-span-6 space-y-6">
          <ProductGallery images={product.images} name={product.name} />

          {/* Minimal Trust Badges */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-600 pt-2">
            {activeTrustBadges.map((tb, idx) => (
              <div key={idx} className="p-3.5 bg-white rounded-2xl border border-black/[0.05] shadow-subtle">
                {renderBadgeIcon(tb.icon)}
                <span className="font-semibold block text-slate-900 text-xs">{tb.title}</span>
                <span className="text-[10px] text-slate-400">{tb.subtitle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info, Buy Box & Express Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-subtle space-y-6">
            {/* Header & Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {product.badge && (
                  <span className="bg-brand-dark text-white font-medium text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  In Stock ({product.stock} sets ready)
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
                  ))}
                </div>
                <span className="font-semibold text-slate-900">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.reviewCount} verified reviews)</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 flex items-baseline gap-3">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                {formatPrice(unitPrice)}
              </span>
              {originalPrice > unitPrice && (
                <>
                  <span className="text-sm text-slate-400 line-through font-normal">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-brand-dark text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Scarcity Countdown */}
            <UrgencyTimer stock={product.stock} />

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {getVariantLabel()}
                  </label>
                  {product.sizeGuide && product.sizeGuide.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      className="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1 underline"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const vPrice = variant.salePrice ?? variant.price;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                          isSelected
                            ? "border-brand-dark bg-slate-50 shadow-subtle ring-1 ring-brand-dark"
                            : "border-slate-200/80 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {variant.colorCode && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: variant.colorCode }}
                            />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-slate-900 block">
                              {variant.name}
                            </span>
                            {variant.material && (
                              <span className="text-[10px] text-slate-400 block">
                                {variant.material}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {formatPrice(vPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bundle Deals */}
            {product.bundleOffers && product.bundleOffers.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Curated Quantity Bundles:</span>
                </label>
                <div className="space-y-2">
                  {product.bundleOffers.map((bundle) => {
                    const isSelected = selectedBundleId === bundle.id;
                    return (
                      <div
                        key={bundle.id}
                        onClick={() => handleSelectBundle(bundle)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all active:scale-[0.99] ${
                          isSelected
                            ? "border-brand-dark bg-slate-50 shadow-subtle ring-1 ring-brand-dark"
                            : "border-slate-200/80 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-brand-dark bg-brand-dark" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs font-semibold text-slate-900">{bundle.title}</span>
                        </div>
                        {bundle.tag && (
                          <span className="bg-brand-dark text-white font-medium text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {bundle.tag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Quick Action */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-full bg-white shadow-subtle overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDirectOrderNow}
                className="w-full bg-brand-dark hover:bg-brand-charcoal active:scale-[0.99] text-white font-medium py-3.5 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider group"
              >
                <span>Instant Cash on Delivery Order (এখনই অর্ডার করুন)</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-slate-100 hover:bg-slate-200/80 active:scale-[0.99] text-slate-800 font-medium py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>

                <a
                  href={whatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-full border border-slate-200/80 transition-all flex items-center justify-center gap-2 text-xs text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>

            {/* Highlights */}
            {product.features && product.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Highlights & Warranty
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Embedded 1-Click Fast Checkout Form */}
          <FastCheckoutForm
            product={product}
            selectedVariant={selectedVariant}
            quantity={quantity}
            settings={settings}
          />
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.06] shadow-subtle space-y-8">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 tracking-tight">
            Design Notes & Material Craftsmanship
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-4 font-normal">
            {product.description}
          </div>
        </div>

        {/* Specifications Table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Technical Specifications
            </h3>
            <div className="rounded-2xl border border-slate-200/80 overflow-hidden text-xs">
              {Object.entries(product.specifications).map(([key, val], idx) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3.5 ${
                    idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"
                  }`}
                >
                  <span className="font-medium text-slate-700">{key}</span>
                  <span className="text-slate-600">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
            Complementary Pieces
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-black/[0.05] p-3 shadow-subtle hover:shadow-card transition-all">
                <Link href={`/products/${p.slug}`}>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-50">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{p.name}</h4>
                  <span className="text-xs font-bold text-brand-700">{formatPrice(p.salePrice ?? p.price)}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && product.sizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-floating space-y-4 border border-black/10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Ruler className="w-4 h-4 text-brand-600" />
                <span>Dimension & Size Guide</span>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/80 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                  <tr>
                    <th className="p-3">Option / Dimension</th>
                    <th className="p-3">Width / Measurement</th>
                    <th className="p-3">Length / Drop</th>
                    {product.sizeGuide.some((g) => g.sleeve) && <th className="p-3">Inclusions / Hardware</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {product.sizeGuide.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="p-3 font-semibold text-brand-dark">{row.size}</td>
                      <td className="p-3">{row.chest}</td>
                      <td className="p-3">{row.length}</td>
                      {row.sleeve && <td className="p-3">{row.sleeve}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              *All measurements are in inches. Standard comfort allowance included.
            </p>

            <button
              onClick={() => setShowSizeChart(false)}
              className="w-full bg-brand-dark text-white font-medium py-2.5 rounded-full text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-45 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3.5 flex items-center gap-2.5 md:hidden shadow-floating">
        <button
          type="button"
          onClick={handleAddToCart}
          className="p-3 bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 active:scale-95 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
          aria-label="Add to Bag"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleDirectOrderNow}
          className="flex-1 bg-brand-dark hover:bg-brand-charcoal active:scale-98 text-white font-medium py-3 px-4 rounded-full shadow-card transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider min-h-[44px]"
        >
          <span>Order Now • {formatPrice(unitPrice * quantity)}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>
    </div>
  );
}


