"use client";

import { useState, useEffect } from "react";
import { 
  X, Plus, Upload, Image as ImageIcon, Loader2, 
  Settings, Info, Box, Layers, Tag as TagIcon, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getBrands, 
  getCategories, 
  uploadImage,
  createProduct,
  updateProduct 
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Product, Category, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

type Brand = { _id: string; name: string; logo?: string };

interface AdminProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminProductForm({ initialData, onSuccess, onCancel }: AdminProductFormProps) {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"basic" | "specs" | "inventory" | "media">("basic");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: 0,
    originalPrice: 0,
    categoryId: "",
    brandId: "",
    gender: "unisex" as "men" | "women" | "unisex" | "kids",
    style: "low" as "low" | "mid" | "high",
    materials: [] as string[],
    colors: [] as string[],
    variants: [] as Variant[],
    images: [] as string[],
    status: "active" as "active" | "draft" | "archived",
    isFeatured: false,
    isBestSeller: false,
    tags: [] as string[]
  });

  useEffect(() => {
    async function loadData() {
      const [catsRes, brandsRes] = await Promise.all([getCategories(), getBrands()]);
      setCategories(catsRes.categories);
      setBrands(brandsRes.brands);
    }
    loadData();

    if (initialData) {
      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        sku: initialData.sku || "",
        description: initialData.description,
        price: initialData.price,
        originalPrice: initialData.originalPrice || 0,
        categoryId: (initialData.categoryId as any)?._id || initialData.categoryId || "",
        brandId: (initialData.brandId as any)?._id || initialData.brandId || "",
        gender: initialData.gender,
        style: initialData.style,
        materials: initialData.materials || [],
        colors: initialData.colors || [],
        variants: initialData.variants || [],
        images: initialData.images || [],
        status: initialData.status,
        isFeatured: initialData.isFeatured || false,
        isBestSeller: initialData.isBestSeller || false,
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const slugify = (text: string) => {
    let str = text.toLowerCase();
    str = str.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a");
    str = str.replace(/[éèẻẽẹêếềểễệ]/g, "e");
    str = str.replace(/[iíìỉĩị]/g, "i");
    str = str.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o");
    str = str.replace(/[úùủũụưứừửữự]/g, "u");
    str = str.replace(/[ýỳỷỹỵ]/g, "y");
    str = str.replace(/đ/g, "d");
    return str.trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : slugify(name)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !token) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file, token));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
    } catch (err) {
      alert("Lỗi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return;
    
    const newImages = [...formData.images];
    const draggedImage = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setDraggedIndex(null);
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: 40, stock: 0 }]
    }));
  };

  const updateVariant = (index: number, field: keyof Variant, value: number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validation
    if (!formData.categoryId || !formData.brandId) {
      alert("Vui lòng chọn Danh mục và Thương hiệu");
      return;
    }
    if (formData.images.length === 0) {
      alert("Vui lòng thêm ít nhất 1 ảnh");
      setActiveTab("media");
      return;
    }

    setLoading(true);
    try {
      const selectedBrand = brands.find(b => b._id === formData.brandId);
      const payload = {
        ...formData,
        brandName: selectedBrand?.name
      };

      if (initialData) {
        await updateProduct(initialData._id, payload, token);
      } else {
        await createProduct(payload, token);
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Thông tin cơ bản", icon: Info },
    { id: "specs", label: "Phân loại & Đặc tính", icon: Layers },
    { id: "inventory", label: "Kho hàng (Size)", icon: Box },
    { id: "media", label: "Hình ảnh", icon: ImageIcon },
  ] as const;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Tab Navigation */}
      <div className="flex border-b px-6 bg-slate-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tên sản phẩm</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  placeholder="VD: Air Jordan 1 Retro High..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Mã SKU (Tùy chọn)</label>
                <Input 
                  value={formData.sku} 
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                  placeholder="VD: AJ1-CHI-2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Mô tả sản phẩm</label>
              <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Giá bán (VNĐ)</label>
                <Input 
                  type="number" 
                  required 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Giá gốc (Gạch bỏ)</label>
                <Input 
                  type="number" 
                  value={formData.originalPrice} 
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Specs Tab */}
        {activeTab === "specs" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Thương hiệu</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Danh mục</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Đối tượng</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="men">Nam</option>
                  <option value="women">Nữ</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Trẻ em</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Kiểu dáng</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value as any })}
                >
                  <option value="low">Cổ thấp (Low)</option>
                  <option value="mid">Cổ lửng (Mid)</option>
                  <option value="high">Cổ cao (High)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                <TagIcon className="h-3 w-3" /> Từ khóa (Tags) - Phân cách bằng dấu phẩy
              </label>
              <Input 
                value={formData.tags.join(", ")} 
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()) })} 
                placeholder="VD: jordan, retro, limited, 2024"
              />
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Biến thể Size & Tồn kho</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" /> Thêm Size
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Kích cỡ (Size)</th>
                    <th className="px-4 py-2 text-left font-semibold">Số lượng tồn</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.variants.map((variant, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <Input 
                          type="number" 
                          step="0.5"
                          value={variant.size} 
                          onChange={(e) => updateVariant(index, "size", Number(e.target.value))} 
                          className="w-24 h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number" 
                          value={variant.stock} 
                          onChange={(e) => updateVariant(index, "stock", Number(e.target.value))} 
                          className="w-32 h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {formData.variants.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">
                        Chưa có biến thể nào. Hãy bấm "Thêm Size" để quản lý kho.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-700">Tổng tồn kho toàn bộ các size:</span>
              <span className="text-lg font-bold text-blue-900">
                {formData.variants.reduce((sum, v) => sum + v.stock, 0)} sản phẩm
              </span>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "relative aspect-square rounded-lg border bg-slate-50 group overflow-hidden cursor-move transition-all",
                    draggedIndex === index ? "opacity-50 scale-95" : "opacity-100"
                  )}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <img src={url} alt={`Product ${index}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center font-bold">
                      ẢNH ĐẠI DIỆN
                    </div>
                  )}
                </div>
              ))}

              <label className={cn(
                "relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors",
                uploading && "opacity-50 cursor-not-allowed"
              )}>
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium text-center px-2">
                      Thêm ảnh giày...
                    </span>
                  </>
                )}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground italic">
              * Ảnh đầu tiên sẽ được dùng làm ảnh đại diện cho sản phẩm.
            </p>
          </div>
        )}
      </form>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-6 border-t bg-white">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded"
            />
            <span>Sản phẩm nổi bật</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isBestSeller}
              onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
              className="rounded"
            />
            <span>Bán chạy nhất</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>Hủy</Button>
          <Button 
            disabled={loading || uploading} 
            onClick={handleSubmit}
            className="min-w-[120px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {initialData ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
