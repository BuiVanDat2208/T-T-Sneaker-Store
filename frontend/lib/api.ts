import type { Category, Order, Product, Review, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api";

const demoCategory: Category = { _id: "demo-running", name: "Running", slug: "running" };
const demoProducts: Product[] = [
  {
    _id: "demo-pegasus",
    name: "Nike Air Zoom Pegasus 41",
    slug: "nike-air-zoom-pegasus-41",
    description: "Giày chạy bộ nhẹ, đệm phản hồi tốt cho luyện tập hằng ngày.",
    price: 3290000,
    originalPrice: 3890000,
    brandId: { _id: "nike", name: "Nike" },
    brandName: "Nike",
    gender: "unisex",
    style: "low",
    variants: [{ size: 40, stock: 20 }, { size: 41, stock: 22 }],
    totalStock: 42,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"],
    categoryId: demoCategory,
    status: "active",
    isFeatured: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "demo-ultraboost",
    name: "Adidas Ultraboost Light",
    slug: "adidas-ultraboost-light",
    description: "Đế Boost êm, upper Primeknit thoáng khí, phù hợp đi bộ và chạy nhẹ.",
    price: 4190000,
    originalPrice: 4990000,
    brandId: { _id: "adidas", name: "Adidas" },
    brandName: "Adidas",
    gender: "unisex",
    style: "low",
    variants: [{ size: 40, stock: 14 }, { size: 41, stock: 14 }],
    totalStock: 28,
    images: ["https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&w=1200&q=80"],
    categoryId: demoCategory,
    status: "active",
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "demo-9060",
    name: "New Balance 9060 Sea Salt",
    slug: "new-balance-9060-sea-salt",
    description: "Thiết kế lifestyle chunky, phối màu sáng dễ mặc, đệm ABZORB ổn định.",
    price: 3790000,
    originalPrice: 4290000,
    brandId: { _id: "nb", name: "New Balance" },
    brandName: "New Balance",
    gender: "unisex",
    style: "low",
    variants: [{ size: 40, stock: 9 }, { size: 41, stock: 9 }],
    totalStock: 18,
    images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80"],
    categoryId: demoCategory,
    status: "active",
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "demo-puma",
    name: "Puma Velocity Nitro 3",
    slug: "puma-velocity-nitro-3",
    description: "Mẫu training đa dụng, bám đường tốt, trọng lượng cân bằng.",
    price: 2690000,
    originalPrice: 3190000,
    brandId: { _id: "puma", name: "Puma" },
    brandName: "Puma",
    gender: "unisex",
    style: "low",
    variants: [{ size: 40, stock: 12 }, { size: 41, stock: 13 }],
    totalStock: 25,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"],
    categoryId: demoCategory,
    status: "active",
    createdAt: new Date().toISOString()
  }
];

type ProductParams = {
  q?: string;
  brand?: string;
  brandId?: string;
  categoryId?: string;
  gender?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  featured?: string;
  bestSeller?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  const fetchOptions: RequestInit = {
    ...init,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  };

  // Next.js 15+ fetch cache configuration
  if (init?.cache === "no-store") {
    (fetchOptions as any).next = { revalidate: 0 };
  } else if (!init?.next) {
    (fetchOptions as any).next = { revalidate: 60 };
  }

  try {
    const response = await fetch(`${API_URL}${path}`, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        import("@/store/auth-store").then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        }).catch(err => console.error("Failed to load auth-store dynamically:", err));
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export function buildQuery(params: ProductParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return query.toString();
}

export async function getProducts(params: ProductParams = {}) {
  const query = buildQuery(params);
  const fallback = () => {
    const products = demoProducts.filter((product) => {
      if (params.featured === "true" && !product.isFeatured) return false;
      if (params.bestSeller === "true" && !product.isBestSeller) return false;
      if (params.brandId && product.brandId?._id !== params.brandId) return false;
      if (params.categoryId && product.categoryId?._id !== params.categoryId) return false;
      if (params.gender && product.gender !== params.gender) return false;
      if (params.size && !product.variants?.some(v => v.size === Number(params.size))) return false;
      return true;
    });

    return {
      products,
      pagination: { page: 1, pages: 1, total: products.length }
    };
  };

  try {
    const data = await request<{ products: Product[]; pagination: { page: number; pages: number; total: number } }>(
      `/products${query ? `?${query}` : ""}`
    );
    return data.products.length ? data : fallback();
  } catch {
    return fallback();
  }
}

export async function getProduct(slug: string) {
  try {
    return await request<{ product: Product; reviews: Review[] }>(`/products/${slug}`);
  } catch {
    const product = demoProducts.find((item) => item.slug === slug);
    if (!product) throw new Error("Product not found");
    return { product, reviews: [] };
  }
}

export async function getCategories() {
  try {
    return await request<{ categories: Category[] }>("/categories");
  } catch {
    return { categories: [demoCategory] };
  }
}

export async function createOrder(payload: unknown, token: string) {
  return request<{ order: Order; checkoutUrl?: string }>("/orders", {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}
export async function login(payload: unknown) {
  return request<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload)
  });
}

export async function register(payload: unknown) {
  return request<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload)
  });
}

export async function getOrders(token: string) {
  return request<{ orders: Order[] }>("/orders", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getOrder(id: string, token: string) {
  return request<{ order: Order }>(`/orders/${id}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function cancelOrder(id: string, token: string) {
  return request<{ order: Order }>(`/orders/${id}/status`, {
    method: "PATCH",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: "cancelled" })
  });
}

export async function updateOrderStatus(id: string, status: string, token: string) {
  return request<{ order: Order }>(`/orders/${id}/status`, {
    method: "PATCH",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
}

export async function getAdminStats(token: string) {
  return request<{ stats: any; chartData: any[] }>("/admin/stats", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function logActivity(payload: any) {
  return request("/analytics/log", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload)
  });
}

export async function getUsers(token: string) {
  return request<{ users: User[] }>("/users", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function updateUser(id: string, payload: Partial<User>, token: string) {
  return request<{ user: User }>(`/users/${id}`, {
    method: "PUT",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function deleteUser(id: string, token: string) {
  return request<{ success: boolean; message: string }>(`/users/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createCategory(payload: unknown, token: string) {
  return request<{ category: Category }>("/categories", {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function updateCategory(id: string, payload: unknown, token: string) {
  return request<{ category: Category }>(`/categories/${id}`, {
    method: "PUT",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function deleteCategory(id: string, token: string) {
  return request<void>(`/categories/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getCategoryProducts(id: string) {
  return request<{ products: Product[] }>(`/categories/${id}/products`, {
    cache: "no-store"
  });
}

export async function getBrands() {
  try {
    return await request<{ brands: any[] }>("/brands", {
      cache: "no-store"
    });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return { brands: [] };
  }
}

export async function createBrand(payload: unknown, token: string) {
  return request<{ brand: any }>("/brands", {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function updateBrand(id: string, payload: unknown, token: string) {
  return request<{ brand: any }>(`/brands/${id}`, {
    method: "PUT",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function deleteBrand(id: string, token: string) {
  return request<void>(`/brands/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getBrandProducts(id: string) {
  return request<{ products: Product[] }>(`/brands/${id}/products`, {
    cache: "no-store"
  });
}

export async function uploadImage(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Upload failed details:", response.status, errorData);
    throw new Error(errorData.message || "Upload failed");
  }

  return response.json() as Promise<{ url: string }>;
}

export async function getAdminProducts(token: string, params: any = {}) {
  const query = new URLSearchParams(params).toString();
  return request<{ products: Product[]; pagination: any }>(`/products?${query}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createProduct(payload: any, token: string) {
  return request<{ product: Product }>("/products", {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function updateProduct(id: string, payload: any, token: string) {
  return request<{ product: Product }>(`/products/${id}`, {
    method: "PUT",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function deleteProduct(id: string, token: string) {
  return request<void>(`/products/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getSettings() {
  try {
    return await request<{ settings: any }>("/settings", { cache: "no-store" });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return { settings: {} };
  }
}

export async function updateSettings(settings: any, token: string) {
  return request<{ message: string }>("/settings/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ settings })
  });
}

export async function getAiSettings(token: string) {
  return request<any>("/admin/settings/ai", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function updateAiSettings(value: any, token: string) {
  return request<any>("/admin/settings/ai", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ value })
  });
}

export { request };
