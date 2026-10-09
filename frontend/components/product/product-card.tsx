"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.totalStock === 0;
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const firstAvailableVariant = product.variants?.find(v => v.stock > 0);
  const selectedSize = firstAvailableVariant ? firstAvailableVariant.size : (product.variants?.[0]?.size || null);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, quantity);
  };

  return (
    <article className="group relative overflow-hidden rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md dark:hover:shadow-slate-800/50">
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {product.isFeatured && (
          <span className="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase shadow-sm">
            {t("product.featured")}
          </span>
        )}
        {product.isBestSeller && (
          <span className="rounded bg-orange-700 px-2 py-1 text-[10px] font-bold text-white uppercase shadow-sm">
            {t("product.best_seller")}
          </span>
        )}
      </div>

      <Link href={`/products/${product.slug}`} aria-label={product.name}>
        <div className="relative aspect-[1/1] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="rounded-full bg-white dark:bg-slate-800 px-4 py-1 text-sm font-bold text-slate-900 dark:text-white shadow-xl">
                {t("product.out_of_stock")}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <span>{product.brandId?.name || product.brandName}</span>
        </div>
        
        <h2 className="line-clamp-2 min-h-[3rem] text-lg font-semibold leading-relaxed text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h2>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
             <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(product.price)}</span>
             {product.originalPrice && product.originalPrice > product.price ? (
               <span className="text-xs text-slate-400 dark:text-slate-500 line-through decoration-slate-400/50">
                 {formatCurrency(product.originalPrice)}
               </span>
             ) : null}
          </div>
          <div className="flex gap-1">
             {product.variants?.slice(0, 2).map(v => (
               <span key={v.size} className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                 {v.size}
               </span>
             ))}
             {product.variants?.length > 2 && <span className="text-[9px] text-slate-300 dark:text-slate-600">...</span>}
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center gap-2 pt-3 border-t dark:border-slate-800 mt-2">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-9 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="px-2 h-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              disabled={isOutOfStock || quantity <= 1}
              aria-label="Giảm số lượng"
            >
              <Minus size={14} className="text-slate-600 dark:text-slate-400" />
            </button>
            <span className="px-2 text-sm font-semibold w-7 text-center text-slate-800 dark:text-slate-200">{quantity}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(quantity + 1);
              }}
              className="px-2 h-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              disabled={isOutOfStock}
              aria-label="Tăng số lượng"
            >
              <Plus size={14} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            disabled={isOutOfStock || !selectedSize}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <ShoppingBag size={14} />
            Thêm
          </button>
        </div>
      </div>
    </article>
  );
}
