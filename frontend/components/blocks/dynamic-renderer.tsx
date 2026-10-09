"use client";

import React from "react";
import { HeroSlider } from "@/components/hero-slider";
import { ProductGridSection } from "@/components/product/product-grid-section";
import { ImageWithText } from "@/components/ui/image-with-text";
import { BannerGrid } from "@/components/banner/banner-grid";
import { HeroVideo } from "@/components/hero-video";
import { ImageGallery } from "@/components/image-gallery";
import { BrandGridSection } from "@/components/brand/brand-grid-section";

// Mapping các type từ database sang component tương ứng
const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  "hero-slider": HeroSlider,
  "product-grid": ProductGridSection,
  "image-with-text": ImageWithText,
  "banner-grid": BannerGrid,
  "hero-video": HeroVideo,
  "image-gallery": ImageGallery,
  "brand-grid": BrandGridSection,
};

interface Block {
  type: string;
  settings: any;
  content?: any;
}

interface DynamicRendererProps {
  blocks: Block[];
}

/**
 * Hàm hỗ trợ map các prop từ Page Builder sang component thực tế
 * Ví dụ: title -> titleKey, image -> imageUrl
 */
function smartMapProps(type: string, props: any) {
  const mapped = { ...props };

  // 1. Chuyển title/subtitle thành titleKey/subtitleKey nếu component yêu cầu Key
  if (mapped.title && !mapped.titleKey) mapped.titleKey = mapped.title;
  if (mapped.subtitle && !mapped.subtitleKey) mapped.subtitleKey = mapped.subtitle;
  if (mapped.description && !mapped.descKey) mapped.descKey = mapped.description;

  // 2. Xử lý đặc biệt cho từng loại block
  if (type === "hero-slider" && Array.isArray(mapped.slides)) {
    mapped.slides = mapped.slides.map((s: any) => ({
      ...s,
      imageUrl: s.imageUrl || s.image,
      title: s.title || s.titleKey,
      subtitle: s.subtitle || s.subtitleKey
    }));
  }

  if (type === "banner-grid" && Array.isArray(mapped.banners)) {
    mapped.banners = mapped.banners.map((b: any) => ({
      ...b,
      titleKey: b.titleKey || b.title,
      subtitleKey: b.subtitleKey || b.subtitle,
      imageUrl: b.imageUrl || b.image,
      linkUrl: b.linkUrl || b.link
    }));
  }

  return mapped;
}

export function DynamicRenderer({ blocks }: DynamicRendererProps) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const Component = BLOCK_COMPONENTS[block.type];
        
        if (!Component) {
          console.warn(`Block type "${block.type}" is not supported.`);
          return null;
        }

        const combinedProps = { ...block.settings, ...block.content };
        const finalProps = smartMapProps(block.type, combinedProps);

        return <Component key={index} {...finalProps} />;
      })}
    </>
  );
}
