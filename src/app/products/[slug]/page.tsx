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

  return (
    <ProductDetailClient
      product={product}
      settings={settings}
      relatedProducts={relatedProducts}
    />
  );
}
