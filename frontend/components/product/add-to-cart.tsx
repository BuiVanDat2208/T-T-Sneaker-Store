"use client";

import { useState } from "react";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAnalytics } from "@/providers/analytics-provider";

export function AddToCart({ product }: { product: Product }) {
  const { trackEvent } = useAnalytics();
  // Tìm size đầu tiên còn hàng để chọn mặc định
  const firstAvailableVariant = product.variants?.find(v => v.stock > 0);
  const [selectedSize, setSelectedSize] = useState<number | null>(
    firstAvailableVariant ? firstAvailableVariant.size : (product.variants?.[0]?.size || null)
  );
  
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.totalStock === 0;

  const handleAddToCart = () => {
    if (selectedSize === null) return;
    addItem(product, selectedSize);
    
    // Track event for AI
    trackEvent("add_to_cart", {
      productId: product._id,
      name: product.name,
      size: selectedSize,
      price: product.price
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-900">Chọn kích cỡ (Size)</p>
          <span className="text-xs text-slate-500">Bảng quy đổi size</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {product.variants?.map((variant) => {
            const outOfStock = variant.stock <= 0;
            return (
              <button
                key={variant.size}
                type="button"
                disabled={outOfStock}
                onClick={() => setSelectedSize(variant.size)}
                className={cn(
                  "relative h-12 rounded-lg border text-sm font-bold transition-all overflow-hidden",
                  selectedSize === variant.size
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "border-slate-200 text-slate-600 hover:border-blue-400",
                  outOfStock && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-100 line-through text-slate-300"
                )}
              >
                {variant.size}
                {variant.stock > 0 && variant.stock <= 3 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>
        
        {selectedSize && (
          <p className="mt-3 text-[11px] text-slate-500 italic">
            * {product.variants?.find(v => v.size === selectedSize)?.stock} sản phẩm còn lại trong kho cho size này.
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button 
          className="w-full h-14 text-base font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98]" 
          onClick={handleAddToCart} 
          disabled={isOutOfStock || !selectedSize}
        >
          {isOutOfStock ? (
             <>Hết hàng</>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5 mr-2" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>
        
        {isOutOfStock && (
          <div className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            Sản phẩm hiện đang tạm hết hàng
          </div>
        )}
      </div>
    </div>
  );
}
