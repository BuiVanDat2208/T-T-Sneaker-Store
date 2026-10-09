"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TranslatedText } from "@/components/ui/translated-text";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

export interface BannerItem {
  id: string;
  titleKey: string;
  subtitleKey: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  link?: string;
  bgColorClass?: string;
}

interface BannerGridProps {
  banners: BannerItem[];
  className?: string;
  containerClassName?: string;
}

function MouseParallaxCard({ banner }: { banner: BannerItem }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [imgTransform, setImgTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    // Tính toán vị trí chuột tương đối (-1 đến 1)
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setImgTransform({ x: x * -20, y: y * -20 }); // Ảnh di chuyển ngược hướng chuột
  };

  const handleMouseLeave = () => {
    setImgTransform({ x: 0, y: 0 }); // Reset về giữa
  };

  return (
    <Link
      ref={cardRef}
      href={banner.link || banner.linkUrl || "#"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl min-h-[320px] md:h-[600px] transition-transform hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Background Image - di chuyển theo chuột */}
      <div
        className="absolute inset-[-30px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${imgTransform.x}px, ${imgTransform.y}px) scale(1.05)`,
        }}
      >
        <Image
          src={banner.imageUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/80" />

      {/* Nội dung chữ */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col items-start gap-1">
        {banner.title ? (
          <h3 className="text-3xl font-semibold tracking-tight text-white drop-shadow-md">
            {banner.title}
          </h3>
        ) : (
          <TranslatedText
            textKey={banner.titleKey}
            as="h3"
            className="text-3xl font-semibold tracking-tight text-white drop-shadow-md"
          />
        )}
        
        {banner.subtitle ? (
           <p className="text-sm font-medium text-white/80">
            {banner.subtitle}
           </p>
        ) : (
          <TranslatedText
            textKey={banner.subtitleKey}
            as="p"
            className="text-sm font-medium text-white/80"
          />
        )}
      </div>

      {/* Nút Shop now */}
      <div className="relative z-10 p-6 md:p-8 mt-auto">
        <span className="inline-flex items-center gap-1 border-b-2 border-white pb-0.5 text-sm font-bold text-white transition-colors group-hover:text-blue-300 group-hover:border-blue-300">
          Shop now <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function BannerGrid({ banners, className, containerClassName }: BannerGridProps) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className={cn("py-12", className)}>
      <div className={cn("container grid gap-6 md:grid-cols-3", containerClassName)}>
        {banners.map((banner) => (
          <MouseParallaxCard key={banner.id} banner={banner} />
        ))}
      </div>
    </section>
  );
}


