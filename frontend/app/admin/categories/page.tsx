"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Box, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryProducts 
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Category, Product } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

function slugify(text: string) {
  let str = text.toLowerCase();
  // Chuyển các ký tự có dấu thành không dấu
  str = str.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a");
  str = str.replace(/[éèẻẽẹêếềểễệ]/g, "e");
  str = str.replace(/[iíìỉĩị]/g, "i");
  str = str.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o");
  str = str.replace(/[úùủũụưứừửữự]/g, "u");
  str = str.replace(/[ýỳỷỹỵ]/g, "y");
  str = str.replace(/đ/g, "d");
  
  return str
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export default function AdminCategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });
  
  // Products view state
  const [viewingProductsId, setViewingProductsId] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  async function fetchData() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewProducts(id: string) {
    if (viewingProductsId === id) {
      setViewingProductsId(null);
      return;
    }
    setViewingProductsId(id);
    setLoadingProducts(true);
    try {
      const data = await getCategoryProducts(id);
      setCategoryProducts(data.products);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoadingProducts(false);
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "" });
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      slug: category.slug, 
      description: (category as any).description || "" 
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData, token);
      } else {
        await createCategory(formData, token);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lưu danh mục thất bại. Vui lòng kiểm tra lại slug (phải là duy nhất).");
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await deleteCategory(id, token);
      fetchData();
    } catch (err) {
      alert("Xóa danh mục thất bại.");
    }
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <p className="text-sm text-muted-foreground">Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Tìm tên danh mục..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải danh mục...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">Không có danh mục nào.</div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">slug: {category.slug}</p>
                    <p className="mt-1 text-sm text-slate-600">{(category as any).description || "Chưa có mô tả."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewProducts(category._id)}>
                    <Box className="mr-2 h-4 w-4" /> 
                    {viewingProductsId === category._id ? "Ẩn sản phẩm" : "Xem sản phẩm"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                    <Edit2 className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(category._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {viewingProductsId === category._id && (
                <div className="border-t bg-slate-50/50 p-6">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    Sản phẩm thuộc danh mục <ChevronRight className="h-4 w-4" />
                  </h4>
                  {loadingProducts ? (
                    <div className="text-center py-4 text-xs text-muted-foreground italic">Đang tải sản phẩm...</div>
                  ) : categoryProducts.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">Chưa có sản phẩm nào trong danh mục này.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {categoryProducts.map((p) => (
                        <div key={p._id} className="bg-white border rounded p-2 text-center">
                          <img src={p.images[0]} alt={p.name} className="h-20 w-full object-cover rounded mb-2" />
                          <p className="text-[10px] font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-blue-600 font-bold">{formatCurrency(p.price)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục</label>
              <Input 
                required 
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ 
                    ...formData, 
                    name, 
                    slug: editingCategory ? formData.slug : slugify(name) 
                  });
                }}
                placeholder="VD: Giày Chạy Bộ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL)</label>
              <Input 
                required 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="vd: giay-chay-bo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về danh mục..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
