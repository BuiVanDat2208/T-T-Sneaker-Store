"use client";

import { useEffect, useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, Package, 
  ChevronRight, Filter, MoreHorizontal, 
  AlertCircle, LayoutGrid, Tag, User, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getAdminProducts, 
  deleteProduct,
  getBrands,
  getCategories
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Product, Category } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { cn } from "@/lib/utils";

const genderLabels = {
  men: "Nam",
  women: "Nữ",
  unisex: "Unisex",
  kids: "Trẻ em"
};

const statusLabels = {
  active: { label: "Đang bán", color: "text-green-600 bg-green-50 border-green-200" },
  draft: { label: "Bản nháp", color: "text-slate-500 bg-slate-50 border-slate-200" },
  archived: { label: "Lưu trữ", color: "text-red-500 bg-red-50 border-red-200" }
};

export default function AdminProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filtering
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    brandId: "",
    categoryId: "",
    gender: "",
    status: ""
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
    loadFilters();
  }, [token, filters]);

  async function loadFilters() {
    const [catsRes, brandsRes] = await Promise.all([getCategories(), getBrands()]);
    setCategories(catsRes.categories);
    setBrands(brandsRes.brands);
  }

  async function fetchData() {
    if (!token) return;
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await getAdminProducts(token, { ...activeFilters, q: search });
      setProducts(res.products);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id, token);
      setProducts(prev => prev.filter(product => product._id !== id));
    } catch (err) {
      alert("Xóa sản phẩm thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-sm text-muted-foreground">Kho hàng hiện có {products.length} sản phẩm.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 border rounded-xl shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Tìm tên sản phẩm, thương hiệu..." 
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
            />
          </div>
          
          <select 
            className="h-10 rounded-md border border-input bg-background pl-3 pr-8 text-sm min-w-[150px]"
            value={filters.brandId}
            onChange={(e) => setFilters({ ...filters, brandId: e.target.value })}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          <select 
            className="h-10 rounded-md border border-input bg-background pl-3 pr-8 text-sm min-w-[150px]"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select 
            className="h-10 rounded-md border border-input bg-background pl-3 pr-8 text-sm"
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          >
            <option value="">Mọi giới tính</option>
            <option value="men">Nam</option>
            <option value="women">Nữ</option>
            <option value="unisex">Unisex</option>
            <option value="kids">Trẻ em</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20">
            <MoreHorizontal className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground italic">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-white space-y-3">
            <Package className="h-12 w-12 mx-auto text-slate-200" />
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
            <Button variant="outline" onClick={() => {
              setSearch("");
              setFilters({ brandId: "", categoryId: "", gender: "", status: "" });
            }}>Xóa bộ lọc</Button>
          </div>
        ) : (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                  <th className="px-4 py-3 text-left font-semibold">Phân loại</th>
                  <th className="px-4 py-3 text-left font-semibold">Giá bán</th>
                  <th className="px-4 py-3 text-left font-semibold">Tồn kho</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg border bg-slate-50 overflow-hidden flex-shrink-0">
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-[250px]">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{product.sku || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                          <Tag className="h-3 w-3" /> {product.brandId?.name || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Layers className="h-3 w-3" /> {product.categoryId?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-blue-600">{formatCurrency(product.price)}</p>
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <p className="text-[10px] text-slate-400 line-through">{formatCurrency(product.originalPrice)}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold",
                          product.totalStock <= 5 ? "text-red-500" : "text-slate-700"
                        )}>
                          {product.totalStock} <span className="text-[10px] font-normal text-slate-400">cái</span>
                        </span>
                        <div className="flex gap-1 mt-1">
                          {product.variants?.slice(0, 3).map(v => (
                            <span key={v.size} className="text-[9px] bg-slate-100 px-1 rounded text-slate-500">
                              S:{v.size}
                            </span>
                          ))}
                          {product.variants?.length > 3 && <span className="text-[9px] text-slate-400">...</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                        statusLabels[product.status || "active"].color
                      )}>
                        {statusLabels[product.status || "active"].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                          <Edit2 className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product._id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden h-[90vh]">
          <DialogHeader className="p-6 pb-2 border-b bg-white">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
          </DialogHeader>
          
          <AdminProductForm 
            initialData={editingProduct} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchData();
            }} 
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
