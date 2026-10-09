"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/types";
import { useAnalytics } from "@/providers/analytics-provider";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const { data } = useQuery({
    queryKey: ["suggest", deferred],
    enabled: deferred.trim().length >= 2,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/products/suggest?q=${encodeURIComponent(deferred)}`);
      return response.json() as Promise<{ products: Product[] }>;
    }
  });

  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    if (deferred.trim().length >= 2) {
      trackEvent("search", { query: deferred });
    }
  }, [deferred]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm giày Nike, Adidas..."
        className="pl-9"
        aria-label="Tìm kiếm sản phẩm"
      />
      {data?.products?.length ? (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-md border bg-white shadow-lg">
          {data.products.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="block px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => setQuery("")}
            >
              <span className="font-medium">{product.name}</span>
              <span className="ml-2 text-muted-foreground">{product.brandName || product.brandId?.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
