"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Printer, Download, FileText, Tag, Loader2 } from "lucide-react";
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
  const [paperSize, setPaperSize] = useState<"3x4" | "4x3" | "a4">("3x4");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!order) return null;

  const siteTitle = settings?.siteName?.replace(/—.*/, "").trim() || "HAZENSHOP BD";
  const hotline = settings?.hotline || "+880 1700-000000";
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB");

  const hasRealAddress =
    order.customerAddress &&
    order.customerAddress !== "Incomplete Address" &&
    order.customerAddress !== "Address Not Entered" &&
    order.customerAddress.trim().length > 0;

  const displayAddress = hasRealAddress
    ? order.customerAddress.trim()
    : "ঠিকানা দেওয়া হয়নি (No Address Provided)";

  // Native PDF generation using jsPDF
  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      if (paperSize === "3x4") {
        const element = document.getElementById("printable-invoice-3x4");
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 3, // 300 DPI for sharp thermal print quality
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [75, 100], // 75mm wide x 100mm tall (3" x 4")
        });

        pdf.setProperties({
          title: `Invoice_${order.id}_75x100mm`,
          subject: `${siteTitle} Order #${order.id} 3x4 Label`,
          author: siteTitle,
        });

        pdf.addImage(imgData, "PNG", 0, 0, 75, 100, undefined, "FAST");
        pdf.save(`Invoice_${order.id}_75x100mm.pdf`);
      } else if (paperSize === "4x3") {
        const element = document.getElementById("printable-invoice-4x3");
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 3, // 300 DPI for ultra-sharp thermal print quality
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [75, 100], // 100mm wide x 75mm tall (4" x 3")
        });

        pdf.setProperties({
          title: `Invoice_${order.id}_100x75mm`,
          subject: `${siteTitle} Order #${order.id} 4x3 Label`,
          author: siteTitle,
        });

        pdf.addImage(imgData, "PNG", 0, 0, 100, 75, undefined, "FAST");
        pdf.save(`Invoice_${order.id}_100x75mm.pdf`);
      } else {
        const element = document.getElementById("printable-invoice-a4");
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        pdf.setProperties({
          title: `Invoice_${order.id}_A4`,
          subject: `${siteTitle} Order #${order.id} Invoice`,
          author: siteTitle,
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, 297), undefined, "FAST");
        pdf.save(`Invoice_${order.id}_A4.pdf`);
      }
    } catch (err) {
      console.error("Failed to generate PDF via jsPDF:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Browser print dialog via isolated iframe
  const handlePrint = () => {
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
    if (paperSize === "3x4") {
      // 75mm x 100mm (3" x 4") portrait thermal label
      doc.write(`
        <!DOCTYPE html>
        <html lang="bn">
          <head>
            <title>Invoice_${order.id}_75x100mm</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              @page {
                size: 75mm 100mm;
                margin: 0 !important;
              }
              html, body {
                width: 75mm;
                height: 100mm;
                max-width: 75mm;
                max-height: 100mm;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff;
                color: #000000;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif;
                overflow: hidden;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                page-break-inside: avoid;
                page-break-after: avoid;
                break-inside: avoid;
                break-after: avoid;
              }
              .thermal-card {
                width: 75mm;
                height: 100mm;
                max-width: 75mm;
                max-height: 100mm;
                padding: 2.2mm 2.8mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: hidden;
                background: #ffffff;
                color: #000000;
                page-break-inside: avoid;
                page-break-after: avoid;
                break-inside: avoid;
                break-after: avoid;
              }
              .t-head {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 1.5px solid #000;
                padding-bottom: 2px;
              }
              .t-brand {
                font-size: 11px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: -0.2px;
                line-height: 1.1;
              }
              .t-hotline {
                font-size: 7.5px;
                color: #222;
                margin-top: 1px;
                font-weight: 500;
              }
              .t-meta {
                text-align: right;
              }
              .t-id {
                font-family: monospace;
                font-size: 12px;
                font-weight: 900;
                line-height: 1.1;
              }
              .t-date {
                font-size: 7.5px;
                color: #444;
                margin-top: 1px;
              }
              .t-cust {
                border-bottom: 1px dashed #000;
                padding: 2.5px 0;
              }
              .t-cust-top {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 4px;
              }
              .t-name {
                font-size: 10px;
                font-weight: 800;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 60%;
              }
              .t-phone {
                font-family: monospace;
                font-size: 11px;
                font-weight: 900;
                white-space: nowrap;
              }
              .t-addr {
                font-size: 8.5px;
                font-weight: 600;
                line-height: 1.25;
                margin-top: 1.5px;
                word-break: break-word;
              }
              .t-logistics {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 7.5px;
                font-weight: 700;
                color: #222;
                margin-top: 1.5px;
              }
              .t-items {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                overflow: hidden;
                padding: 2.5px 0;
              }
              .t-table {
                width: 100%;
                border-collapse: collapse;
              }
              .t-table th {
                font-size: 7.5px;
                font-weight: 900;
                text-transform: uppercase;
                color: #333;
                border-bottom: 1px solid #ccc;
                padding-bottom: 1.5px;
              }
              .t-table td {
                font-size: 8px;
                padding: 1.5px 0;
                vertical-align: top;
              }
              .t-item-name {
                font-weight: 700;
                line-height: 1.15;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 44mm;
              }
              .t-totals {
                border-top: 1.5px solid #000;
                padding-top: 2.5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .t-subtotal {
                font-size: 7.5px;
                color: #333;
                line-height: 1.25;
              }
              .t-cod-box {
                background: #000;
                color: #fff;
                padding: 2.5px 6px;
                border-radius: 3px;
                text-align: right;
                border: 1px solid #000;
              }
              .t-cod-lbl {
                font-size: 6.5px;
                font-weight: 900;
                letter-spacing: 0.5px;
                line-height: 1;
              }
              .t-cod-val {
                font-family: monospace;
                font-size: 12.5px;
                font-weight: 900;
                line-height: 1.1;
                margin-top: 1px;
              }
              .t-foot {
                text-align: center;
                font-size: 6.5px;
                color: #444;
                padding-top: 2px;
                border-top: 1px dotted #ccc;
                margin-top: 1px;
              }
            </style>
          </head>
          <body>
            <div class="thermal-card">
              <!-- Top Header -->
              <div class="t-head">
                <div>
                  <div class="t-brand">${siteTitle}</div>
                  <div class="t-hotline">Hotline: ${hotline} • hazenshopbd.com</div>
                </div>
                <div class="t-meta">
                  <div class="t-id">#${order.id}</div>
                  <div class="t-date">${orderDate}</div>
                </div>
              </div>

              <!-- Customer & Delivery -->
              <div class="t-cust">
                <div class="t-cust-top">
                  <span class="t-name">${order.customerName}</span>
                  <span class="t-phone">${order.customerPhone}</span>
                </div>
                <div class="t-addr" style="${hasRealAddress ? '' : 'color: #dc2626; font-weight: bold;'}">${displayAddress}</div>
                <div class="t-logistics">
                  <span>ZONE: ${order.deliveryZone.replace("_", " ").toUpperCase()}</span>
                  <span>${order.courierName ? `COURIER: ${order.courierName}` : "STANDARD DELIVERY"}${order.trackingCode ? ` • CN: ${order.trackingCode}` : ""}</span>
                </div>
              </div>

              <!-- Items Table -->
              <div class="t-items">
                <table class="t-table">
                  <thead>
                    <tr>
                      <th style="text-align: left; width: 62%;">Item Description</th>
                      <th style="text-align: center; width: 14%;">Qty</th>
                      <th style="text-align: right; width: 24%;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.slice(0, 5).map((item) => `
                      <tr>
                        <td>
                          <div class="t-item-name">${item.productName}${item.variantName ? ` <span style="font-weight: normal; color: #444;">(${item.variantName})</span>` : ""}</div>
                        </td>
                        <td style="text-align: center; font-family: monospace; font-weight: 800;">x${item.quantity}</td>
                        <td style="text-align: right; font-family: monospace; font-weight: 900;">৳${item.total.toLocaleString("en-BD")}</td>
                      </tr>
                    `).join("")}
                    ${order.items.length > 5 ? `
                      <tr>
                        <td colspan="3" style="text-align: center; font-size: 7px; color: #666; font-style: italic;">
                          + ${order.items.length - 5} more item(s)...
                        </td>
                      </tr>
                    ` : ""}
                  </tbody>
                </table>
              </div>

              <!-- Pricing & COD Banner -->
              <div class="t-totals">
                <div class="t-subtotal">
                  <div>Subtotal: ৳${order.subtotal.toLocaleString("en-BD")}</div>
                  <div>Delivery: ${order.deliveryFee === 0 ? "FREE" : `৳${order.deliveryFee}`}</div>
                </div>
                <div class="t-cod-box">
                  <div class="t-cod-lbl">CASH ON DELIVERY (COD)</div>
                  <div class="t-cod-val">৳${order.totalAmount.toLocaleString("en-BD")}</div>
                </div>
              </div>

              <!-- Footer -->
              <div class="t-foot">
                Thank you for shopping with ${siteTitle}! • ${hotline}
              </div>
            </div>
          </body>
        </html>
      `);
    } else if (paperSize === "4x3") {
      // 100mm x 75mm (4" x 3") landscape thermal label format
      doc.write(`
        <!DOCTYPE html>
        <html lang="bn">
          <head>
            <title>Invoice_${order.id}_100x75mm</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              @page {
                size: 100mm 75mm;
                margin: 0 !important;
              }
              html, body {
                width: 100mm;
                height: 75mm;
                max-width: 100mm;
                max-height: 75mm;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff;
                color: #000000;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif;
                overflow: hidden;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                page-break-inside: avoid;
                page-break-after: avoid;
                break-inside: avoid;
                break-after: avoid;
              }
              .thermal-card {
                width: 100mm;
                height: 75mm;
                max-width: 100mm;
                max-height: 75mm;
                padding: 2.2mm 3.2mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: hidden;
                background: #ffffff;
                color: #000000;
                page-break-inside: avoid;
                page-break-after: avoid;
                break-inside: avoid;
                break-after: avoid;
              }
              .t-head {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 1.5px solid #000;
                padding-bottom: 2px;
              }
              .t-brand {
                font-size: 11.5px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: -0.2px;
                line-height: 1.1;
              }
              .t-hotline {
                font-size: 7.5px;
                color: #222;
                margin-top: 1px;
                font-weight: 500;
              }
              .t-meta {
                text-align: right;
              }
              .t-id {
                font-family: monospace;
                font-size: 12px;
                font-weight: 900;
                line-height: 1.1;
              }
              .t-date {
                font-size: 7.5px;
                color: #444;
                margin-top: 1px;
              }
              .t-cust {
                border-bottom: 1px dashed #000;
                padding: 2.5px 0;
              }
              .t-cust-top {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 4px;
              }
              .t-name {
                font-size: 10px;
                font-weight: 800;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 60%;
              }
              .t-phone {
                font-family: monospace;
                font-size: 11px;
                font-weight: 900;
                white-space: nowrap;
              }
              .t-addr {
                font-size: 8.5px;
                font-weight: 600;
                line-height: 1.25;
                margin-top: 1.5px;
                word-break: break-word;
              }
              .t-logistics {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 7.5px;
                font-weight: 700;
                color: #222;
                margin-top: 1.5px;
              }
              .t-items {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                overflow: hidden;
                padding: 2px 0;
              }
              .t-table {
                width: 100%;
                border-collapse: collapse;
              }
              .t-table th {
                font-size: 7.5px;
                font-weight: 900;
                text-transform: uppercase;
                color: #333;
                border-bottom: 1px solid #ccc;
                padding-bottom: 1.5px;
              }
              .t-table td {
                font-size: 8px;
                padding: 1.5px 0;
                vertical-align: top;
              }
              .t-item-name {
                font-weight: 700;
                line-height: 1.15;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 58mm;
              }
              .t-item-var {
                font-size: 7px;
                color: #444;
                display: block;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .t-totals {
                border-top: 1.5px solid #000;
                padding-top: 2.5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .t-subtotal {
                font-size: 7.5px;
                color: #333;
                line-height: 1.25;
              }
              .t-cod-box {
                background: #000;
                color: #fff;
                padding: 2px 6px;
                border-radius: 3px;
                text-align: right;
                border: 1px solid #000;
              }
              .t-cod-lbl {
                font-size: 6.5px;
                font-weight: 900;
                letter-spacing: 0.5px;
                line-height: 1;
              }
              .t-cod-val {
                font-family: monospace;
                font-size: 12px;
                font-weight: 900;
                line-height: 1;
              }
              .t-foot {
                text-align: center;
                font-size: 6.5px;
                color: #444;
                padding-top: 1.5px;
                border-top: 1px dotted #ccc;
                margin-top: 1px;
              }
            </style>
          </head>
          <body>
            <div class="thermal-card">
              <!-- Top Header -->
              <div class="t-head">
                <div>
                  <div class="t-brand">${siteTitle}</div>
                  <div class="t-hotline">Hotline: ${hotline} • hazenshopbd.com</div>
                </div>
                <div class="t-meta">
                  <div class="t-id">#${order.id}</div>
                  <div class="t-date">${orderDate}</div>
                </div>
              </div>

              <!-- Customer & Delivery -->
              <div class="t-cust">
                <div class="t-cust-top">
                  <span class="t-name">${order.customerName}</span>
                  <span class="t-phone">${order.customerPhone}</span>
                </div>
                <div class="t-addr" style="${hasRealAddress ? '' : 'color: #dc2626; font-weight: bold;'}">${displayAddress}</div>
                <div class="t-logistics">
                  <span>ZONE: ${order.deliveryZone.replace("_", " ").toUpperCase()}</span>
                  <span>${order.courierName ? `COURIER: ${order.courierName}` : "STANDARD DELIVERY"}${order.trackingCode ? ` • CN: ${order.trackingCode}` : ""}</span>
                </div>
              </div>

              <!-- Items Table -->
              <div class="t-items">
                <table class="t-table">
                  <thead>
                    <tr>
                      <th style="text-align: left; width: 62%;">Item Description</th>
                      <th style="text-align: center; width: 14%;">Qty</th>
                      <th style="text-align: right; width: 24%;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.slice(0, 4).map((item) => `
                      <tr>
                        <td>
                          <div class="t-item-name">${item.productName}${item.variantName ? ` <span style="font-weight: normal; color: #444;">(${item.variantName})</span>` : ""}</div>
                        </td>
                        <td style="text-align: center; font-family: monospace; font-weight: 800;">x${item.quantity}</td>
                        <td style="text-align: right; font-family: monospace; font-weight: 900;">৳${item.total.toLocaleString("en-BD")}</td>
                      </tr>
                    `).join("")}
                    ${order.items.length > 4 ? `
                      <tr>
                        <td colspan="3" style="text-align: center; font-size: 7px; color: #666; font-style: italic;">
                          + ${order.items.length - 4} more item(s)...
                        </td>
                      </tr>
                    ` : ""}
                  </tbody>
                </table>
              </div>

              <!-- Pricing & COD Banner -->
              <div class="t-totals">
                <div class="t-subtotal">
                  <div>Subtotal: ৳${order.subtotal.toLocaleString("en-BD")}</div>
                  <div>Delivery: ${order.deliveryFee === 0 ? "FREE" : `৳${order.deliveryFee}`}</div>
                </div>
                <div class="t-cod-box">
                  <div class="t-cod-lbl">CASH ON DELIVERY (COD)</div>
                  <div class="t-cod-val">৳${order.totalAmount.toLocaleString("en-BD")}</div>
                </div>
              </div>

              <!-- Footer -->
              <div class="t-foot">
                Thank you for shopping with ${siteTitle}! • ${hotline}
              </div>
            </div>
          </body>
        </html>
      `);
    } else {
      // Standard A4 full-page layout
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
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
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
              }
              .section-title {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #6b7280;
                margin-bottom: 4px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 20px;
                background: #f9fafb;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              }
              .info-val-strong { font-weight: 700; color: #111827; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
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
              ${document.getElementById("printable-invoice-a4")?.innerHTML || ""}
            </div>
          </body>
        </html>
      `);
    }
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
      <div className="bg-white w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col my-auto">
        {/* Modal Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-10 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Printer className="w-4 h-4 text-brand-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm truncate">
              Packing Memo / Invoice (#{order.id})
            </h3>
          </div>

          {/* Size Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Format Toggle Buttons */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaperSize("3x4")}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  paperSize === "3x4"
                    ? "bg-brand-500 text-brand-dark shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title='3" × 4" (75mm × 100mm) Standard Thermal Sticker Label'
              >
                <Tag className="w-3 h-3" />
                <span>3&quot; × 4&quot; (75×100mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("4x3")}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  paperSize === "4x3"
                    ? "bg-brand-500 text-brand-dark shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title='4" × 3" (100mm × 75mm) POS Thermal Sticker Label'
              >
                <Tag className="w-3 h-3" />
                <span>4&quot; × 3&quot; (100×75mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("a4")}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  paperSize === "a4"
                    ? "bg-brand-500 text-brand-dark shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Standard Full-Page A4 Invoice"
              >
                <FileText className="w-3 h-3" />
                <span>A4 Page</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Print Thermal Sticker / Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Native jsPDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              title="Generate Native PDF via jsPDF"
            >
              {generatingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-brand-400" />
              )}
              <span>{generatingPdf ? "PDF..." : "PDF"}</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 bg-slate-100/70 overflow-y-auto">
          {paperSize === "3x4" ? (
            /* 3" x 4" (75mm x 100mm) Thermal Label Preview */
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-brand-maroon-700" />
                <span>Thermal Label Preview (3&quot; × 4&quot; • 75mm × 100mm Portrait)</span>
              </div>

              {/* Exact 75mm x 100mm Container for on-screen & html2canvas */}
              <div
                id="printable-invoice-3x4"
                className="bg-white text-black flex flex-col justify-between overflow-hidden box-border select-none border border-slate-400 shadow-md font-sans leading-tight"
                style={{
                  width: "75mm",
                  height: "100mm",
                  maxWidth: "75mm",
                  maxHeight: "100mm",
                  padding: "2.2mm 2.8mm",
                  pageBreakInside: "avoid",
                  pageBreakAfter: "avoid",
                  boxSizing: "border-box",
                }}
              >
                {/* Top Header */}
                <div className="border-b-[1.5px] border-black pb-0.5 flex justify-between items-start">
                  <div>
                    <div className="font-black text-[11px] uppercase tracking-tight text-black leading-tight">
                      {siteTitle}
                    </div>
                    <div className="text-[7.5px] text-black/80 font-medium">
                      Hotline: {hotline} • hazenshopbd.com
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-[12px] text-black leading-tight">
                      #{order.id}
                    </div>
                    <div className="text-[7.5px] text-black/70">
                      {orderDate}
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Information */}
                <div className="border-b border-dashed border-black/80 py-1 space-y-0.5">
                  <div className="flex justify-between items-baseline gap-1">
                    <div className="text-[10px] font-black text-black truncate max-w-[62%]">
                      {order.customerName}
                    </div>
                    <div className="font-mono font-black text-[11px] text-black shrink-0">
                      {order.customerPhone}
                    </div>
                  </div>
                  <div className="text-[8.5px] leading-snug break-words">
                    {hasRealAddress ? (
                      <span className="text-black font-semibold">{displayAddress}</span>
                    ) : (
                      <span className="text-rose-600 font-bold">{displayAddress}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[7.5px] text-black/90 font-bold pt-0.5">
                    <span>
                      ZONE: {order.deliveryZone.replace("_", " ").toUpperCase()}
                    </span>
                    <span>
                      {order.courierName ? `COURIER: ${order.courierName}` : "STANDARD"}
                      {order.trackingCode ? ` • CN: ${order.trackingCode}` : ""}
                    </span>
                  </div>
                </div>

                {/* Items Summary (Compact List) */}
                <div className="flex-1 py-1 overflow-hidden flex flex-col justify-start">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black/30 text-[7.5px] font-black uppercase text-black/70">
                        <th className="text-left pb-0.5" style={{ width: "62%" }}>Item Description</th>
                        <th className="text-center pb-0.5" style={{ width: "14%" }}>Qty</th>
                        <th className="text-right pb-0.5" style={{ width: "24%" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {order.items.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="text-[8px] leading-tight">
                          <td className="py-0.5 pr-1 align-top">
                            <div className="font-bold text-black truncate max-w-[44mm]">
                              {item.productName}
                              {item.variantName && (
                                <span className="font-normal text-black/80"> ({item.variantName})</span>
                              )}
                            </div>
                          </td>
                          <td className="py-0.5 text-center font-bold font-mono text-black align-top">
                            x{item.quantity}
                          </td>
                          <td className="py-0.5 text-right font-black font-mono text-black align-top">
                            ৳{item.total.toLocaleString("en-BD")}
                          </td>
                        </tr>
                      ))}
                      {order.items.length > 5 && (
                        <tr>
                          <td colSpan={3} className="text-center text-[7px] text-black/70 italic py-0.5">
                            + {order.items.length - 5} more item(s)...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pricing & COD Total Banner */}
                <div className="border-t-[1.5px] border-black pt-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[7.5px] text-black/80 leading-tight">
                      <div>Subtotal: ৳{order.subtotal.toLocaleString("en-BD")}</div>
                      <div>Delivery: {order.deliveryFee === 0 ? "FREE" : `৳${order.deliveryFee}`}</div>
                    </div>
                    <div className="border-[1.5px] border-black px-2 py-0.5 rounded text-right bg-black text-white">
                      <div className="text-[6.5px] font-extrabold tracking-wider uppercase leading-tight">
                        CASH ON DELIVERY (COD)
                      </div>
                      <div className="font-mono font-black text-[12.5px] leading-none">
                        ৳{order.totalAmount.toLocaleString("en-BD")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimal Footer */}
                <div className="text-[6.5px] text-center text-black/60 pt-0.5">
                  Thank you for shopping with {siteTitle}! • {hotline}
                </div>
              </div>
            </div>
          ) : paperSize === "4x3" ? (
            /* 4" x 3" (100mm x 75mm) Thermal Label Preview */
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-brand-maroon-700" />
                <span>Thermal Label Preview (4&quot; × 3&quot; • 100mm × 75mm)</span>
              </div>

              {/* Exact 100mm x 75mm Container for on-screen & html2canvas */}
              <div
                id="printable-invoice-4x3"
                className="bg-white text-black flex flex-col justify-between overflow-hidden box-border select-none border border-slate-400 shadow-md font-sans leading-tight"
                style={{
                  width: "100mm",
                  height: "75mm",
                  maxWidth: "100mm",
                  maxHeight: "75mm",
                  padding: "2.2mm 3.2mm",
                  pageBreakInside: "avoid",
                  pageBreakAfter: "avoid",
                  boxSizing: "border-box",
                }}
              >
                {/* Top Header */}
                <div className="border-b-[1.5px] border-black pb-0.5 flex justify-between items-start">
                  <div>
                    <div className="font-black text-[11.5px] uppercase tracking-tight text-black leading-tight">
                      {siteTitle}
                    </div>
                    <div className="text-[7.5px] text-black/80 font-medium">
                      Hotline: {hotline} • hazenshopbd.com
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-[12px] text-black leading-tight">
                      #{order.id}
                    </div>
                    <div className="text-[7.5px] text-black/70">
                      {orderDate}
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Information */}
                <div className="border-b border-dashed border-black/80 py-1 space-y-0.5">
                  <div className="flex justify-between items-baseline gap-1">
                    <div className="text-[10px] font-black text-black truncate max-w-[62%]">
                      {order.customerName}
                    </div>
                    <div className="font-mono font-black text-[11px] text-black shrink-0">
                      {order.customerPhone}
                    </div>
                  </div>
                  <div className="text-[8.5px] leading-snug break-words">
                    {hasRealAddress ? (
                      <span className="text-black font-semibold">{displayAddress}</span>
                    ) : (
                      <span className="text-rose-600 font-bold">{displayAddress}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[7.5px] text-black/90 font-bold pt-0.5">
                    <span>
                      ZONE: {order.deliveryZone.replace("_", " ").toUpperCase()}
                    </span>
                    <span>
                      {order.courierName ? `COURIER: ${order.courierName}` : "STANDARD DELIVERY"}
                      {order.trackingCode ? ` • CN: ${order.trackingCode}` : ""}
                    </span>
                  </div>
                </div>

                {/* Items Summary (Compact List) */}
                <div className="flex-1 py-1 overflow-hidden flex flex-col justify-center">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black/30 text-[7.5px] font-black uppercase text-black/70">
                        <th className="text-left pb-0.5" style={{ width: "62%" }}>Item Description</th>
                        <th className="text-center pb-0.5" style={{ width: "14%" }}>Qty</th>
                        <th className="text-right pb-0.5" style={{ width: "24%" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <tr key={idx} className="text-[8px] leading-tight">
                          <td className="py-0.5 pr-1 align-top">
                            <div className="font-bold text-black truncate max-w-[58mm]">
                              {item.productName}
                              {item.variantName && (
                                <span className="font-normal text-black/80"> ({item.variantName})</span>
                              )}
                            </div>
                          </td>
                          <td className="py-0.5 text-center font-bold font-mono text-black align-top">
                            x{item.quantity}
                          </td>
                          <td className="py-0.5 text-right font-black font-mono text-black align-top">
                            ৳{item.total.toLocaleString("en-BD")}
                          </td>
                        </tr>
                      ))}
                      {order.items.length > 4 && (
                        <tr>
                          <td colSpan={3} className="text-center text-[7px] text-black/70 italic py-0.5">
                            + {order.items.length - 4} more item(s)...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pricing & COD Total Banner */}
                <div className="border-t-[1.5px] border-black pt-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[7.5px] text-black/80 leading-tight">
                      <div>Subtotal: ৳{order.subtotal.toLocaleString("en-BD")}</div>
                      <div>Delivery: {order.deliveryFee === 0 ? "FREE" : `৳${order.deliveryFee}`}</div>
                    </div>
                    <div className="border-[1.5px] border-black px-2 py-0.5 rounded text-right bg-black text-white">
                      <div className="text-[6.5px] font-extrabold tracking-wider uppercase leading-tight">
                        CASH ON DELIVERY (COD)
                      </div>
                      <div className="font-mono font-black text-[12px] leading-none">
                        ৳{order.totalAmount.toLocaleString("en-BD")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimal Footer */}
                <div className="text-[6.5px] text-center text-black/60 pt-0.5">
                  Thank you for shopping with {siteTitle}! • {hotline}
                </div>
              </div>
            </div>
          ) : (
            /* A4 Standard Full-Page Invoice Preview */
            <div id="printable-invoice-a4" className="p-4 sm:p-8 space-y-5 text-slate-900 text-xs bg-white rounded-2xl shadow-sm border border-slate-200">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-maroon-700 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                    HZN
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                      {siteTitle}
                    </h1>
                    <p className="text-slate-500 text-[11px]">Luxury Bedsheets &amp; Designer Window Curtains</p>
                    <p className="text-slate-500 text-[10px] sm:text-[11px]">
                      Hotline: {hotline} • hazenshopbd.com
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className="text-base sm:text-lg font-mono font-black text-brand-maroon-700 block">
                    INVOICE: #{order.id}
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Date: {orderDate}
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
                  <p className="font-bold text-slate-800 text-xs font-mono">{order.customerPhone}</p>
                  <p className="text-slate-700 text-[11px] mt-1 leading-relaxed break-words font-medium">
                    {displayAddress}
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Delivery Zone &amp; Logistics:
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
                <p className="font-bold text-slate-700">Thank you for ordering with {siteTitle}!</p>
                <p>
                  For queries or return assistance, call our helpline: {hotline}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
