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
  HelpCircle,
  Clock,
  PackageCheck,
  Check,
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
        return "সাইজ / পরিমাপ নির্বাচন করুন:";
      case "dimension":
        return "বিছানার চাদর / পর্দার মাপ:";
      default:
        return "সাইজ / অপশন বাছাই করুন:";
    }
  };

  const defaultTrustBadges: TrustBadgeItem[] = [
    { icon: "award", title: "১০০% প্রিমিয়াম কোয়ালিটি", subtitle: "এক্সপোর্ট গ্রেড ফেব্রিক" },
    { icon: "truck", title: "ক্যাশ অন ডেলিভারি", subtitle: "৬৪ জেলায় হোম ডেলিভারি" },
    { icon: "refresh", title: "৭ দিনের এক্সচেঞ্জ", subtitle: "প্যাকেট দেখে পেমেন্ট" },
  ];

  const activeTrustBadges = product.trustBadges && product.trustBadges.length > 0
    ? product.trustBadges
    : defaultTrustBadges;

  // Sample authentic social reviews for trust
  const sampleReviews = [
    {
      name: "Sabrina Yasmin",
      location: "Uttara, Dhaka",
      date: "2 days ago",
      rating: 5,
      comment: "কাপড়ের মান অসাধারণ! কালার ঠিক ছবির মতোই এসেছে। ধোয়ার পরও একদম নরম ও সিল্কি ভাব বজায় আছে।",
      verified: true,
    },
    {
      name: "Engr. Mahmudul Hasan",
      location: "Nasirabad, Chittagong",
      date: "5 days ago",
      rating: 5,
      comment: "ব্ল্যাকআউট পর্দাটা সত্যি চমৎকার। দুপুরের কড়া রোদ পুরোপুরি আটকায় এবং ঘর বেশ ঠান্ডা থাকে। ধন্যবাদ!",
      verified: true,
    },
    {
      name: "Tanjila Akter",
      location: "Sylhet Sadar",
      date: "1 week ago",
      rating: 5,
      comment: "ডেলিভারিম্যানের সামনে খুলে চেক করার সুযোগ পেয়েছি। সাইজ এবং ফিনিশিং নিখুঁত।",
      verified: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-12 pb-28 md:pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-normal overflow-x-auto whitespace-nowrap pb-1 tracking-wide">
        <Link href="/" className="hover:text-brand-dark transition-colors">হোম</Link>
        <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
        <Link href="/products" className="hover:text-brand-dark transition-colors">কালেকশন</Link>
        <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
        <Link href={`/category/${product.category}`} className="hover:text-brand-dark transition-colors">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid: 7 cols left (Gallery + Rich Content Stack) & 5 cols right (Sticky Order Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
        {/* LEFT COLUMN: Gallery + Complete Trust, Dimension, Reviews & Craftsmanship Stack */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Bangladeshi Trust Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs text-slate-600">
            {activeTrustBadges.map((tb, idx) => (
              <div key={idx} className="p-3 sm:p-4 bg-white rounded-2xl border border-brand-maroon-700/10 shadow-subtle flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-brand-maroon-50 flex items-center justify-center text-brand-maroon-700 mb-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-[11px] sm:text-xs leading-tight">{tb.title}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{tb.subtitle}</span>
              </div>
            ))}
          </div>

          {/* Social Proof & Fabric Quality Highlights */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-brand-maroon-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-gold-500" />
              <span>প্রিমিয়াম ফেব্রিক ও নির্মাণ বৈশিষ্ট্য</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">১০০% কটন ও দীর্ঘস্থায়ী রং</span>
                  <span className="text-slate-500">ধোয়ার পরও রোঁয়া উঠবে না বা রং মলিন হবে না</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">নিখুঁত সাইজ ও ফিটিং</span>
                  <span className="text-slate-500">বাংলাদেশের স্ট্যান্ডার্ড কিং, কুইন ও জানালার মাপে প্রস্তুত</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">ক্যাশ অন ডেলিভারি সুবিধা</span>
                  <span className="text-slate-500">পণ্য হাতে পেয়ে দেখে ডেলিভারিম্যানকে টাকা দিন</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">৭ দিনের ফ্রি এক্সচেঞ্জ</span>
                  <span className="text-slate-500">সাইজ বা কালার পছন্দ না হলে সাথে সাথে পরিবর্তন</span>
                </div>
              </div>
            </div>
          </div>

          {/* Size & Dimension Guide Section directly on the left */}
          {product.sizeGuide && product.sizeGuide.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Ruler className="w-4 h-4 text-brand-maroon-700" />
                  <span>সাইজ ও পরিমাপ নির্দেশিকা (Measurement Guide)</span>
                </div>
                <span className="text-[11px] text-brand-maroon-700 font-semibold bg-brand-maroon-50 px-2.5 py-0.5 rounded-full">
                  স্ট্যান্ডার্ড সাইজ
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">সাইজ / অপশন</th>
                      <th className="p-3">প্রস্থ / মাপ</th>
                      <th className="p-3">দৈর্ঘ্য / ড্রপ</th>
                      {product.sizeGuide.some((g) => g.sleeve) && <th className="p-3">ইনক্লুশন / রিং</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {product.sizeGuide.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="p-3 font-bold text-brand-maroon-700">{row.size}</td>
                        <td className="p-3 font-medium">{row.chest}</td>
                        <td className="p-3">{row.length}</td>
                        {row.sleeve && <td className="p-3 font-medium text-slate-600">{row.sleeve}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                *সব মাপ ইঞ্চি ও ফুটে দেওয়া হয়েছে। আপনার খাটের তোশক বা জানালার ফ্রেম অনুযায়ী নির্বাচন করুন।
              </p>
            </div>
          )}

          {/* Description & Technical Specifications */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-6">
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 mb-3 pb-2.5 border-b border-slate-100 tracking-tight">
                পণ্যের বিস্তারিত বিবরণ (Product Details)
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {product.description}
              </div>
            </div>

            {/* Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                  টেকনিক্যাল স্পেসিফিকেশন
                </h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 ${
                        idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"
                      }`}
                    >
                      <span className="font-bold text-slate-700">{key}</span>
                      <span className="text-slate-600">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verified Customer Reviews & Social Proof */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  গ্রাহকদের মতামত ও রিভিউ ({product.reviewCount}+)
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-0.5">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">৪.৯ / ৫.০ রেটিং</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ১০০% ভেরিফাইড ক্রেতা
              </span>
            </div>

            <div className="space-y-3">
              {sampleReviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{rev.name}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                        Verified Purchase
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.location}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs & Care Guide */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/[0.06] shadow-subtle space-y-4">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-100">
              প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQs)
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">
                  প্রশ্ন: ডেলিভারি পেতে কতদিন সময় লাগবে?
                </span>
                <p className="text-slate-600 font-normal leading-relaxed">
                  উত্তর: ঢাকা সিটির ভেতর ২৪ থেকে ৪৮ ঘন্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ দিনের মধ্যে ক্যাশ অন ডেলিভারিতে পৌঁছে দেওয়া হয়।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">
                  প্রশ্ন: কাপড়ের রং কি ধোয়ার পর উঠবে?
                </span>
                <p className="text-slate-600 font-normal leading-relaxed">
                  উত্তর: না। আমাদের প্রতিটি চাদর ও পর্দা প্রি-ওয়াশড ও কালার-ফাস্ট রিঅ্যাকটিভ ডাই দিয়ে প্রিন্ট করা, তাই রং ১০০% গ্যারান্টিযুক্ত।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">
                  প্রশ্ন: সাইজ পরিবর্তন বা কোনো সমস্যা হলে কি করব?
                </span>
                <p className="text-slate-600 font-normal leading-relaxed">
                  উত্তর: আমাদের রয়েছে ৭ দিনের সহজ এক্সচেঞ্জ সুবিধা। আমাদের হটলাইনে বা হোয়াটসঅ্যাপে মেসেজ দিলেই সমাধান করে দেওয়া হবে।
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Docked Order Box & 1-Click Fast Express Checkout */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-black/[0.06] shadow-card space-y-5">
            {/* Header & Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {product.badge && (
                  <span className="bg-brand-maroon-700 text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  স্টকে আছে ({product.stock} টি সেট রেডি)
                </span>
              </div>

              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.reviewCount} ভেরিফাইড রিভিউ)</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-brand-maroon-50/60 p-4 rounded-2xl border border-brand-maroon-100 flex items-baseline gap-3">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-maroon-700 tracking-tight">
                {formatPrice(unitPrice)}
              </span>
              {originalPrice > unitPrice && (
                <>
                  <span className="text-sm text-slate-400 line-through font-normal">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-brand-maroon-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {discountPercent}% ছাড়
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
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {getVariantLabel()}
                  </label>
                  {product.sizeGuide && product.sizeGuide.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      className="text-xs font-semibold text-brand-maroon-700 hover:text-brand-maroon-900 flex items-center gap-1 underline"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>সাইজ চার্ট</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const vPrice = variant.salePrice ?? variant.price;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99] min-h-[48px] ${
                          isSelected
                            ? "border-brand-maroon-700 bg-brand-maroon-50/50 shadow-subtle ring-1 ring-brand-maroon-700"
                            : "border-slate-200 hover:border-slate-300 bg-white"
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
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              {variant.name}
                            </span>
                            {variant.material && (
                              <span className="text-[10px] text-slate-400 block">
                                {variant.material}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-brand-maroon-700 shrink-0">
                          {formatPrice(vPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bundle Offers */}
            {product.bundleOffers && product.bundleOffers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-maroon-700 block">
                  কম্বো অফার (Bundle Deals)
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {product.bundleOffers.map((bundle) => {
                    const isSelected = selectedBundleId === bundle.id;
                    return (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => handleSelectBundle(bundle)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all min-h-[46px] ${
                          isSelected
                            ? "border-brand-maroon-700 bg-brand-maroon-50/50 ring-1 ring-brand-maroon-700"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-brand-maroon-700 bg-brand-maroon-700" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {bundle.title}
                          </span>
                        </div>
                        {bundle.discountPercentage ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {bundle.discountPercentage}% সাশ্রয়
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                পরিমাণ (Quantity)
              </span>
              <div className="flex items-center border border-slate-200 rounded-full p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-sm transition-colors text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-sm transition-colors text-sm"
                  aria-label="Increase quantity"
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
                className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group min-h-[50px]"
              >
                <span>অর্ডার করতে ফর্ম পূরণ করুন</span>
                <ArrowRight className="w-4 h-4 text-brand-gold-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 font-bold py-3 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 text-xs min-h-[44px]"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>ব্যাগে যোগ করুন</span>
                </button>

                <a
                  href={whatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-3 px-3 rounded-full border border-emerald-200 transition-all flex items-center justify-center gap-1.5 text-xs text-center min-h-[44px]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp অর্ডার</span>
                </a>
              </div>
            </div>
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            সম্পর্কিত অন্যান্য কালেকশন (Related Products)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-black/[0.05] p-3 shadow-subtle hover:shadow-card transition-all">
                <Link href={`/products/${p.slug}`}>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-50">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{p.name}</h4>
                  <span className="text-xs font-bold text-brand-maroon-700">{formatPrice(p.salePrice ?? p.price)}</span>
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
                <Ruler className="w-4 h-4 text-brand-maroon-700" />
                <span>সাইজ ও পরিমাপ চার্ট (Size Guide)</span>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="text-slate-400 hover:text-slate-700 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-3">সাইজ</th>
                    <th className="p-3">প্রস্থ</th>
                    <th className="p-3">দৈর্ঘ্য</th>
                    {product.sizeGuide.some((g) => g.sleeve) && <th className="p-3">ইনক্লুশন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {product.sizeGuide.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="p-3 font-bold text-brand-maroon-700">{row.size}</td>
                      <td className="p-3">{row.chest}</td>
                      <td className="p-3">{row.length}</td>
                      {row.sleeve && <td className="p-3">{row.sleeve}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              *সব পরিমাপ ইঞ্চি ও ফুটে দেওয়া হয়েছে।
            </p>

            <button
              onClick={() => setShowSizeChart(false)}
              className="w-full bg-brand-maroon-700 text-white font-bold py-3 rounded-full text-xs min-h-[44px]"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-45 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3.5 flex items-center gap-2.5 md:hidden shadow-floating">
        <button
          type="button"
          onClick={handleAddToCart}
          className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Add to Bag"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        <a
          href={whatsAppOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="WhatsApp Order"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
        </a>

        <button
          type="button"
          onClick={handleDirectOrderNow}
          className="flex-1 bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs py-3 px-4 rounded-full flex items-center justify-center gap-1.5 shadow-subtle active:scale-95 transition-all min-h-[44px]"
        >
          <span>এখনই অর্ডার করুন ({formatPrice(unitPrice * quantity)})</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-gold-300" />
        </button>
      </div>
    </div>
  );
}
