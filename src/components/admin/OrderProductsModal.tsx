"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ExternalLink,
  Edit,
  Package,
  ShoppingBag,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { Order, OrderItem, Product } from "@/lib/types";
import { formatPrice, getStatusColor } from "@/lib/utils";

interface OrderProductsModalProps {
  order: Order | null;
  products: Product[];
  onClose: () => void;
  onOpenInvoice?: (order: Order) => void;
  onOpenFraudCheck?: (order: Order) => void;
  onOpenCourier?: (order: Order) => void;
}

export default function OrderProductsModal({
  order,
  products,
  onClose,
  onOpenInvoice,
  onOpenFraudCheck,
  onOpenCourier,
}: OrderProductsModalProps) {
  if (!order) return null;

  const statusStyle = getStatusColor(order.status);

  // Helper to resolve live product details from database
  const getResolvedProduct = (item: OrderItem) => {
    const matched = products.find(
      (p) => p.id === item.productId || (item.productSlug && p.slug === item.productSlug)
    );

    const slug = item.productSlug || matched?.slug || "";
    const image = item.productImage || matched?.images?.[0] || "";
    const liveStock = matched?.stock;
    const isUnlimited = matched?.isUnlimitedStock;
    const categoryName = matched?.categoryName;
    const sku = matched?.sku;
    const productId = item.productId || matched?.id;

    // Match variant details
    const matchedVariant = matched?.variants?.find(
      (v) => v.id === item.variantId || (item.variantName && v.name === item.variantName)
    );

    return {
      matched,
      slug,
      image,
      liveStock,
      isUnlimited,
      categoryName,
      sku: matchedVariant?.sku || sku,
      productId,
      variantColor: matchedVariant?.color,
      variantMaterial: matchedVariant?.material,
    };
  };

  const whatsappPhone = order.customerPhone.replace(/[^0-9]/g, "");
  const formattedWaPhone = whatsappPhone.startsWith("88")
    ? whatsappPhone
    : `88${whatsappPhone.startsWith("0") ? whatsappPhone : `0${whatsappPhone}`}`;

  const waMessage = encodeURIComponent(
    `আসসালামু আলাইকুম ${order.customerName},\nhazenshopbd.com এ অর্ডার #${order.id} প্লেস করার জন্য ধন্যবাদ।\nমোট টাকার পরিমাণ: ${order.totalAmount} টাকা (ক্যাশ অন ডেলিভারি)।`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200 overscroll-contain">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 sm:space-y-5 max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">
                  Ordered Products
                </h3>
                <span className="font-mono font-extrabold text-[11px] sm:text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                  #{order.id}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                View ordered items, live product pages &amp; stock
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer & Order Brief Bar (Responsive Layout) */}
        <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-xs sm:text-sm">{order.customerName}</span>
              <a
                href={`tel:${order.customerPhone}`}
                className="font-mono font-bold text-brand-400 hover:underline flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]"
              >
                <Phone className="w-3 h-3" />
                <span>{order.customerPhone}</span>
              </a>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-900">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {order.status}
              </span>
              <span className="font-black text-white text-xs sm:text-sm">
                COD: <span className="text-brand-400">{formatPrice(order.totalAmount)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-slate-400 text-[11px] pt-1.5 border-t border-slate-900 leading-tight">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {order.customerAddress || "No address provided"} •{" "}
              <strong className="text-slate-300 uppercase">
                Zone: {order.deliveryZone.replace("_", " ")}
              </strong>
            </span>
          </div>
        </div>

        {/* Ordered Products Section */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 text-[11px]">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
              Ordered Items ({order.items.length})
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 hidden xs:inline">
              Tap buttons to open store page
            </span>
          </div>

          <div className="space-y-3">
            {order.items.map((item, idx) => {
              const {
                slug,
                image,
                liveStock,
                isUnlimited,
                categoryName,
                sku,
                productId,
                variantColor,
                variantMaterial,
              } = getResolvedProduct(item);

              return (
                <div
                  key={idx}
                  className="bg-slate-950/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-3 hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Product Image Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900 group">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded">
                        x{item.quantity}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                        <div className="min-w-0 pr-1">
                          {slug ? (
                            <Link
                              href={`/products/${slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-white text-xs sm:text-sm hover:text-brand-300 transition-colors line-clamp-2 inline-flex items-center gap-1 group"
                              title="Open Live Product Page"
                            >
                              <span>{item.productName}</span>
                              <ExternalLink className="w-3 h-3 text-brand-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </Link>
                          ) : (
                            <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                              {item.productName}
                            </h4>
                          )}
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1">
                          <span className="font-black text-brand-400 text-xs sm:text-sm">
                            {formatPrice(item.total)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Variant & Attributes Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.variantName && (
                          <span className="bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded">
                            {item.variantName}
                          </span>
                        )}
                        {variantColor && (
                          <span className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-medium px-2 py-0.5 rounded">
                            {variantColor}
                          </span>
                        )}
                        {variantMaterial && (
                          <span className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-medium px-2 py-0.5 rounded">
                            {variantMaterial}
                          </span>
                        )}
                        {sku && (
                          <span className="font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px] border border-slate-800">
                            SKU: {sku}
                          </span>
                        )}
                        {categoryName && (
                          <span className="text-slate-500 text-[10px] hidden sm:inline">
                            in {categoryName}
                          </span>
                        )}
                      </div>

                      {/* Live Stock Status Indicator */}
                      <div className="flex items-center gap-1.5 pt-0.5 text-[10.5px] sm:text-[11px]">
                        {isUnlimited ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Unlimited Stock
                          </span>
                        ) : liveStock !== undefined ? (
                          liveStock > 5 ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Warehouse Stock: {liveStock} available
                            </span>
                          ) : liveStock > 0 ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock: Only {liveStock} left
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Out of Stock (0 units)
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500">Live stock not synced</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Direct Product Actions (Touch-Friendly Responsive Buttons) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs">
                    <div className="text-[10.5px] text-slate-400">
                      ID: <span className="font-mono text-slate-300">{productId || item.productId}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                      {slug && (
                        <a
                          href={`/products/${slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-brand-dark font-black text-xs py-2 px-3 rounded-xl shadow-sm transition-all"
                        >
                          <span>Live Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {productId && (
                        <a
                          href={`/admin/products/${productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs py-2 px-3 rounded-xl border border-slate-700 transition-colors"
                          title="Edit product details in Admin"
                        >
                          <Edit className="w-3 h-3 text-slate-400" />
                          <span>Admin Edit</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Totals Summary */}
        <div className="bg-slate-950 p-3 rounded-xl sm:rounded-2xl border border-slate-800 text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Items ({order.items.reduce((s, i) => s + i.quantity, 0)} pcs):</span>
            <span className="text-slate-200 font-bold">{formatPrice(order.subtotal || order.totalAmount - (order.deliveryFee || 0))}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Delivery ({order.deliveryZone.replace("_", " ").toUpperCase()}):</span>
            <span className="text-slate-200 font-bold">{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-slate-900">
            <span>Payable Amount (COD):</span>
            <span className="text-brand-400 text-base">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Quick Order Actions Footer (Fully Responsive for Phones and Desktops) */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2">
            <a
              href={`https://wa.me/${formattedWaPhone}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {onOpenInvoice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInvoice(order);
                }}
                className="bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <Printer className="w-4 h-4" />
                <span>Invoice</span>
              </button>
            )}

            {onOpenFraudCheck && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFraudCheck(order);
                }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Fraud Check</span>
              </button>
            )}

            {onOpenCourier && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCourier(order);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <Truck className="w-4 h-4" />
                <span>Courier</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="col-span-2 sm:col-span-1 sm:ml-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-colors min-h-[42px]"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
