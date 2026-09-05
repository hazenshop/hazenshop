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
    const printContent = document.getElementById("printable-invoice");
    if (!printContent) return;

    // Use isolated invisible iframe to guarantee 100% clean invoice print (without website background/navbar)
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <title>Invoice_${order.id}_HAZENSHOP_BD</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              padding: 24px;
              font-size: 12px;
              line-height: 1.5;
            }
            .invoice-wrap { max-width: 720px; margin: 0 auto; }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .brand-col { display: flex; align-items: center; gap: 12px; }
            .logo-box {
              width: 48px;
              height: 48px;
              border-radius: 8px;
              border: 1px solid #d1d5db;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 16px;
              background: #7A1C2C;
              color: #ffffff;
            }
            .brand-title { font-size: 18px; font-weight: 900; color: #7A1C2C; }
            .brand-sub { font-size: 11px; color: #4b5563; }
            .invoice-num { font-size: 16px; font-weight: 900; font-family: monospace; color: #111827; text-align: right; }
            .invoice-date { font-size: 11px; color: #6b7280; text-align: right; }
            .cod-badge {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              font-weight: 800;
              font-size: 10px;
              padding: 2px 8px;
              border-radius: 4px;
              margin-top: 4px;
              border: 1px solid #fde68a;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 12px 16px;
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .section-label {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #6b7280;
              letter-spacing: 0.5px;
            }
            .cust-name { font-weight: 800; font-size: 13px; color: #111827; margin-top: 2px; }
            .cust-phone { font-weight: 700; color: #374151; font-size: 12px; }
            .cust-addr { color: #4b5563; font-size: 11px; margin-top: 2px; }
            .logistics-val { font-weight: 700; font-size: 12px; color: #111827; text-transform: uppercase; margin-top: 2px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            th {
              background: #f3f4f6;
              color: #374151;
              font-weight: 700;
              font-size: 10px;
              text-transform: uppercase;
              padding: 8px 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            td {
              padding: 8px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 11px;
              vertical-align: top;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .item-title { font-weight: 700; color: #111827; }
            .item-variant { font-size: 10px; color: #92400e; font-weight: 600; display: block; margin-top: 2px; }
            .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 16px; }
            .totals-box { width: 240px; }
            .totals-row { display: flex; justify-content: space-between; padding: 3px 0; color: #4b5563; font-size: 11px; }
            .totals-final {
              display: flex;
              justify-content: space-between;
              padding: 8px 0 0 0;
              border-top: 2px solid #111827;
              font-size: 14px;
              font-weight: 900;
              color: #7A1C2C;
              margin-top: 4px;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 12px;
              text-align: center;
              font-size: 10px;
              color: #6b7280;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrap">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col my-auto">
        {/* Modal Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Printer className="w-4 h-4 text-brand-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm truncate">
              Packing Memo / Invoice (#{order.id})
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body Container */}
        <div id="printable-invoice" className="p-4 sm:p-8 space-y-5 text-slate-900 text-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-maroon-700 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                HZN
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {settings?.siteName || "HAZENSHOP BD"}
                </h1>
                <p className="text-slate-500 text-[11px]">Luxury Bedsheets & Designer Window Curtains</p>
                <p className="text-slate-500 text-[10px] sm:text-[11px]">
                  Hotline: {settings?.hotline || "+880 1700-000000"} • hazenshopbd.com
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <span className="text-base sm:text-lg font-mono font-black text-brand-maroon-700 block">
                INVOICE: #{order.id}
              </span>
              <p className="text-slate-500 text-[11px]">
                Date: {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </p>
              <span className="inline-block bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded text-[10px] mt-1 border border-amber-200">
                CASH ON DELIVERY (COD)
              </span>
            </div>
          </div>

          {/* Customer & Shipping Information Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Deliver To (Recipient):
              </span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{order.customerName}</p>
              <p className="font-bold text-slate-800 text-xs">{order.customerPhone}</p>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{order.customerAddress}</p>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Delivery Zone & Logistics:
              </span>
              <p className="font-bold text-slate-800 uppercase mt-0.5 text-xs">
                {order.deliveryZone.replace("_", " ")}
              </p>
              {order.courierName && (
                <p className="text-slate-600 text-[11px] mt-1">
                  Courier: <strong className="text-slate-900">{order.courierName}</strong>
                </p>
              )}
              {order.trackingCode && (
                <p className="text-slate-600 font-mono text-[11px]">
                  Consignment: <strong>{order.trackingCode}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left min-w-[340px]">
              <thead className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="p-2.5 sm:p-3 w-8">#</th>
                  <th className="p-2.5 sm:p-3">Product Description</th>
                  <th className="p-2.5 sm:p-3 text-center w-12">Qty</th>
                  <th className="p-2.5 sm:p-3 text-right w-24">Unit Price</th>
                  <th className="p-2.5 sm:p-3 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 sm:p-3 text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="p-2.5 sm:p-3">
                      <span className="font-bold text-slate-900 block leading-tight">{item.productName}</span>
                      {item.variantName && (
                        <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
                          Variant: {item.variantName}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 sm:p-3 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="p-2.5 sm:p-3 text-right font-medium text-slate-700">{formatPrice(item.price)}</td>
                    <td className="p-2.5 sm:p-3 text-right font-bold text-slate-900">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal and Total Calculation */}
          <div className="flex justify-end pt-1">
            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
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
                <span>Total Payable (COD):</span>
                <span className="text-base text-brand-maroon-700">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Receipt Note */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 text-center space-y-0.5">
            <p className="font-bold text-slate-700">Thank you for ordering with HAZENSHOP BD!</p>
            <p>
              For queries or return assistance, call our helpline: {settings?.hotline || "+880 1700-000000"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
