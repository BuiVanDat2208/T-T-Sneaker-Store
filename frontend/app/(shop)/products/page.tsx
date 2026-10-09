import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { getProducts, getBrands, getCategories } from "@/lib/api";
import { Filter, X, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Danh sách giày thể thao | T&T Sneaker",
  description: "Lọc và mua giày thể thao chính hãng theo thương hiệu, size và khoảng giá."
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    brandId?: string;
    categoryId?: string;
    gender?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  // Fetch data in parallel
  const [productsData, brandsData, categoriesData] = await Promise.all([
    getProducts({ ...params, limit: "12" }),
    getBrands(),
    getCategories()
  ]);

  const { products, pagination } = productsData;
  const { brands } = brandsData;
  const { categories } = categoriesData;

  return (
    <main className="container py-10">
      <section className="mb-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-medium">Sản phẩm</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Tất cả Sneaker</h1>
        <p className="mt-3 text-lg text-slate-500 max-w-2xl">
          Khám phá bộ sưu tập giày thể thao đa dạng từ các thương hiệu hàng đầu thế giới. 
          Đảm bảo 100% chính hãng.
        </p>
      </section>

      <section className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-24 h-fit space-y-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">
              <Filter className="h-4 w-4" /> Bộ lọc sản phẩm
            </div>
            
            <div className="space-y-8 text-sm">
              {/* Thương hiệu */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Thương hiệu</p>
                <div className="flex flex-col gap-2.5">
                  {brands.map((brand) => (
                    <Link 
                      key={brand._id} 
                      href={`/products?brandId=${brand._id}`} 
                      className={`transition-colors hover:text-blue-600 ${params.brandId === brand._id ? "text-blue-600 font-bold" : "text-slate-500"}`}
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Danh mục */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Danh mục</p>
                <div className="flex flex-col gap-2.5">
                  {categories.map((cat) => (
                    <Link 
                      key={cat._id} 
                      href={`/products?categoryId=${cat._id}`} 
                      className={`transition-colors hover:text-blue-600 ${params.categoryId === cat._id ? "text-blue-600 font-bold" : "text-slate-500"}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Giới tính */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Giới tính</p>
                <div className="flex flex-col gap-2.5 text-slate-500">
                  <Link href="/products?gender=men" className={params.gender === "men" ? "text-blue-600 font-bold" : ""}>Giày Nam</Link>
                  <Link href="/products?gender=women" className={params.gender === "women" ? "text-blue-600 font-bold" : ""}>Giày Nữ</Link>
                  <Link href="/products?gender=unisex" className={params.gender === "unisex" ? "text-blue-600 font-bold" : ""}>Unisex</Link>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Kích cỡ phổ biến</p>
                <div className="flex flex-wrap gap-2">
                  {[38, 39, 40, 41, 42, 43, 44].map((size) => (
                    <Link 
                      key={size} 
                      href={`/products?size=${size}`} 
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold transition-all hover:border-blue-600 hover:text-blue-600 ${Number(params.size) === size ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "border-slate-200 text-slate-600"}`}
                    >
                      {size}
                    </Link>
                  ))}
                </div>
              </div>

              <Button asChild variant="ghost" className="w-full justify-start px-0 text-red-500 hover:text-red-600 hover:bg-transparent">
                <Link href="/products" className="flex items-center gap-2">
                  <X className="h-4 w-4" /> Xóa toàn bộ lọc
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-sm font-medium text-slate-500">
              Hiển thị <span className="text-slate-900 font-bold">{products.length}</span> sản phẩm
            </span>
            <div className="flex gap-4">
               {/* Could add sorting here later */}
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-slate-50/50 py-24 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                 <Filter className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Không tìm thấy sản phẩm</h3>
              <p className="mt-2 text-slate-500 max-w-xs">
                Chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại của bạn.
              </p>
              <Button asChild className="mt-8 rounded-full px-8">
                <Link href="/products">Quay lại tất cả sản phẩm</Link>
              </Button>
            </div>
          ) : (
            <div className="pt-10 flex justify-center border-t">
               {/* Pagination Component can be added here */}
               <div className="flex items-center gap-2">
                 {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                   <Link 
                     key={p} 
                     href={`/products?page=${p}`}
                     className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-sm ${pagination.page === p ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"}`}
                   >
                     {p}
                   </Link>
                 ))}
               </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
