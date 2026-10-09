import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { TranslatedText } from "@/components/ui/translated-text";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductGridSectionProps {
  titleKey?: string;
  descKey?: string;
  title?: string;
  desc?: string;
  products: Product[];
  viewAllLink?: string;
  className?: string;
  containerClassName?: string;
}

export function ProductGridSection({
  titleKey,
  descKey,
  title,
  desc,
  products,
  viewAllLink,
  className,
  containerClassName,
}: ProductGridSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className={cn("py-12", className)}>
      <div className={cn("container", containerClassName)}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {title ? (
              <h2 className="text-3xl font-semibold tracking-tight dark:text-white">{title}</h2>
            ) : (
              titleKey && <TranslatedText textKey={titleKey} as="h2" className="text-3xl font-semibold tracking-tight dark:text-white" />
            )}
            
            {desc ? (
              <p className="mt-1 text-muted-foreground dark:text-slate-400">{desc}</p>
            ) : (
              descKey && <TranslatedText textKey={descKey} as="p" className="mt-1 text-muted-foreground dark:text-slate-400" />
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm font-medium text-blue-600 dark:text-blue-400">
              <TranslatedText textKey="home.view_all" />
            </Link>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
