"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Box, ChevronRight, LayoutGrid, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getBrands, 
  createBrand, 
  updateBrand, 
  deleteBrand,
  getBrandProducts,
  uploadImage 
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/lib/types";
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

export default function AdminBrandsPage() {
  const { token } = useAuthStore();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", logo: "" });
  const [isUploading, setIsUploading] = useState(false);
  
  // Products view state
  const [viewingProductsId, setViewingProductsId] = useState<string | null>(null);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  async function fetchData() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data.brands);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file, token);
      setFormData({ ...formData, logo: res.url });
    } catch (err) {
      alert("Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
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
      const data = await getBrandProducts(id);
      setBrandProducts(data.products);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoadingProducts(false);
    }
  }

  function openCreateModal() {
    setEditingBrand(null);
    setFormData({ name: "", slug: "", description: "", logo: "" });
    setIsModalOpen(true);
  }

  function openEditModal(brand: any) {
    setEditingBrand(brand);
    setFormData({ 
      name: brand.name, 
      slug: brand.slug, 
      description: brand.description || "",
      logo: brand.logo || ""
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingBrand) {
        await updateBrand(editingBrand._id, formData, token);
      } else {
        await createBrand(formData, token);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lưu thương hiệu thất bại. Vui lòng kiểm tra lại.");
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
    try {
      await deleteBrand(id, token);
      fetchData();
    } catch (err) {
      alert("Xóa thương hiệu thất bại.");
    }
  }

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý thương hiệu</h1>
          <p className="text-sm text-muted-foreground">Quản lý các thương hiệu giày trong hệ thống.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Thêm thương hiệu
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Tìm tên thương hiệu..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải thương hiệu...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-white">Không có thương hiệu nào.</div>
        ) : (
          filteredBrands.map((brand) => (
            <div key={brand._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">slug: {brand.slug}</p>
                    <p className="mt-1 text-sm text-slate-600">{brand.description || "Chưa có mô tả."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewProducts(brand._id)}>
                    <Box className="mr-2 h-4 w-4" /> 
                    {viewingProductsId === brand._id ? "Ẩn sản phẩm" : "Xem sản phẩm"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(brand)}>
                    <Edit2 className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(brand._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {viewingProductsId === brand._id && (
                <div className="border-t bg-slate-50/50 p-6">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    Sản phẩm thuộc thương hiệu <ChevronRight className="h-4 w-4" />
                  </h4>
                  {loadingProducts ? (
                    <div className="text-center py-4 text-xs text-muted-foreground italic">Đang tải sản phẩm...</div>
                  ) : brandProducts.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">Chưa có sản phẩm nào của thương hiệu này.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {brandProducts.map((p) => (
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo thương hiệu</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 rounded-md border border-dashed p-3 hover:bg-slate-50 transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">Tải logo lên...</span>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên thương hiệu</label>
              <Input 
                required 
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ 
                    ...formData, 
                    name, 
                    slug: editingBrand ? formData.slug : slugify(name) 
                  });
                }}
                placeholder="VD: Nike"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL)</label>
              <Input 
                required 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="vd: nike"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về thương hiệu..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isUploading}>Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
