"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Edit2,
  Plus,
  Minus,
  Trash2,
  Save,
  User,
  Phone,
  MapPin,
  Truck,
  Tag,
  Package,
  FileText,
} from "lucide-react";
import { DeliveryZone, Order, OrderItem, Product, SiteSettings } from "@/lib/types";
import { formatPrice, getDeliveryFee } from "@/lib/utils";

interface OrderEditModalProps {
  order: Order;
  products: Product[];
  settings?: SiteSettings | null;
  onClose: () => void;
  onSaved: (updatedOrder: Order) => void;
}

export default function OrderEditModal({
  order,
  products,
  settings,
  onClose,
  onSaved,
}: OrderEditModalProps) {
  const [customerName, setCustomerName] = useState(order.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || "");
  const [customerAddress, setCustomerAddress] = useState(order.customerAddress || "");
  const [customerCity, setCustomerCity] = useState(order.customerCity || "");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>(order.deliveryZone || "dhaka");
  const [deliveryFee, setDeliveryFee] = useState<number>(Number(order.deliveryFee) || 0);
  const [discount, setDiscount] = useState<number>(Number(order.discount) || 0);
  const [notes, setNotes] = useState(order.notes || "");
  const [items, setItems] = useState<OrderItem[]>(
    order.items.map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      total: (Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1),
    }))
  );

  // Add new item state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCatalogProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [items]
  );

  const totalAmount = useMemo(
    () => Math.max(0, subtotal + (Number(deliveryFee) || 0) - (Number(discount) || 0)),
    [subtotal, deliveryFee, discount]
  );

  const handleZoneChange = (newZone: DeliveryZone) => {
    setDeliveryZone(newZone);
    const defaultFee = getDeliveryFee(newZone, {
      dhaka: settings?.dhakaDeliveryFee,
      outside_dhaka: settings?.outsideDhakaDeliveryFee,
      suburbs: settings?.suburbsDeliveryFee,
    });
    setDeliveryFee(defaultFee);
  };

  const handleItemQuantityChange = (index: number, newQty: number) => {
    const qty = Math.max(1, Math.round(newQty || 1));
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, quantity: qty, total: it.price * qty } : it
      )
    );
  };

  const handleItemPriceChange = (index: number, newPrice: number) => {
    const price = Math.max(0, Number(newPrice) || 0);
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, price, total: price * it.quantity } : it
      )
    );
  };

  const handleItemVariantChange = (index: number, variantId: string, matchedProduct?: Product) => {
    if (!matchedProduct) return;
    const variant = matchedProduct.variants?.find((v) => v.id === variantId);
    if (!variant) return;
    const newPrice = variant.salePrice ?? variant.price ?? matchedProduct.salePrice ?? matchedProduct.price;
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index
          ? {
              ...it,
              variantId: variant.id,
              variantName: variant.name,
              price: newPrice,
              total: newPrice * it.quantity,
            }
          : it
      )
    );
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddProduct = () => {
    if (!selectedCatalogProduct) return;
    const variant =
      selectedCatalogProduct.variants?.find((v) => v.id === selectedVariantId) ||
      selectedCatalogProduct.variants?.[0];

    const unitPrice =
      variant?.salePrice ??
      variant?.price ??
      selectedCatalogProduct.salePrice ??
      selectedCatalogProduct.price;

    const newItem: OrderItem = {
      productId: selectedCatalogProduct.id,
      productName: selectedCatalogProduct.name,
      productSlug: selectedCatalogProduct.slug,
      productImage: selectedCatalogProduct.images?.[0] || "/logo.jpg",
      variantId: variant?.id,
      variantName: variant?.name,
      quantity: 1,
      price: unitPrice,
      total: unitPrice,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedProductId("");
    setSelectedVariantId("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg("Customer name, phone, and address are required.");
      return;
    }
    if (items.length === 0) {
      setErrorMsg("Order must have at least one product.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          customerCity: customerCity.trim() || undefined,
          deliveryZone,
          deliveryFee: Math.max(0, Number(deliveryFee) || 0),
          discount: Math.max(0, Number(discount) || 0),
          notes: notes.trim(),
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        setErrorMsg(data.error || "Failed to update order.");
        return;
      }

      onSaved(data.order);
    } catch (err) {
      setErrorMsg("Network error while saving order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200 overscroll-contain">
      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl space-y-5 max-h-[94vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-white">
                  Edit Order &amp; Phone Deal
                </h3>
                <span className="font-mono font-extrabold text-[11px] sm:text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                  #{order.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Update customer details, items, unit prices, or add a phone-deal discount
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

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Customer & Delivery Info */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-brand-400" />
            <span>Customer &amp; Delivery Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Delivery Zone
              </label>
              <div className="relative">
                <Truck className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={deliveryZone}
                  onChange={(e) => handleZoneChange(e.target.value as DeliveryZone)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="dhaka">Inside Dhaka</option>
                  <option value="suburbs">Dhaka Suburbs</option>
                  <option value="outside_dhaka">Outside Dhaka</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                City / Area (Optional)
              </label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="e.g. Dhaka, Chittagong"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Order Notes / Phone Deal Note
              </label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note or special instruction..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Ordered Items & Unit Prices */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-brand-400" />
              <span>Ordered Products ({items.length})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Items Subtotal: <strong className="text-white">{formatPrice(subtotal)}</strong>
            </span>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const matchedProduct = products.find(
                (p) => p.id === item.productId || (item.productSlug && p.slug === item.productSlug)
              );
              const variants = matchedProduct?.variants || [];

              return (
                <div
                  key={`${item.productId}-${item.variantId || idx}`}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                      <Image
                        src={item.productImage || matchedProduct?.images?.[0] || "/logo.jpg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                      {variants.length > 0 ? (
                        <select
                          value={item.variantId || ""}
                          onChange={(e) => handleItemVariantChange(idx, e.target.value, matchedProduct)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-brand-500 max-w-full"
                        >
                          {variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({formatPrice(v.salePrice ?? v.price)})
                            </option>
                          ))}
                        </select>
                      ) : item.variantName ? (
                        <span className="inline-block text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                          {item.variantName}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Price, Quantity, Line Total & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    {/* Editable Unit Price */}
                    <div>
                      <label className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">
                        Unit Price (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) => handleItemPriceChange(idx, Number(e.target.value))}
                        className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Quantity Stepper */}
                    <div>
                      <label className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">
                        Qty
                      </label>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(idx, item.quantity - 1)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(idx, Number(e.target.value))}
                          className="w-10 text-center bg-transparent text-xs font-bold text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(idx, item.quantity + 1)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[65px]">
                      <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">
                        Total
                      </span>
                      <span className="text-xs font-black text-brand-400">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors self-end"
                      title={items.length <= 1 ? "At least 1 item required" : "Remove item"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Product from Catalog */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => {
                const pid = e.target.value;
                setSelectedProductId(pid);
                const prod = products.find((p) => p.id === pid);
                setSelectedVariantId(prod?.variants?.[0]?.id || "");
              }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">+ Add another product to this order...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatPrice(p.salePrice ?? p.price)}
                </option>
              ))}
            </select>

            {selectedCatalogProduct && (selectedCatalogProduct.variants?.length || 0) > 0 && (
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {selectedCatalogProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({formatPrice(v.salePrice ?? v.price)})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              disabled={!selectedCatalogProduct}
              onClick={handleAddProduct}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-brand-400 border border-slate-700 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Section 3: Pricing & Phone Deal Discount (Option A) */}
        <div className="bg-slate-950/90 border border-brand-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-brand-400 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>Phone Deal Discount &amp; Total Calculation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Delivery Charge (৳)
              </label>
              <input
                type="number"
                min={0}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                Discount Amount (৳) — Phone Deal
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Live Financial Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal:</span>
              <span className="font-bold text-slate-200">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee ({deliveryZone.replace("_", " ").toUpperCase()}):</span>
              <span className="font-bold text-slate-200">
                {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount (Phone Deal):</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-white font-black text-sm pt-2 border-t border-slate-800">
              <span>Final Payable Amount (COD):</span>
              <span className="text-base sm:text-lg text-brand-400">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-black transition-all shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Order Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
