"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { TranslatedText } from "@/components/ui/translated-text";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  titleKey?: string;
  descKey?: string;
  title?: string;
  desc?: string;
  images: { src: string; href?: string }[];
  className?: string;
}

export function ImageGallery({ titleKey, descKey, title, desc, images, className }: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <section className={cn("pt-12", className)}>
      {/* Header */}
      <div className="text-center mb-8 px-4">
        {title ? (
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
        ) : (
          titleKey && <TranslatedText
            textKey={titleKey}
            as="h2"
            className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white"
          />
        )}
        
        {desc ? (
           <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400 max-w-xl mx-auto">
            {desc}
           </p>
        ) : (
          descKey && <TranslatedText
            textKey={descKey}
            as="p"
            className="mt-2 text-sm text-muted-foreground dark:text-slate-400 max-w-xl mx-auto"
          />
        )}
      </div>

      {/* Gallery Grid — full width, no gaps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {images.map((img, i) => {
          const content = (
            <>
              <Image
                src={img.src}
                alt=""
                fill
                sizes="(min-width: 768px) 20vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            </>
          );

          return img.href ? (
            <Link
              key={i}
              href={img.href}
              className="group relative aspect-square overflow-hidden"
              aria-label={`Xem sản phẩm bộ sưu tập số ${i + 1}`}
            >
              {content}
            </Link>
          ) : (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden cursor-pointer"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
