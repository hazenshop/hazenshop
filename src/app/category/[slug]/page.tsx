import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const categories = await db.getCategories();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} | HAZENSHOP BD (hazenshopbd.com)`,
    description:
      category.description ||
      `Shop premium handcrafted ${category.name} with 100% Cash on Delivery across Bangladesh.`,
    openGraph: {
      title: `${category.name} Collection | HAZENSHOP BD`,
      description: category.description,
      images: [category.coverImage || category.image || "/logo.jpg"],
    },
  };
}

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const categories = await db.getCategories();
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const products = await db.getProducts({ category: category.slug });

  // Schema.org BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://hazenshopbd.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://hazenshopbd.com/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `https://hazenshopbd.com/category/${category.slug}`,
      },
    ],
  };

  const coverUrl = category.coverImage || category.image || "/logo.jpg";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* 16:9 Widescreen Category Cover Banner */}
      <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-card border border-black/[0.06] bg-slate-950 flex flex-col justify-between p-4 sm:p-8 lg:p-10 text-white">
        {/* Background Cover Image (16:9) */}
        <Image
          src={coverUrl}
          alt={category.name}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />

        {/* Sophisticated Dark Gradient Overlays for contrast & elegance */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent pointer-events-none" />

        {/* Top Navigation & Count Badge */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-white/90 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full font-bold transition-all border border-white/15 shadow-sm min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-gold-300" />
            <span>সকল কালেকশন</span>
          </Link>

          <span className="inline-flex items-center text-[11px] sm:text-xs font-bold bg-black/40 hover:bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-brand-gold-300 border border-white/20 shadow-sm">
            {products.length}টি কালেকশন রেডি
          </span>
        </div>

        {/* Bottom Banner Content */}
        <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-2.5">
          <div className="inline-block bg-brand-maroon-700/90 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
            HAZEN Signature Department
          </div>
          <h1 className="font-heading text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow">
              {category.description}
            </p>
          )}
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
    </>
  );
}


