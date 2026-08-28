"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const displayImages = images.length > 0 ? images : ["/logo.jpg"];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail column */}
      {displayImages.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 pb-1 md:pb-0">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all ${
                selectedImage === idx
                  ? "ring-2 ring-brand-dark shadow-subtle opacity-100"
                  : "border border-black/[0.06] hover:border-black/20 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${name} ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-[#f4f2ee] border border-black/[0.06] shadow-subtle group">
        <Image
          src={displayImages[selectedImage]}
          alt={name}
          fill
          priority
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>
    </div>
  );
}

