"use client";

import { useTranslation } from "@/lib/i18n";
import { HeroSlider } from "@/components/hero-slider";
import { ImageWithText } from "@/components/ui/image-with-text";
import { ProductGridSection } from "@/components/product/product-grid-section";
import { BrandGridSection } from "@/components/brand/brand-grid-section";
import { BannerGrid } from "@/components/banner/banner-grid";
import { HeroVideo } from "@/components/hero-video";
import { ImageGallery } from "@/components/image-gallery";

interface DynamicHomepageProps {
  homepageContent: any;
  featuredProducts: any[];
  bestSellers: any[];
  brands: any[]; // Đổi sang any[] để nhận object brand
}

export function DynamicHomepage({ 
  homepageContent, 
  featuredProducts, 
  bestSellers,
  brands 
}: DynamicHomepageProps) {
  const { language } = useTranslation();
  
  // Lấy content theo ngôn ngữ hiện tại, fallback về "vi" nếu không có
  const content = homepageContent?.[language] || homepageContent?.vi || homepageContent || {};

  return (
    <>
      <section className="bg-slate-50 dark:bg-slate-900">
        {/* Slider */}
        {content.slider?.show !== false && (
          <HeroSlider 
            slides={content.slider?.items?.length > 0 ? content.slider.items : undefined} 
          />  
        )}
        
        {content.brand_section?.show !== false && (
          <BrandGridSection
            title={content.brand_section?.title}
            titleKey={!content.brand_section?.title ? "home.shop_by_brand" : undefined}
            brands={brands}
          />
        )}

        {/* Hero Section */}
        {content.hero_section?.show !== false && (
          <ImageWithText 
            images={content.hero_section?.imageUrl ? [content.hero_section.imageUrl] : [
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80"
            ]}
            imageAlt="T&T Sneaker Collection"
            title={content.hero_section?.title}
            desc={content.hero_section?.subtitle}
            tagKey="home.hero_tag"
            primaryBtnKey="home.buy_now"
            primaryBtnHref={content.hero_section?.link || "/products"}
            imagePosition="right"
          />
        )}
      </section>

      {/* Sản phẩm mới */}
      {content.new_products?.show !== false && (
        <ProductGridSection
          title={content.new_products?.title}
          titleKey={!content.new_products?.title ? "home.new_products" : undefined}
          desc={content.new_products?.desc}
          descKey={!content.new_products?.desc ? "home.new_products_desc" : undefined}
          products={featuredProducts}
          viewAllLink="/products"
        />
      )}

      {/* 3 Banner */}
      {content.banners?.show !== false && (
        <BannerGrid
          banners={content.banners?.items?.length > 0 ? content.banners.items : undefined}
        />
      )}

      {/* Video */}
      {content.video_section?.show !== false && (
        <HeroVideo
          videoUrl={content.video_section?.videoUrl || "https://cdn.pixabay.com/video/2020/07/30/45894-445655382_large.mp4"}
          posterUrl={content.video_section?.posterUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1920&q=80"}
          title={content.video_section?.title}
          titleKey={!content.video_section?.title ? "video.title" : undefined}
        />
      )}

      {/* Sản phẩm bán chạy */}
      {content.hot_products?.show !== false && (
        <ProductGridSection
          title={content.hot_products?.title}
          titleKey={!content.hot_products?.title ? "home.hot_products" : undefined}
          desc={content.hot_products?.desc}
          descKey={!content.hot_products?.desc ? "home.hot_products_desc" : undefined}
          products={bestSellers}
          className="bg-slate-50 dark:bg-slate-900"
        />
      )}

      {/* Gallery */}
      {content.gallery_section?.show !== false && (
        <ImageGallery
          title={content.gallery_section?.title}
          titleKey={!content.gallery_section?.title ? "gallery.title" : undefined}
          desc={content.gallery_section?.desc}
          descKey={!content.gallery_section?.desc ? "gallery.desc" : undefined}
          images={content.gallery_section?.items?.length > 0 ? content.gallery_section.items : [
            { src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", href: "/products" },
            { src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80", href: "/products" },
            { src: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=600&q=80", href: "/products" },
            { src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", href: "/products" },
            { src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80", href: "/products" },
          ]}
        />
      )}
    </>
  );
}
