import React from "react";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await db.getCategories();

  return (
    <div>
      <ProductForm categories={categories} />
    </div>
  );
}
