import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    db.getProductBySlug(params.id),
    db.getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <ProductForm categories={categories} initialProduct={product} />
    </div>
  );
}
