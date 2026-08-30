"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  Package,
  Eye,
  Printer,
  AlertTriangle,
  Database,
  Activity,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Order, OrderStatus, Product, SiteSettings } from "@/lib/types";
import { formatPrice, getStatusColor } from "@/lib/utils";
import OrderInvoiceModal from "@/components/admin/OrderInvoiceModal";
import { useToast } from "@/context/ToastContext";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [pinging, setPinging] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [orderRes, setRes, prodRes, healthRes] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/health").then((r) => r.json()).catch(() => null),
      ]);

      if (orderRes.orders) setOrders(orderRes.orders);
      if (setRes.settings) setSettings(setRes.settings);
      if (prodRes.products) setProducts(prodRes.products);
      if (healthRes) setHealthData(healthRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pingHealth = async () => {
    setPinging(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthData(data);
      showToast(`Health check OK (${data.totalLatencyMs}ms latency)`);
    } catch {
      showToast("Health check failed", "error");
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
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

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed" || o.status === "packaging").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const lowStockProducts = products.filter((p) => p.stock <= 3);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Store Performance Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sales, order fulfillment pipeline & cash on delivery analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pingHealth}
            disabled={pinging}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            title="Check real-time database connection & latency"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${pinging ? "animate-spin" : ""}`} />
            <span>Ping DB Health</span>
          </button>

          <Link
            href="/admin/products/new"
            className="bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Database & Cloud Connection Health Card */}
      {healthData && (
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${healthData.status === "healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Database Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${healthData.status === "healthy" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400"}`}>
                  {healthData.status === "healthy" ? "● Connected & Active" : "● Degraded"}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Driver: <strong className="text-slate-200">{healthData.database?.activeDriver}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {healthData.database?.supabase?.configured ? (
                  <>Supabase Cloud PostgreSQL ({healthData.database?.supabase?.latencyMs ?? healthData.totalLatencyMs}ms ping) • Local dual-mode synchronized</>
                ) : (
                  <>Local disk persistence active (.data/*.json)</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-slate-400">
            <span>Health Route:</span>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono bg-slate-950 px-2 py-1 rounded text-brand-400 border border-slate-800 hover:border-brand-500/50 transition-colors"
            >
              /api/health ↗
            </a>
          </div>
        </div>
      )}

      {/* Low Stock Alert (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-brand-400">
                Low Inventory Warning ({lowStockProducts.length} items with &le; 3 sets left)
              </h4>
              <p className="text-[11px] text-slate-300">
                {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(" • ")}
              </p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-brand-400 hover:text-white underline shrink-0"
          >
            Manage Stock &rarr;
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Order Volume</span>
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white">{formatPrice(totalRevenue)}</span>
            <span className="block text-[10px] text-slate-400 mt-1">Across all order statuses</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pending Orders</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-400">{pendingOrders}</span>
            <span className="block text-[10px] text-slate-400 mt-1">Requires phone confirmation</span>
          </div>
        </div>

        {/* In Processing */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Processing & Shipping</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-blue-400">{confirmedOrders}</span>
            <span className="block text-[10px] text-slate-400 mt-1">Confirmed & in transit</span>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Delivered (Completed)</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400">{deliveredOrders}</span>
            <span className="block text-[10px] text-slate-400 mt-1">Cash received from courier</span>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Latest orders placed via Cash on Delivery</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Orders ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white">No Customer Orders Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When customers complete Cash on Delivery checkout on the storefront, their orders will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {orders.slice(0, 6).map((order) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-brand-400 font-mono font-bold">
                      #{order.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{order.customerName}</h4>
                        <span className="text-slate-400 font-normal">({order.customerPhone})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="font-black text-brand-400 block text-sm">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      {order.status}
                    </span>

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                      title="Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
