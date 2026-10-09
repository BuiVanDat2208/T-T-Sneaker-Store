import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/product/add-to-cart";
import { getProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, ShieldCheck, Truck, RefreshCcw, Layers, Zap } from "lucide-react";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await getProduct(slug);
    return {
      title: `${product.name} | T&T Sneaker`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images
      }
    };
  } catch {
    return { title: "Sản phẩm không tồn tại" };
  }
}

const genderLabels = { men: "Nam", women: "Nữ", unisex: "Unisex", kids: "Trẻ em" };
const styleLabels = { low: "Cổ thấp (Low)", mid: "Cổ lửng (Mid)", high: "Cổ cao (High)" };

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let data;

  try {
    data = await getProduct(slug);
  } catch {
    notFound();
  }

  const { product, reviews } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <main className="container py-10">
      {/* Breadcrumbs */}
      <nav className="mb-10 flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-slate-900 transition-colors">Sản phẩm</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Gallery */}
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.images.map((image, idx) => (
              <div key={idx} className={`relative aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 group ${idx === 0 ? "sm:col-span-2 aspect-[16/10]" : ""}`}>
                <Image 
                  src={image} 
                  alt={product.name} 
                  fill 
                  sizes="(min-width: 1024px) 50vw, 100vw" 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  priority={idx === 0} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Product Info */}
        <section className="h-fit sticky top-24 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100">
                 {product.brandId?.name || product.brandName}
               </span>
               <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-600 border border-slate-200">
                 {genderLabels[product.gender]}
               </span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-blue-600">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-lg text-slate-400 line-through decoration-slate-400/50">
                  {formatCurrency(product.originalPrice)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-5 rounded-2xl border bg-slate-50/50 space-y-4">
            <p className="text-slate-600 leading-relaxed text-sm">
              {product.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Layers className="h-4 w-4 text-slate-400" />
                Kiểu dáng: {styleLabels[product.style]}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Zap className="h-4 w-4 text-slate-400" />
                Tồn kho: {product.totalStock} sản phẩm
              </div>
            </div>
          </div>

          {/* Add to Cart Component */}
          <AddToCart product={product} />

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-900 uppercase">100% Chính hãng</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-900 uppercase">Giao nhanh 2h</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-900 uppercase">Đổi trả 7 ngày</span>
            </div>
          </div>
        </section>
      </div>

      {/* Reviews Section */}
      <section className="mt-20 border-t pt-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Đánh giá thực tế</h2>
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold">
            {reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "5.0"} 
            <span className="text-yellow-400">★</span>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review._id} className="group rounded-2xl border p-6 bg-white transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                      {review.userId.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{review.userId.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Khách hàng xác thực</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "opacity-100" : "opacity-20"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{review.comment}"</p>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 rounded-3xl border-2 border-dashed bg-slate-50/50 p-16 text-center">
              <p className="text-slate-400 font-medium italic">Chưa có đánh giá nào cho đôi giày này. Hãy là người đầu tiên trải nghiệm!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
