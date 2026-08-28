import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const categories = await db.getCategories();
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const products = await db.getProducts({ category: category.slug });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-brand-maroon-700 text-white p-5 sm:p-10 border border-white/10 shadow-card flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2.5 sm:space-y-3 max-w-xl">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-brand-gold-300 font-bold hover:text-white mb-1 transition-colors min-h-[36px] py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>কালেকশনে ফিরে যান (Back to Collections)</span>
          </Link>
          <h1 className="font-heading text-xl sm:text-4xl font-extrabold text-white tracking-tight">{category.name}</h1>
          <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">{category.description}</p>
          <span className="inline-block bg-white/15 text-brand-gold-300 font-bold text-xs px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-sm">
            {products.length}টি কালেকশন ডিজাইন রেডি (Cash on Delivery)
          </span>
        </div>

        <div className="relative w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shrink-0 shadow-subtle bg-black/20">
          <Image src={category.image || "/logo.jpg"} alt={category.name} fill className="object-cover" />
        </div>
      </div>


      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-black/[0.06] shadow-subtle">
          <p className="text-slate-600 text-xs sm:text-sm font-normal">New designs coming soon for {category.name}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}


