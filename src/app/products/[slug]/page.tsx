import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await db.getProductBySlug(params.slug);
  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.length > 0 ? [product.images[0]] : ["/logo.jpg"],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await db.getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const settings = await db.getSettings();
  const allProducts = await db.getProducts({ category: product.category });
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  // Google Merchant / Schema.org Product Structured Data
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images : ["https://hazenshopbd.com/logo.jpg"],
    description: product.shortDescription || product.description,
    sku: product.sku || product.id,
    productID: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "HAZENSHOP BD",
    },
    offers: {
      "@type": "Offer",
      url: `https://hazenshopbd.com/products/${product.slug}`,
      priceCurrency: "BDT",
      price: product.salePrice ?? product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "HAZENSHOP BD",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        settings={settings}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
