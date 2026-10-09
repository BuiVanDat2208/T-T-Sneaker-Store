"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranslatedText } from "@/components/ui/translated-text";
import { cn } from "@/lib/utils";

interface ImageWithTextProps {
  images: string[];
  imageAlt: string;
  tagKey?: string;
  titleKey?: string;
  descKey?: string;
  title?: string;
  desc?: string;
  primaryBtnKey?: string;
  primaryBtnHref?: string;
  secondaryBtnKey?: string;
  secondaryBtnHref?: string;
  imagePosition?: "left" | "right";
  className?: string;
  autoPlayInterval?: number;
}

export function ImageWithText({
  images,
  imageAlt,
  tagKey,
  titleKey = "",
  descKey = "",
  title,
  desc,
  primaryBtnKey,
  primaryBtnHref = "#",
  secondaryBtnKey,
  secondaryBtnHref = "#",
  imagePosition = "right",
  className,
  autoPlayInterval = 4000,
}: ImageWithTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isHovered && images.length > 1) {
      const timer = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [isHovered, nextSlide, autoPlayInterval, images.length]);

  return (
    <div className={cn("container grid min-h-[520px] items-center gap-10 py-10 md:grid-cols-[1fr_1.1fr]", className)}>
      {/* Text Section */}
      <div className={cn("max-w-xl space-y-6", imagePosition === "left" && "md:order-2")}>
        {tagKey && (
          <TranslatedText textKey={tagKey} as="p" className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400" />
        )}
        {title ? (
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {title}
          </h1>
        ) : (
          <TranslatedText textKey={titleKey} as="h1" className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white" />
        )}

        {desc ? (
          <p className="text-lg text-muted-foreground dark:text-slate-400">
            {desc}
          </p>
        ) : (
          <TranslatedText textKey={descKey} as="p" className="text-lg text-muted-foreground dark:text-slate-400" />
        )}
        
        {(primaryBtnKey || secondaryBtnKey) && (
          <div className="flex flex-wrap gap-3">
            {primaryBtnKey && (
              <Button asChild>
                <Link href={primaryBtnHref}>
                  <TranslatedText textKey={primaryBtnKey} className="mr-2" /> <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {secondaryBtnKey && (
              <Button asChild variant="outline" className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                <Link href={secondaryBtnHref}>
                  <TranslatedText textKey={secondaryBtnKey} />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Image Slider Section */}
      <div 
        className={cn("relative aspect-[5/4] overflow-hidden rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10 group", imagePosition === "left" && "md:order-1")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="flex transition-transform duration-500 ease-out h-full w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <Image
                src={src}
                alt={`${imageAlt} - ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/50 hover:bg-white/90 text-slate-900 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/50 hover:bg-white/90 text-slate-900 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentIndex === i ? "bg-white w-4 shadow-sm" : "bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
