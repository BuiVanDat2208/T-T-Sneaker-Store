"use client";

import Link from "next/link";
import { TranslatedText } from "@/components/ui/translated-text";
import { cn } from "@/lib/utils";
import { Zap, Triangle, Footprints, Cat, Box, Star, Activity, Wind, Shield, Flame } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  slug: string;
}

interface BrandGridSectionProps {
  titleKey?: string;
  title?: string;
  brands: Brand[] | string[];
  className?: string;
  containerClassName?: string;
}

function getBrandIcon(name: string) {
  const iconClass = "h-8 w-8 mb-3 text-slate-700 dark:text-slate-300 transition-transform group-hover:scale-110";
  switch (name.toLowerCase()) {
    case "nike": return <Zap className={iconClass} />;
    case "adidas": return <Triangle className={iconClass} />;
    case "new balance": return <Footprints className={iconClass} />;
    case "puma": return <Cat className={iconClass} />;
    case "converse": return <Star className={iconClass} />;
    case "reebok": return <Activity className={iconClass} />;
    case "vans": return <Wind className={iconClass} />;
    case "under armour": return <Shield className={iconClass} />;
    case "fila": return <Flame className={iconClass} />;
    default: return <Box className={iconClass} />;
  }
}

export function BrandGridSection({
  titleKey,
  title,
  brands,
  className,
  containerClassName,
}: BrandGridSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!brands || brands.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    setIsDragging(false);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Tốc độ cuộn
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!scrollRef.current || isDown) return;
      
      const container = scrollRef.current;
      const itemWidth = container.querySelector('a')?.clientWidth || 192;
      const gap = 16;
      const step = itemWidth + gap;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3000);
    
    return () => clearInterval(timer);
  }, [isDown]);

  return (
    <section className={cn("py-12", className)}>
      <div className={cn("container", containerClassName)}>
        {title ? (
          <h2 className="mb-5 text-3xl font-semibold tracking-tight dark:text-white">
            {title}
          </h2>
        ) : (
          titleKey && <TranslatedText textKey={titleKey} as="h2" className="mb-6 text-3xl font-semibold tracking-tight dark:text-white" />
        )}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4",
            isDown ? "cursor-grabbing" : "cursor-grab",
            "scrollbar-none"
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brandItem) => {
            const isObject = typeof brandItem !== 'string';
            const brandName = isObject ? (brandItem as Brand).name : (brandItem as string);
            const brandLogo = isObject ? (brandItem as Brand).logo : undefined;
            const brandId = isObject ? (brandItem as Brand)._id : brandName;

            return (
              <Link
                key={brandId}
                href={`/products?brand=${encodeURIComponent(brandName)}`}
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                  }
                }}
                className="group flex flex-col items-center justify-center rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 p-6 font-semibold transition-all hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400 dark:text-slate-200 text-center w-48 lg:w-[calc((100%-5rem)/6)] shrink-0 snap-start"
              >
                {brandLogo ? (
                   <div className="relative h-12 w-full mb-3 flex items-center justify-center">
                      <img 
                        src={brandLogo} 
                        alt={brandName}
                        className="max-h-full max-w-full object-contain transition-transform group-hover:scale-110"
                      />
                   </div>
                ) : (
                  getBrandIcon(brandName)
                )}
                <span className="text-sm uppercase tracking-wider">{brandName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
