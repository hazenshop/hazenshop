"use client";

import React from "react";
import Image from "next/image";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { Order, SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function OrderInvoiceModal({
  order,
  settings,
  onClose,
}: {
  order: Order | null;
  settings?: SiteSettings | null;
  onClose: () => void;
}) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-sm">Customer Packing Memo / Invoice (#{order.id})</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div id="printable-invoice" className="p-8 space-y-6 text-slate-900 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border">
                <Image src="/logo.jpg" alt="Hazen" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">HAZENSHOP</h1>
                <p className="text-slate-500">Luxury Bedsheets & Designer Window Curtains</p>
                <p className="text-slate-500">Hotline: {settings?.hotline || "+880 1700-000000"} • www.hazenshop.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-mono font-black text-brand-700 block">
                INVOICE: #{order.id}
              </span>
              <p className="text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <span className="inline-block bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded text-[10px] mt-1">
                CASH ON DELIVERY (COD)
              </span>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Deliver To (Recipient):
              </span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{order.customerName}</p>
              <p className="font-bold text-slate-800 text-xs">{order.customerPhone}</p>
              <p className="text-slate-600 mt-1">{order.customerAddress}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Delivery Zone & Logistics:
              </span>
              <p className="font-bold text-slate-800 uppercase mt-0.5">{order.deliveryZone.replace("_", " ")}</p>
              {order.courierName && (
                <p className="text-slate-600 mt-1">Courier: <span className="font-bold">{order.courierName}</span></p>
              )}
              {order.trackingCode && (
                <p className="text-slate-600 font-mono">Consignment: {order.trackingCode}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b text-[10px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.productName}</span>
                      {item.variantName && (
                        <span className="text-[11px] text-amber-800 font-medium">Variant: {item.variantName}</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-medium">{formatPrice(item.price)}</td>
                    <td className="p-3 text-right font-bold">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-slate-800">
                  {order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Payable:</span>
                <span className="text-base text-brand-700">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t pt-4 text-[10px] text-slate-500 text-center space-y-1">
            <p className="font-bold text-slate-700">Thank you for choosing HAZENSHOP (hazenshop.com)!</p>
            <p>For any inquiries or customer support, please reach out to our hotline: {settings?.hotline || "+880 1700-000000"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
