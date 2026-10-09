export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type Variant = {
  size: number;
  stock: number;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: Category;
  brandId: { _id: string; name: string; logo?: string };
  brandName?: string;
  gender: "men" | "women" | "unisex" | "kids";
  style: "low" | "mid" | "high";
  materials?: string[];
  colors?: string[];
  variants: Variant[];
  totalStock: number;
  images: string[];
  status: "active" | "draft" | "archived";
  isFeatured?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  createdAt: string;
};

export type Review = {
  _id: string;
  rating: number;
  comment: string;
  userId: { name: string };
  createdAt: string;
};

export type Order = {
  _id: string;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    quantity: number;
    size: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: "cod" | "stripe" | "vnpay" | "sepay";
  paymentStatus: "unpaid" | "paid";
  paymentDetails?: any;
  orderCode?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};
export type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "customer";
  address?: string;
  phone?: string;
  isBlocked?: boolean;
};
