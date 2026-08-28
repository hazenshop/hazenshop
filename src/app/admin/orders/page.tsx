"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Printer,
  Truck,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  X,
  Edit2,
  ExternalLink,
  Download,
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
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [editingCourierOrder, setEditingCourierOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
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
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Order #${orderId} updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault();
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
        showToast(`Courier info saved & Order #${editingCourierOrder.id} marked as Shipped`);
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
    <div className="space-y-6">
      {/* Top Header & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            View customer details, assign couriers, update delivery status and print invoices
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-brand-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by ID, Phone, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["all", "pending", "confirmed", "packaging", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-brand-500 text-brand-dark"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
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
              {filteredOrders.map((order) => {
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
                                className="font-mono text-[11px] text-brand-400 hover:underline flex items-center gap-1"
                              >
                                <span>{order.trackingCode}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-400 block">
                                {order.trackingCode}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCourierOrder(order);
                            setCourierName("Steadfast Courier");
                            setTrackingCode("");
                          }}
                          className="text-[11px] text-brand-400 hover:text-brand-300 underline"
                        >
                          + Assign Courier
                        </button>
                      )}
                    </td>

                    {/* Status dropdown */}
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold rounded-lg p-1.5 border uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} bg-transparent focus:outline-none`}
                      >
                        <option value="pending" className="bg-slate-900 text-white">Pending</option>
                        <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                        <option value="packaging" className="bg-slate-900 text-white">Packaging</option>
                        <option value="shipped" className="bg-slate-900 text-white">Shipped</option>
                        <option value="delivered" className="bg-slate-900 text-white">Delivered</option>
                        <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-white transition-colors"
                          title="Print Customer Invoice Memo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCourierOrder(order);
                            setCourierName(order.courierName || "Steadfast Courier");
                            setTrackingCode(order.trackingCode || "");
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Courier & Tracking Info"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

            <form onSubmit={handleSaveCourier} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Courier Service Provider</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold focus:outline-none focus:border-brand-500"
                >
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="Pathao Express">Pathao Express</option>
                  <option value="RedX Logistics">RedX Logistics</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="eCourier">eCourier</option>
                  <option value="Sundarban Courier">Sundarban Courier</option>
                  <option value="SA Paribahan">SA Paribahan</option>
                  <option value="Own Delivery Rider">Own Delivery Rider</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Consignment ID / Tracking Code (কনসাইনমেন্ট কোড)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ST-BD-88992 or 12345678"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full bg-slate-950 text-white font-mono text-sm rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCourierOrder(null)}
                  className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-brand-500 text-brand-dark font-black hover:bg-brand-600 shadow-lg"
                >
                  Save & Mark Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
