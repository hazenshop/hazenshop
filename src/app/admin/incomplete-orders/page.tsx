"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Phone,
  MessageCircle,
  CheckCircle2,
  Trash2,
  Search,
  Download,
  ArrowLeft,
  ExternalLink,
  Package,
  ShoppingBag,
  Clock,
  User,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { Order, SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function IncompleteOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [orderRes, setRes] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
      ]);
      if (orderRes.orders) {
        setOrders(orderRes.orders);
      }
      if (setRes.settings) setSettings(setRes.settings);
    } catch (e) {
      console.error(e);
      showToast("Failed to load incomplete orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter only incomplete orders
  const incompleteOrders = orders.filter((o) => o.status === "incomplete");

  const filteredOrders = incompleteOrders.filter((o) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerAddress && o.customerAddress.toLowerCase().includes(q)) ||
      (o.notes && o.notes.toLowerCase().includes(q)) ||
      o.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  });

  const totalPotentialValue = incompleteOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  // Convert Incomplete Draft to Confirmed / Pending Order
  const handleConvertToOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "pending",
          notes: `Recovered by admin on ${new Date().toLocaleDateString("en-US")}`,
        }),
      });

      if (res.ok) {
        showToast(`Draft #${orderId} successfully converted to Pending Order!`, "success");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "pending" } : o))
        );
      } else {
        showToast("Failed to convert order", "error");
      }
    } catch {
      showToast("Network error while converting order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Incomplete Lead
  const handleDeleteDraft = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete lead #${orderId}?`)) return;
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`Lead #${orderId} deleted`, "success");
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        showToast("Failed to delete lead", "error");
      }
    } catch {
      showToast("Network error while deleting lead", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // WhatsApp Recovery Message Generator
  const getWhatsAppLink = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/[^0-9]/g, "");
    const phone = rawPhone.startsWith("88") ? rawPhone : `88${rawPhone}`;
    const firstItem = order.items[0]?.productName || "আপনার পছন্দের পণ্য";
    const total = formatPrice(order.totalAmount || 0);

    const message = `আসসালামু আলাইকুম ${order.customerName || "গ্রাহক"}! 🌸
hazenshopbd.com এ আপনার ${firstItem} (${total}) এর অর্ডারটি সম্পন্ন হয়নি বা ড্রাফট হিসেবে রয়েছে।

আপনি কি অর্ডারটি কনফার্ম করে ক্যাশ অন ডেলিভারিতে পেতে চান? আমরা আপনাকে সাহায্য করতে পারি। ধন্যবাদ!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Export Incomplete Leads to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      showToast("No incomplete orders to export", "error");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Address",
      "City/Zone",
      "Items",
      "Total (BDT)",
      "Notes/Reason",
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString("en-US"),
      `"${(o.customerName || "").replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${(o.customerAddress || "").replace(/"/g, '""')}"`,
      `"${o.deliveryZone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}"`,
      `"${o.items.map((it) => `${it.productName} (x${it.quantity})`).join(", ").replace(/"/g, '""')}"`,
      o.totalAmount || 0,
      `"${(o.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `incomplete-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredOrders.length} leads to CSV!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs text-brand-400 hover:underline font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Orders
            </Link>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            Incomplete Orders & Abandoned Leads
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customers who entered their phone number but dropped off or encountered an error. Recover sales via WhatsApp or phone call.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-brand-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Analytics / KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400/80 font-bold uppercase tracking-wider">Total Abandoned Leads</p>
            <p className="text-2xl font-black text-white mt-1">{incompleteOrders.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Unsubmitted or failed checkouts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider">Potential Lost Revenue</p>
            <p className="text-2xl font-black text-white mt-1">{formatPrice(totalPotentialValue)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Recoverable through direct outreach</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-cyan-400/80 font-bold uppercase tracking-wider">1-Click Recovery</p>
            <p className="text-sm font-bold text-white mt-1">WhatsApp & Direct Call</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Instant pre-written Bengali templates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by phone, customer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500 min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-bold text-amber-400">{filteredOrders.length} Incomplete Leads</span>
        </div>
      </div>

      {/* Lead List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-white font-bold text-base">No Incomplete Orders Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {search
              ? "No incomplete leads match your search query."
              : "Great! There are currently no abandoned carts or failed checkout drafts. When a customer enters their phone number and drops off, their lead will appear here automatically for recovery."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Card Layout */}
          <div className="space-y-3 md:hidden">
            {filteredOrders.map((order) => {
              const waLink = getWhatsAppLink(order);
              return (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md"
                >
                  {/* Header: ID, Date, Total */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <div>
                      <span className="font-mono font-black text-amber-400 text-sm block">
                        #{order.id}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-white block">
                        {formatPrice(order.totalAmount || 0)}
                      </span>
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Incomplete Draft
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-slate-950 p-3 rounded-xl space-y-1.5 text-xs border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {order.customerName || "Customer Name Not Provided"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="font-mono font-bold text-brand-400 hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {order.customerPhone}
                      </a>
                    </div>
                    {order.customerAddress && (
                      <div className="text-slate-400 flex items-start gap-1.5 pt-1 border-t border-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight line-clamp-2">
                          {order.customerAddress} ({order.deliveryZone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Selected Items:
                    </p>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                        <span className="line-clamp-1">
                          {it.productName} {it.variantName ? `(${it.variantName})` : ""}
                        </span>
                        <span className="text-slate-400 font-mono shrink-0 ml-2">
                          x{it.quantity} • {formatPrice(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Notes / Reason */}
                  {order.notes && (
                    <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      <strong>Lead Note:</strong> {order.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${order.customerPhone}`}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] border border-slate-700 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-brand-400" />
                      <span>Call Client</span>
                    </a>

                    <button
                      onClick={() => handleConvertToOrder(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-brand-500 hover:bg-brand-400 text-brand-dark font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Order</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDraft(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] border border-rose-800/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Lead ID & Time</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items & Value</th>
                  <th className="p-4">Lead Context / Notes</th>
                  <th className="p-4 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => {
                  const waLink = getWhatsAppLink(order);
                  return (
                    <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                      {/* ID & Date */}
                      <td className="p-4 align-top">
                        <span className="font-mono font-bold text-amber-400 block text-xs">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          {new Date(order.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer Details */}
                      <td className="p-4 align-top space-y-1">
                        <div className="font-bold text-white text-xs">
                          {order.customerName || "Customer Name Not Provided"}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-brand-400 font-bold">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${order.customerPhone}`} className="hover:underline">
                            {order.customerPhone}
                          </a>
                        </div>
                        {order.customerAddress && (
                          <div className="text-[11px] text-slate-400 flex items-start gap-1 max-w-xs leading-tight pt-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                            <span>
                              {order.customerAddress} ({order.deliveryZone === "dhaka" ? "Dhaka" : "Outside"})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Items & Value */}
                      <td className="p-4 align-top">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-slate-300 font-medium">
                              • {it.productName}{" "}
                              {it.variantName ? (
                                <span className="text-slate-400 text-[11px]">({it.variantName})</span>
                              ) : null}{" "}
                              <span className="text-slate-500 font-mono">x{it.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 font-black text-sm text-white">
                          Total: {formatPrice(order.totalAmount || 0)}
                        </div>
                      </td>

                      {/* Lead Notes */}
                      <td className="p-4 align-top">
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl text-[11px] leading-relaxed max-w-xs">
                          {order.notes || "Checkout abandoned before final confirmation"}
                        </div>
                      </td>

                      {/* Recovery Actions */}
                      <td className="p-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                              title="Send WhatsApp recovery message"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <a
                              href={`tel:${order.customerPhone}`}
                              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition-colors"
                              title="Call customer directly"
                            >
                              <Phone className="w-3.5 h-3.5 text-brand-400" />
                              <span>Call</span>
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              onClick={() => handleConvertToOrder(order.id)}
                              disabled={actionLoading === order.id}
                              className="bg-brand-500 hover:bg-brand-400 text-brand-dark font-black text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                              title="Convert to regular pending order"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Convert to Order</span>
                            </button>

                            <button
                              onClick={() => handleDeleteDraft(order.id)}
                              disabled={actionLoading === order.id}
                              className="bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-[11px] p-1.5 rounded-lg border border-slate-700 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
