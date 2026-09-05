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
  Package,
  Printer,
  AlertTriangle,
  Database,
  RefreshCw,
  FolderTree,
  HardDrive,
  Settings,
  PlusCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Order, OrderStatus, Product, SiteSettings } from "@/lib/types";
import { formatPrice, getStatusColor } from "@/lib/utils";
import OrderInvoiceModal from "@/components/admin/OrderInvoiceModal";
import { useToast } from "@/context/ToastContext";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [pinging, setPinging] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [orderRes, setRes, prodRes, catRes, healthRes] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()).catch(() => ({ categories: [] })),
        fetch("/api/health").then((r) => r.json()).catch(() => null),
      ]);

      if (orderRes.orders) setOrders(orderRes.orders);
      if (setRes.settings) setSettings(setRes.settings);
      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) setCategoriesCount(catRes.categories.length);
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
  const completedOrders = orders.filter((o) => o.status !== "incomplete");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed" || o.status === "packaging" || o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const incompleteOrders = orders.filter((o) => o.status === "incomplete");
  const incompleteCount = incompleteOrders.length;
  const incompleteValue = incompleteOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock <= 3);

  // Admin Nav Cards Configuration
  const adminNavCards = [
    {
      title: "অর্ডার ও ডেলিভারি (Orders)",
      subtitle: "কাস্টমার অর্ডার, ফোন কল কনফার্মেশন ও চালান প্রিন্ট",
      icon: ShoppingBag,
      href: "/admin/orders",
      badge: `${orders.length} Orders (${pendingOrders} Pending)`,
      badgeColor: pendingOrders > 0 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accentBg: "from-amber-500/10 to-amber-950/20 border-amber-500/30 hover:border-amber-400/60",
      iconColor: "text-amber-400 bg-amber-500/10",
      cta: "অর্ডার ম্যানেজ করুন",
    },
    {
      title: "অসম্পূর্ণ অর্ডার ও লিড (Incomplete Leads)",
      subtitle: "ড্রাফট ও ড্রপ-অফ অর্ডার রিকভারি এবং ১-ক্লিক হোয়াটসঅ্যাপ মেসেজিং",
      icon: Clock,
      href: "/admin/incomplete-orders",
      badge: `${incompleteCount} Abandoned Leads`,
      badgeColor: incompleteCount > 0 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700",
      accentBg: "from-amber-500/10 to-orange-950/20 border-amber-500/30 hover:border-amber-400/60",
      iconColor: "text-amber-400 bg-amber-500/10",
      cta: "লিড রিকভার করুন",
    },
    {
      title: "পণ্য ও স্টক (Products)",
      subtitle: "বেডশিট ও পর্দার ক্যাটালগ, সাইজ, ভ্যারিয়েশন ও মূল্য",
      icon: Package,
      href: "/admin/products",
      badge: `${products.length} Products Available`,
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      accentBg: "from-cyan-500/10 to-cyan-950/20 border-cyan-500/30 hover:border-cyan-400/60",
      iconColor: "text-cyan-400 bg-cyan-500/10",
      cta: "পণ্য তালিকা দেখুন",
    },
    {
      title: "+ নতুন পণ্য তৈরি (Add Product)",
      subtitle: "ক্যাটালগে নতুন আকর্ষণীয় আইটেম সরাসরি যুক্ত করুন",
      icon: PlusCircle,
      href: "/admin/products/new",
      badge: "Quick Creator",
      badgeColor: "bg-brand-500/20 text-brand-400 border-brand-500/30",
      accentBg: "from-brand-500/10 to-brand-950/20 border-brand-500/40 hover:border-brand-400",
      iconColor: "text-brand-400 bg-brand-500/10",
      cta: "পণ্য যোগ করুন",
    },
    {
      title: "ক্যাটাগরি কালেকশন (Categories)",
      subtitle: "বেডশিট, পর্দা, কমফোর্টার ক্যাটাগরি ও ফিল্টার",
      icon: FolderTree,
      href: "/admin/categories",
      badge: `${categoriesCount} Categories`,
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      accentBg: "from-purple-500/10 to-purple-950/20 border-purple-500/30 hover:border-purple-400/60",
      iconColor: "text-purple-400 bg-purple-500/10",
      cta: "ক্যাটাগরি সাজান",
    },
    {
      title: "ছবি ও ফাইল স্টোরেজ (Media)",
      subtitle: "পণ্য ও ব্যানারের হাই-রেজ ছবি আপলোড ও CDN লিঙ্ক",
      icon: HardDrive,
      href: "/admin/storage",
      badge: "Cloud Storage",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accentBg: "from-emerald-500/10 to-emerald-950/20 border-emerald-500/30 hover:border-emerald-400/60",
      iconColor: "text-emerald-400 bg-emerald-500/10",
      cta: "মিডিয়া ফাইল দেখুন",
    },
    {
      title: "স্টোর সেটিংস ও এসইও (Settings)",
      subtitle: "হটলাইন, হোয়াটসঅ্যাপ, কুরিয়ার এপিআই ও ডেলিভারি চার্জ",
      icon: Settings,
      href: "/admin/settings",
      badge: "hazenshopbd.com Config",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accentBg: "from-rose-500/10 to-rose-950/20 border-rose-500/30 hover:border-rose-400/60",
      iconColor: "text-rose-400 bg-rose-500/10",
      cta: "সেটিংস পরিবর্তন করুন",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              hazenshopbd.com
            </span>
            <span className="text-xs text-slate-500">Live Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Store Dashboard & Modules
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a management module below or review real-time orders & inventory health
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={pingHealth}
            disabled={pinging}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 min-h-[40px]"
            title="Check real-time database connection & latency"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${pinging ? "animate-spin" : ""}`} />
            <span>Ping DB</span>
          </button>

          <Link
            href="/admin/products/new"
            className="bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 min-h-[40px] active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRIMARY ADMIN NAVIGATION CARDS GRID (Requested Card Navigation Module) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation Modules (কন্ট্রোল কার্ডস)
          </h2>
          <span className="text-[11px] text-slate-500">Click any card to open</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative p-5 rounded-2xl bg-gradient-to-b ${card.accentBg} border transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between space-y-4 active:scale-[0.99]`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2.5 rounded-xl ${card.iconColor} border border-white/5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-normal leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-brand-400 group-hover:text-brand-300">
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
            <span>Ping Latency:</span>
            <span className="font-mono bg-slate-950 px-2.5 py-1 rounded text-emerald-400 border border-slate-800 font-bold">
              {healthData.totalLatencyMs ?? 0}ms
            </span>
          </div>
        </div>
      )}

      {/* Incomplete / Abandoned Leads Alert (if any) */}
      {incompleteCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">
                {incompleteCount} Incomplete Orders / Abandoned Leads ({formatPrice(incompleteValue)} Potential Sales)
              </h4>
              <p className="text-[11px] text-slate-300">
                Customers typed their phone number but dropped off. Send a 1-tap WhatsApp message to recover these sales!
              </p>
            </div>
          </div>
          <Link
            href="/admin/incomplete-orders"
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Recover Leads &rarr;</span>
          </Link>
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

      {/* KPI Performance Cards */}
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
            <span className="block text-[10px] text-slate-400 mt-1">Cash on Delivery Sales</span>
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
            <span className="text-xs font-bold text-slate-400">Processing & Shipped</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-blue-400">{confirmedOrders}</span>
            <span className="block text-[10px] text-slate-400 mt-1">In fulfillment pipeline</span>
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
            <span className="block text-[10px] text-slate-400 mt-1">Successfully delivered</span>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Latest orders placed via Cash on Delivery</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 min-h-[38px]"
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
              When customers complete Cash on Delivery checkout on hazenshopbd.com, their orders will appear here in real-time.
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
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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
