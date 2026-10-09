"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, close, open, removeItem, updateQuantity } = useCartStore();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(value) => (value ? open() : close())}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mở giỏ hàng" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {mounted && count > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-xs text-white">
              {count}
            </span>
          ) : null}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/30 transition-all duration-500 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-white shadow-xl transition-all duration-500 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <Dialog.Title className="text-lg font-semibold">Giỏ hàng</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Đóng giỏ hàng">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-auto p-5">
            {items.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                Giỏ hàng của bạn đang trống.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.slug}`} className="line-clamp-1 font-medium" onClick={close}>
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">Size {item.size}</p>
                      <p className="text-sm font-semibold">{formatCurrency(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-8 w-8"
                          onClick={() => removeItem(item.productId, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t p-5">
            <div className="mb-4 flex items-center justify-between font-semibold">
              <span>Tạm tính</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button asChild className="w-full" disabled={items.length === 0} onClick={close}>
              <Link href="/checkout">Thanh toán</Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
