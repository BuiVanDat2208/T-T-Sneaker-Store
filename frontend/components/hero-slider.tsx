"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
}

const getOptimizedUrl = (url: string, isMobile: boolean): string => {
  if (!url) return "";

  // 1. Unsplash Optimization
  if (url.includes("images.unsplash.com")) {
    const width = isMobile ? "800" : "1600";
    let optimized = url.replace(/w=\d+/, `w=${width}`);
    if (!optimized.includes("w=")) {
      optimized += `&w=${width}`;
    }
    optimized = optimized.replace(/q=\d+/, "q=70");
    if (!optimized.includes("q=")) {
      optimized += "&q=70";
    }
    if (optimized.includes("auto=format")) {
      optimized = optimized.replace("auto=format", "fm=webp");
    } else if (!optimized.includes("fm=")) {
      optimized += "&fm=webp";
    }
    return optimized;
  }

  // 2. Cloudinary Optimization
  if (url.includes("res.cloudinary.com")) {
    const width = isMobile ? "800" : "1600";
    const optParams = `f_auto,q_auto,w_${width}`;
    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/${optParams}/`);
    }
  }

  return url;
};

const defaultSlides: Slide[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    title: "slider.slide1.title",
    subtitle: "slider.slide1.subtitle",
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop",
    title: "slider.slide2.title",
    subtitle: "slider.slide2.subtitle",
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=2025&auto=format&fit=crop",
    title: "slider.slide3.title",
    subtitle: "slider.slide3.subtitle",
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlayInterval?: number;
  className?: string;
}

export function HeroSlider({
  slides = defaultSlides,
  autoPlayInterval = 5000,
  className,
}: HeroSliderProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [imgTransform, setImgTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setImgTransform({ x: x * -20, y: y * -20 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setImgTransform({ x: 0, y: 0 });
  };

  const prevSlide = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [isHovered, nextSlide, autoPlayInterval]);

  return (
    <div
      ref={sliderRef}
      className={cn("relative w-screen h-screen overflow-hidden group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      suppressHydrationWarning
    >
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-out h-full w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-screen h-screen flex-shrink-0 relative overflow-hidden"
          >
            {/* Moving Background (Mobile) */}
            <div
              className="absolute inset-[-30px] bg-cover bg-center transition-transform duration-300 ease-out block md:hidden"
              style={{ 
                backgroundImage: `url(${getOptimizedUrl(slide.imageUrl, true)})`,
                transform: `translate(${imgTransform.x}px, ${imgTransform.y}px) scale(1.05)`
              }}
            />
            {/* Moving Background (Desktop) */}
            <div
              className="absolute inset-[-30px] bg-cover bg-center transition-transform duration-300 ease-out hidden md:block"
              style={{ 
                backgroundImage: `url(${getOptimizedUrl(slide.imageUrl, false)})`,
                transform: `translate(${imgTransform.x}px, ${imgTransform.y}px) scale(1.05)`
              }}
            />
            {/* Fixed Overlay */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 transform transition-all duration-700 translate-y-0 opacity-100">
                {slide.title.includes('.') ? t(slide.title) : slide.title}
              </h1>
              <p className="text-lg md:text-2xl max-w-2xl transform transition-all duration-700 delay-100 translate-y-0 opacity-100">
                {slide.subtitle.includes('.') ? t(slide.subtitle) : slide.subtitle}
              </p>
              <button className="mt-8 px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors duration-300 transform transition-all delay-200">
                {t("slider.explore")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              currentIndex === slideIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/80"
            )}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
