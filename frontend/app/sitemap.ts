import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const staticRoutes = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/products`, lastModified: new Date() }
  ];

  try {
    // 6-second timeout to prevent Render build worker hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api"}/products?limit=100`;
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      next: { revalidate: 60 }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const products = data.products || [];
      const productRoutes = products.map((product: any) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: new Date()
      }));

      return [...staticRoutes, ...productRoutes];
    }
  } catch (error) {
    console.warn("Failed to fetch products for sitemap, returning static routes only:", error);
  }

  return staticRoutes;
}
