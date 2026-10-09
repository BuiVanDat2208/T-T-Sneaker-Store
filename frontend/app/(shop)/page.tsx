import { getProducts, getSettings, getBrands } from "@/lib/api";
import { DynamicHomepage } from "@/components/home/dynamic-homepage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let settings: any = {};
  let brands: any[] = [];
  let featured: any[] = [];
  let bestSellers: any[] = [];

  try {
    const [settingsRes, brandsData] = await Promise.all([
      getSettings().catch(err => {
        console.error("Failed to fetch settings:", err);
        return null;
      }),
      getBrands().catch(err => {
        console.error("Failed to fetch brands:", err);
        return null;
      })
    ]);

    settings = settingsRes?.settings || {};
    brands = brandsData?.brands || [];

    const [featuredData, bestSellersData] = await Promise.all([
      getProducts({ featured: "true", limit: "4" }).catch(err => {
        console.error("Failed to fetch featured products:", err);
        return { products: [] };
      }),
      getProducts({ bestSeller: "true", limit: "8" }).catch(err => {
        console.error("Failed to fetch best sellers:", err);
        return { products: [] };
      })
    ]);

    featured = featuredData?.products || [];
    bestSellers = bestSellersData?.products || [];
  } catch (error) {
    console.error("Error loading home page server data:", error);
  }

  const hpContent = settings?.homepage_content || {};

  return (
    <main className="dark:bg-slate-950 min-h-screen">
      <DynamicHomepage 
        homepageContent={hpContent}
        featuredProducts={featured}
        bestSellers={bestSellers}
        brands={brands}
      />
    </main>
  );
}
