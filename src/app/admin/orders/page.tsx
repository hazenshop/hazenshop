"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Truck,
  Phone,
  Printer,
  Download,
  Clock,
  CheckCircle2,
  ExternalLink,
  Edit2,
  X,
} from "lucide-react";
import { Order, OrderStatus, SiteSettings } from "@/lib/types";
import { formatPrice, getStatusColor, generateOrdersCSV, getCourierTrackingUrl } from "@/lib/utils";
import OrderInvoiceModal from "@/components/admin/OrderInvoiceModal";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [editingCourierOrder, setEditingCourierOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const fetchData = async () => {
    try {
      const [orderRes, setRes] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
      ]);
      if (orderRes.orders) setOrders(orderRes.orders);
      if (setRes.settings) setSettings(setRes.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Order #${orderId} marked as ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const handleSaveCourier = async () => {
    if (!editingCourierOrder) return;
    try {
      const res = await fetch(`/api/orders/${editingCourierOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "shipped",
          courierName: courierName.trim(),
          trackingCode: trackingCode.trim(),
        }),
      });

      if (res.ok) {
        showToast(`Assigned ${courierName} to #${editingCourierOrder.id}`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === editingCourierOrder.id
              ? { ...o, status: "shipped", courierName: courierName.trim(), trackingCode: trackingCode.trim() }
              : o
          )
        );
        setEditingCourierOrder(null);
      }
    } catch (e) {
      showToast("Failed to save courier info", "error");
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }
    const csvContent = generateOrdersCSV(filteredOrders);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hazen-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredOrders.length} orders to CSV!`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.trackingCode && o.trackingCode.toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-white">Order Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View customer details, assign couriers, update delivery status and print invoices
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-brand-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-2xl flex flex-col gap-3 justify-between items-stretch">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center w-full">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by ID, Phone, Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500 min-h-[42px]"
            />
          </div>

          <span className="text-xs text-slate-400 font-bold hidden sm:inline">
            {filteredOrders.length} Orders
          </span>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          {["all", "pending", "confirmed", "packaging", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors min-h-[36px] ${
                statusFilter === st
                  ? "bg-brand-500 text-brand-dark shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE ORDERS CARD LIST (Touch-Friendly Phone View) */}
      <div className="space-y-3 md:hidden">
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
            <Clock className="w-8 h-8 mx-auto text-slate-500" />
            <h4 className="text-white font-bold text-sm">No Orders Found</h4>
            <p className="text-xs text-slate-400">
              {search || statusFilter !== "all"
                ? "No orders match your filter criteria."
                : "No customer orders have been placed yet. New Cash on Delivery orders will appear here automatically."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusStyle = getStatusColor(order.status);
            const trackingUrl = getCourierTrackingUrl(order.courierName, order.trackingCode);

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md"
              >
                {/* Top Header: ID, Date, Amount */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div>
                    <span className="font-mono font-black text-brand-400 text-sm block">
                      #{order.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-white text-sm block">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Cash on Delivery</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{order.customerName}</span>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </a>
                  </div>
                  <p className="text-slate-300 text-xs line-clamp-2 mt-1">{order.customerAddress}</p>
                  <span className="inline-block text-[10px] text-slate-400 font-bold uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Zone: {order.deliveryZone.replace("_", " ")}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Ordered Items ({order.items.length}):
                  </span>
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                      <span className="truncate pr-2">{i.quantity}x {i.productName}</span>
                      <span className="font-bold text-white shrink-0">{formatPrice(i.total)}</span>
                    </div>
                  ))}
                </div>

                {/* Courier info (if assigned) */}
                {order.courierName && (
                  <div className="flex items-center justify-between text-xs bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Courier:</span>
                      <span className="font-bold text-white">{order.courierName}</span>
                    </div>
                    {order.trackingCode && (
                      <span className="font-mono text-brand-400 font-bold text-xs">
                        {order.trackingCode}
                      </span>
                    )}
                  </div>
                )}

                {/* Status Dropdown & Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none cursor-pointer flex-1 min-h-[40px] ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    <option value="pending" className="bg-slate-900 text-amber-400">Pending</option>
                    <option value="confirmed" className="bg-slate-900 text-blue-400">Confirmed</option>
                    <option value="packaging" className="bg-slate-900 text-purple-400">Packaging</option>
                    <option value="shipped" className="bg-slate-900 text-indigo-400">Shipped</option>
                    <option value="delivered" className="bg-slate-900 text-emerald-400">Delivered</option>
                    <option value="cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                    <option value="returned" className="bg-slate-900 text-slate-400">Returned</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingCourierOrder(order);
                        setCourierName(order.courierName || "");
                        setTrackingCode(order.trackingCode || "");
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Courier Info"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP ORDERS TABLE (Shown on md+ screens) */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer & Phone</th>
                <th className="p-4">Address & Zone</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Courier / Tracking</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h4 className="text-white font-bold text-sm">No Orders Found</h4>
                      <p className="text-xs text-slate-400">
                        {search || statusFilter !== "all"
                          ? "No orders match your filter criteria."
                          : "No customer orders have been placed yet. New Cash on Delivery orders will appear here automatically."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusStyle = getStatusColor(order.status);
                  const trackingUrl = getCourierTrackingUrl(order.courierName, order.trackingCode);

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* ID */}
                      <td className="p-4">
                        <span className="font-mono font-black text-brand-400 block">{order.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <span className="font-bold block text-white">{order.customerName}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-slate-400 hover:text-brand-400 flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </td>

                      {/* Address */}
                      <td className="p-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-300">{order.customerAddress}</p>
                        <span className="text-[10px] text-brand-400/80 uppercase font-bold">
                          {order.deliveryZone.replace("_", " ")}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <span className="font-bold text-white block">{order.items.length} Product(s)</span>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="p-4">
                        <span className="font-black text-brand-400 block text-sm">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">COD</span>
                      </td>

                      {/* Courier */}
                      <td className="p-4">
                        {order.courierName ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-300 block">{order.courierName}</span>
                            {order.trackingCode && (
                              trackingUrl ? (
                                <a
                                  href={trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-brand-400 hover:text-brand-300 font-mono inline-flex items-center gap-1"
                                >
                                  <span>{order.trackingCode}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">{order.trackingCode}</span>
                              )
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingCourierOrder(order);
                              setCourierName("");
                              setTrackingCode("");
                            }}
                            className="text-[10px] font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-2.5 py-1 rounded-lg border border-brand-500/30 transition-colors min-h-[36px]"
                          >
                            + Assign Courier
                          </button>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <option value="pending" className="bg-slate-900 text-amber-400">Pending</option>
                          <option value="confirmed" className="bg-slate-900 text-blue-400">Confirmed</option>
                          <option value="packaging" className="bg-slate-900 text-purple-400">Packaging</option>
                          <option value="shipped" className="bg-slate-900 text-indigo-400">Shipped</option>
                          <option value="delivered" className="bg-slate-900 text-emerald-400">Delivered</option>
                          <option value="cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                          <option value="returned" className="bg-slate-900 text-slate-400">Returned</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-white transition-colors"
                            title="Print Customer Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCourierOrder(order);
                              setCourierName(order.courierName || "");
                              setTrackingCode(order.trackingCode || "");
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Update Courier Info"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Courier Assignment Modal */}
      {editingCourierOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold">
                <Truck className="w-5 h-5 text-brand-400" />
                <span>Assign Courier for #{editingCourierOrder.id}</span>
              </div>
              <button
                onClick={() => setEditingCourierOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Courier Company
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select courier partner...</option>
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="RedX Logistics">RedX Logistics</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="Sundarban Courier">Sundarban Courier</option>
                  <option value="SA Paribahan">SA Paribahan</option>
                  <option value="eCourier">eCourier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Consignment / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ST-88991204"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCourierOrder(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourier}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-brand-500 hover:bg-brand-600 text-brand-dark"
              >
                Save & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
