"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Plus, Trash2, Loader2, Image as ImageIcon, Video, Layout, Package, Star, Grid, Globe, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { getSettings, updateSettings, uploadImage } from "@/lib/api";
import { cn } from "@/lib/utils";

// Giá trị mặc định ban đầu cho cả 2 ngôn ngữ
const DEFAULT_LOCALE_CONTENT = {
  slider: {
    show: true,
    items: [
      { id: 1, title: "Sản phẩm mới nhất", subtitle: "Khám phá bộ sưu tập giày sneaker 2024", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop", link: "/products" },
      { id: 2, title: "Phong cách đường phố", subtitle: "Tự tin thể hiện cá tính riêng", imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop", link: "/products" }
    ]
  },
  brand_section: { show: true, title: "Mua sắm theo thương hiệu" },
  hero_section: { 
    show: true,
    title: "Bộ sưu tập giày thể thao T&T", 
    subtitle: "Chúng tôi mang đến cho bạn những đôi giày chất lượng nhất từ các thương hiệu hàng đầu thế giới.", 
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80", 
    link: "/products" 
  },
  new_products: { show: true, title: "Sản phẩm mới về", desc: "Cập nhật những mẫu giày hot nhất thị trường" },
  hot_products: { show: true, title: "Sản phẩm bán chạy", desc: "Những lựa chọn hàng đầu của cộng đồng Sneaker" },
  banners: {
    show: true,
    items: [
      { id: "running", title: "Giày Chạy Bộ", subtitle: "Tối ưu hiệu năng chạy bộ", imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", link: "/products?category=running" },
      { id: "collection", title: "Bộ Sưu Tập Mới", subtitle: "Đẳng cấp và khác biệt", imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80", link: "/products?featured=true" },
      { id: "street", title: "Phong Cách Đường Phố", subtitle: "Phong cách năng động", imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80", link: "/products?bestSeller=true" }
    ]
  },
  video_section: { 
    show: true,
    title: "Sống trọn đam mê cùng Sneaker", 
    videoUrl: "https://cdn.pixabay.com/video/2020/07/30/45894-445655382_large.mp4", 
    posterUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1920&q=80" 
  },
  gallery_section: { 
    show: true, 
    title: "Cộng đồng T&T", 
    desc: "Những khoảnh khắc tuyệt vời cùng đôi giày yêu thích",
    items: [
      { src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", href: "/products" },
      { src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80", href: "/products" },
      { src: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=600&q=80", href: "/products" },
      { src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", href: "/products" },
      { src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80", href: "/products" },
    ]
  }
};

const DEFAULT_CONTENT = {
  vi: { ...DEFAULT_LOCALE_CONTENT },
  en: { 
    ...DEFAULT_LOCALE_CONTENT,
    slider: {
      show: true,
      items: [
        { id: 1, title: "Latest Products", subtitle: "Explore the 2024 sneaker collection", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop", link: "/products" },
        { id: 2, title: "Street Style", subtitle: "Confident in your own style", imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop", link: "/products" }
      ]
    },
    brand_section: { show: true, title: "Shop by Brand" },
    hero_section: { 
      show: true,
      title: "T&T Sneaker Collection", 
      subtitle: "We bring you the highest quality shoes from the world's leading brands.", 
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80", 
      link: "/products" 
    },
    new_products: { show: true, title: "New Arrivals", desc: "Update the hottest sneaker models on the market" },
    hot_products: { show: true, title: "Best Sellers", desc: "Top choices for the Sneaker community" },
    banners: {
      show: true,
      items: [
        { id: "running", title: "Running Shoes", subtitle: "Optimize running performance", imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", link: "/products?category=running" },
        { id: "collection", title: "New Collection", subtitle: "Classy and different", imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80", link: "/products?featured=true" },
        { id: "street", title: "Street Style", subtitle: "Dynamic style", imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80", link: "/products?bestSeller=true" }
      ]
    },
    video_section: { 
      show: true,
      title: "Live your passion with Sneakers", 
      videoUrl: "https://cdn.pixabay.com/video/2020/07/30/45894-445655382_large.mp4", 
      posterUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1920&q=80" 
    },
    gallery_section: { 
      show: true, 
      title: "T&T Community", 
      desc: "Great moments with your favorite shoes",
      items: [
        { src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", href: "/products" },
        { src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80", href: "/products" },
        { src: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=600&q=80", href: "/products" },
        { src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", href: "/products" },
        { src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80", href: "/products" },
      ]
    }
  }
};

function SectionHeader({ icon: Icon, title, subtitle, show, onToggle, colorClass }: { icon: any, title: string, subtitle: string, show: boolean, onToggle: (val: boolean) => void, colorClass: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-5">
      <div className="flex items-center gap-4">
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            {title}
            {!show && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Đang ẩn</span>}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border">
        <Label className="text-[10px] font-black uppercase text-slate-500">{!!show ? "Hiển thị" : "Ẩn"}</Label>
        <Switch checked={!!show} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}

export default function HomepageEditor() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<"vi" | "en">("vi");
  const [fullContent, setFullContent] = useState<any>(DEFAULT_CONTENT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lấy content của ngôn ngữ đang chọn
  const content = fullContent[activeLang] || DEFAULT_LOCALE_CONTENT;

  useEffect(() => {
    async function loadContent() {
      try {
        const { settings } = await getSettings();
        if (settings?.homepage_content) {
          const raw = settings.homepage_content;
          const locales = ["vi", "en"];
          const newContent: any = {};
          
          locales.forEach(lang => {
            const dbLangData = raw[lang] || {};
            const defaultLangData = DEFAULT_CONTENT[lang as keyof typeof DEFAULT_CONTENT];
            
            // Bắt đầu bằng dữ liệu mặc định để đảm bảo không bị thiếu field
            const migrated = JSON.parse(JSON.stringify(defaultLangData));
            
            // Ghi đè bằng dữ liệu từ DB nếu có
            Object.keys(dbLangData).forEach(key => {
              const dbSection = dbLangData[key];
              if (!dbSection) return;

              if (key === "slider" || key === "banners") {
                // Xử lý đặc biệt cho slider/banners vì có thể là array cũ
                if (Array.isArray(dbSection)) {
                  migrated[key] = { 
                    show: true, 
                    items: dbSection.length > 0 ? dbSection : migrated[key].items 
                  };
                } else {
                  migrated[key] = {
                    show: dbSection.show !== undefined ? dbSection.show : true,
                    items: dbSection.items?.length > 0 ? dbSection.items : migrated[key].items
                  };
                }
              } else {
                // Các section khác
                migrated[key] = {
                  ...migrated[key],
                  ...dbSection,
                  show: dbSection.show !== undefined ? dbSection.show : true
                };
              }
            });
            
            newContent[lang] = migrated;
          });
          
          setFullContent(newContent);
        }
      } catch (error) {
        console.error("Failed to load homepage content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ homepage_content: fullContent }, token!);
      alert("Đã lưu nội dung trang chủ thành công cho cả 2 ngôn ngữ!");
    } catch (error) {
      console.error("Failed to save homepage content:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateLangContent = (newLangContent: any) => {
    setFullContent({
      ...fullContent,
      [activeLang]: newLangContent
    });
  };

  const handleUpload = async (file: File, callback: (url: string) => void) => {
    try {
      const res = await uploadImage(file, token!);
      callback(res.url);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const copyFromOtherLang = () => {
    const otherLang = activeLang === "vi" ? "en" : "vi";
    if (confirm(`Sao chép toàn bộ nội dung từ ${otherLang.toUpperCase()} sang ${activeLang.toUpperCase()}?`)) {
       updateLangContent(fullContent[otherLang]);
    }
  };

  if (!mounted || loading) return (
    <div className="flex h-[600px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header & Save Bar */}
      <div className="flex items-center justify-between sticky top-16 bg-slate-50/90 backdrop-blur-md z-30 py-6 border-b mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trang chủ Đa ngôn ngữ</h1>
          <p className="text-slate-500 font-medium">Chỉnh sửa nội dung & Ẩn/Hiện các khu vực.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={copyFromOtherLang} className="h-12 px-4 rounded-2xl border-2">
             <Copy className="h-4 w-4 mr-2" /> Sao chép
           </Button>
           <Button onClick={handleSave} disabled={saving} className="h-12 px-10 rounded-2xl shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit border border-slate-200">
         <button 
           onClick={() => setActiveLang("vi")}
           className={cn(
             "px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
             activeLang === "vi" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
           )}
         >
           <Globe className="h-4 w-4" /> Tiếng Việt
         </button>
         <button 
           onClick={() => setActiveLang("en")}
           className={cn(
             "px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
             activeLang === "en" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
           )}
         >
           <Globe className="h-4 w-4" /> English
         </button>
      </div>

      <div className="grid gap-12">
        {/* 1. Slider Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.slider?.show && "opacity-60 grayscale-[0.5]")}>
          <SectionHeader 
            icon={ImageIcon} 
            title={`Slider nổi bật (${activeLang.toUpperCase()})`} 
            subtitle="Đầu trang chủ" 
            show={content.slider?.show}
            onToggle={(val) => updateLangContent({ ...content, slider: { ...content.slider, show: val } })}
            colorClass="bg-blue-50 text-blue-600"
          />
          <div className="grid gap-6">
            {content.slider?.items?.map((slide: any, idx: number) => (
              <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-md">
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute top-4 right-4 h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm"
                  onClick={() => {
                    const newItems = [...content.slider.items];
                    newItems.splice(idx, 1);
                    updateLangContent({ ...content, slider: { ...content.slider, items: newItems } });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid md:grid-cols-[240px_1fr] gap-8">
                  <div className="space-y-4">
                     <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden relative border-2 border-white shadow-sm">
                       {slide.imageUrl ? (
                         <img src={slide.imageUrl} className="h-full w-full object-cover" alt="" />
                       ) : (
                         <div className="flex items-center justify-center h-full text-slate-400 italic text-[10px] font-bold">CHƯA CÓ ẢNH</div>
                       )}
                       <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-[2px]">
                          <Upload className="h-6 w-6 text-white" />
                          <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], (url) => {
                            const newItems = [...content.slider.items];
                            newItems[idx].imageUrl = url;
                            updateLangContent({ ...content, slider: { ...content.slider, items: newItems } });
                          })} />
                       </label>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề slide</Label>
                       <Input value={slide.title} onChange={e => {
                         const newItems = [...content.slider.items];
                         newItems[idx].title = e.target.value;
                         updateLangContent({ ...content, slider: { ...content.slider, items: newItems } });
                       }} className="rounded-xl h-11" />
                     </div>
                     <div className="space-y-1.5">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả ngắn</Label>
                       <Input value={slide.subtitle} onChange={e => {
                         const newItems = [...content.slider.items];
                         newItems[idx].subtitle = e.target.value;
                         updateLangContent({ ...content, slider: { ...content.slider, items: newItems } });
                       }} className="rounded-xl h-11" />
                     </div>
                     <div className="space-y-1.5">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đường dẫn liên kết</Label>
                       <Input value={slide.link} onChange={e => {
                         const newItems = [...content.slider.items];
                         newItems[idx].link = e.target.value;
                         updateLangContent({ ...content, slider: { ...content.slider, items: newItems } });
                       }} className="rounded-xl h-11" />
                     </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="h-14 border-dashed rounded-2xl border-2 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50" onClick={() => updateLangContent({ ...content, slider: { ...content.slider, items: [...(content.slider?.items || []), { title: "", subtitle: "", imageUrl: "", link: "" }] } })}>
              <Plus className="h-5 w-5 mr-2" /> Thêm Slide mới
            </Button>
          </div>
        </section>

        {/* 2. Brand Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.brand_section?.show && "opacity-60 grayscale-[0.5]")}>
          <SectionHeader 
            icon={Star} 
            title={`Khu vực Thương hiệu (${activeLang.toUpperCase()})`} 
            subtitle="Tiêu đề mục" 
            show={content.brand_section?.show}
            onToggle={(val) => updateLangContent({ ...content, brand_section: { ...content.brand_section, show: val } })}
            colorClass="bg-amber-50 text-amber-600"
          />
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề hiển thị</Label>
            <Input value={content.brand_section?.title} onChange={e => updateLangContent({ ...content, brand_section: { ...content.brand_section, title: e.target.value } })} className="rounded-xl h-12" />
          </div>
        </section>

        {/* 3. Hero Section (Image with Text) */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.hero_section?.show && "opacity-60 grayscale-[0.5]")}>
          <SectionHeader 
            icon={Layout} 
            title="Phần Giới thiệu (Hero)" 
            subtitle="Thông tin tiêu biểu" 
            show={content.hero_section?.show}
            onToggle={(val) => updateLangContent({ ...content, hero_section: { ...content.hero_section, show: val } })}
            colorClass="bg-purple-50 text-purple-600"
          />
          <div className="grid md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <div className="aspect-[4/3] bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-white shadow-lg relative">
                   {content.hero_section?.imageUrl && <img src={content.hero_section.imageUrl} className="h-full w-full object-cover" alt="" />}
                   <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white font-black text-xs uppercase tracking-widest backdrop-blur-sm">
                      <Upload className="h-8 w-8" />
                      <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], (url) => updateLangContent({ ...content, hero_section: { ...content.hero_section, imageUrl: url } }))} />
                   </label>
                </div>
             </div>
             <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề ({activeLang.toUpperCase()})</Label>
                  <Input value={content.hero_section?.title} onChange={e => updateLangContent({ ...content, hero_section: { ...content.hero_section, title: e.target.value } })} className="rounded-xl h-12 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả ({activeLang.toUpperCase()})</Label>
                  <textarea 
                    className="w-full h-32 rounded-2xl border-2 border-slate-100 p-4 text-sm focus:border-blue-500 outline-none transition-all"
                    value={content.hero_section?.subtitle} 
                    onChange={e => updateLangContent({ ...content, hero_section: { ...content.hero_section, subtitle: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link nút bấm</Label>
                  <Input value={content.hero_section?.link} onChange={e => updateLangContent({ ...content, hero_section: { ...content.hero_section, link: e.target.value } })} className="rounded-xl h-12" />
                </div>
             </div>
          </div>
        </section>

        {/* 4. New Product Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.new_products?.show && "opacity-60 grayscale-[0.5]")}>
           <SectionHeader 
            icon={Package} 
            title={`Sản phẩm mới (${activeLang.toUpperCase()})`} 
            subtitle="Khu vực hàng mới về" 
            show={content.new_products?.show}
            onToggle={(val) => updateLangContent({ ...content, new_products: { ...content.new_products, show: val } })}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề</Label>
                <Input value={content.new_products?.title} onChange={e => updateLangContent({ ...content, new_products: { ...content.new_products, title: e.target.value } })} className="rounded-xl h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả</Label>
                <Input value={content.new_products?.desc} onChange={e => updateLangContent({ ...content, new_products: { ...content.new_products, desc: e.target.value } })} className="rounded-xl h-12" />
              </div>
          </div>
        </section>

        {/* 5. Banner Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.banners?.show && "opacity-60 grayscale-[0.5]")}>
          <SectionHeader 
            icon={Grid} 
            title={`Lưới Banner (${activeLang.toUpperCase()})`} 
            subtitle="3 khu vực giữa trang" 
            show={content.banners?.show}
            onToggle={(val) => updateLangContent({ ...content, banners: { ...content.banners, show: val } })}
            colorClass="bg-orange-50 text-orange-600"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4 transition-all hover:bg-white hover:shadow-md">
                 <div className="aspect-[4/3] bg-slate-200 rounded-2xl overflow-hidden relative border-2 border-white">
                    {content.banners?.items?.[i]?.imageUrl && <img src={content.banners.items[i].imageUrl} className="h-full w-full object-cover" alt="" />}
                    <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], (url) => {
                        const newItems = [...(content.banners.items || [{}, {}, {}])];
                        newItems[i] = { ...newItems[i], imageUrl: url };
                        updateLangContent({ ...content, banners: { ...content.banners, items: newItems } });
                      })} />
                    </label>
                 </div>
                 <div className="space-y-3">
                   <Input placeholder="Tiêu đề" value={content.banners?.items?.[i]?.title || ""} onChange={e => {
                     const newItems = [...(content.banners.items || [{}, {}, {}])];
                     newItems[i] = { ...newItems[i], title: e.target.value };
                     updateLangContent({ ...content, banners: { ...content.banners, items: newItems } });
                   }} className="h-11 rounded-xl bg-white" />
                   <Input placeholder="Mô tả" value={content.banners?.items?.[i]?.subtitle || ""} onChange={e => {
                     const newItems = [...(content.banners.items || [{}, {}, {}])];
                     newItems[i] = { ...newItems[i], subtitle: e.target.value };
                     updateLangContent({ ...content, banners: { ...content.banners, items: newItems } });
                   }} className="h-11 rounded-xl bg-white text-xs" />
                   <Input placeholder="Link" value={content.banners?.items?.[i]?.link || ""} onChange={e => {
                     const newItems = [...(content.banners.items || [{}, {}, {}])];
                     newItems[i] = { ...newItems[i], link: e.target.value };
                     updateLangContent({ ...content, banners: { ...content.banners, items: newItems } });
                   }} className="h-11 rounded-xl bg-white text-xs" />
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Video Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.video_section?.show && "opacity-60 grayscale-[0.5]")}>
          <SectionHeader 
            icon={Video} 
            title="Video thương hiệu" 
            subtitle="Nền video" 
            show={content.video_section?.show}
            onToggle={(val) => updateLangContent({ ...content, video_section: { ...content.video_section, show: val } })}
            colorClass="bg-red-50 text-red-600"
          />
          <div className="space-y-6">
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Video (MP4)</Label>
                  <Input value={content.video_section?.videoUrl} onChange={e => updateLangContent({ ...content, video_section: { ...content.video_section, videoUrl: e.target.value } })} placeholder="https://..." className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ảnh nền (Poster)</Label>
                  <Input value={content.video_section?.posterUrl} onChange={e => updateLangContent({ ...content, video_section: { ...content.video_section, posterUrl: e.target.value } })} placeholder="https://..." className="rounded-xl h-12" />
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề trên Video ({activeLang.toUpperCase()})</Label>
                <Input value={content.video_section?.title} onChange={e => updateLangContent({ ...content, video_section: { ...content.video_section, title: e.target.value } })} className="rounded-xl h-12 font-bold" />
             </div>
          </div>
        </section>

        {/* 7. Hot Product Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.hot_products?.show && "opacity-60 grayscale-[0.5]")}>
           <SectionHeader 
            icon={Package} 
            title={`Sản phẩm bán chạy (${activeLang.toUpperCase()})`} 
            subtitle="Khu vực hot nhất" 
            show={content.hot_products?.show}
            onToggle={(val) => updateLangContent({ ...content, hot_products: { ...content.hot_products, show: val } })}
            colorClass="bg-orange-50 text-orange-600"
          />
          <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề</Label>
                <Input value={content.hot_products?.title} onChange={e => updateLangContent({ ...content, hot_products: { ...content.hot_products, title: e.target.value } })} className="rounded-xl h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả</Label>
                <Input value={content.hot_products?.desc} onChange={e => updateLangContent({ ...content, hot_products: { ...content.hot_products, desc: e.target.value } })} className="rounded-xl h-12" />
              </div>
          </div>
        </section>

        {/* 8. Gallery Section */}
        <section className={cn("bg-white rounded-[2rem] border p-8 space-y-6 shadow-sm transition-all", !content.gallery_section?.show && "opacity-60 grayscale-[0.5]")}>
          <SectionHeader 
            icon={Grid} 
            title={`Bộ sưu tập (${activeLang.toUpperCase()})`} 
            subtitle="Cuối trang" 
            show={content.gallery_section?.show}
            onToggle={(val) => updateLangContent({ ...content, gallery_section: { ...content.gallery_section, show: val } })}
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề</Label>
              <Input value={content.gallery_section?.title} onChange={e => updateLangContent({ ...content, gallery_section: { ...content.gallery_section, title: e.target.value } })} className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả</Label>
              <Input value={content.gallery_section?.desc} onChange={e => updateLangContent({ ...content, gallery_section: { ...content.gallery_section, desc: e.target.value } })} className="rounded-xl h-12" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
            {Array.isArray(content.gallery_section?.items) && content.gallery_section.items.map((img: any, idx: number) => (
              <div key={idx} className="relative group aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden transition-all hover:border-blue-200 hover:shadow-md">
                 {img.src ? (
                   <img src={img.src} className="h-full w-full object-cover" alt="" />
                 ) : (
                   <div className="flex items-center justify-center h-full text-slate-400 text-[10px] font-bold">CHƯA CÓ ẢNH</div>
                 )}
                 
                 <div className={cn("absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-2 transition-opacity", !img.src ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                    <label className="p-2 bg-white rounded-xl text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors shadow-lg">
                       <Upload className="h-4 w-4" />
                       <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], (url) => {
                         const newItems = [...content.gallery_section.items];
                         newItems[idx].src = url;
                         updateLangContent({ ...content, gallery_section: { ...content.gallery_section, items: newItems } });
                       })} />
                    </label>
                    <Input 
                      placeholder="Link" 
                      value={img.href || ""} 
                      onChange={e => {
                        const newItems = [...content.gallery_section.items];
                        newItems[idx].href = e.target.value;
                        updateLangContent({ ...content, gallery_section: { ...content.gallery_section, items: newItems } });
                      }}
                      className="h-8 text-[10px] bg-white rounded-lg border-none"
                    />
                    <Button 
                      variant="destructive" size="icon" className="h-8 w-8 rounded-xl shadow-lg"
                      onClick={() => {
                        const newItems = [...content.gallery_section.items];
                        newItems.splice(idx, 1);
                        updateLangContent({ ...content, gallery_section: { ...content.gallery_section, items: newItems } });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                 </div>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 border-dashed rounded-2xl border-2 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 flex items-center justify-center gap-2 mt-4"
            onClick={() => {
              const currentItems = Array.isArray(content.gallery_section?.items) ? content.gallery_section.items : [];
              const newItems = [...currentItems, { src: "", href: "/products" }];
              updateLangContent({ ...content, gallery_section: { ...content.gallery_section, items: newItems } });
            }}
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-semibold">Thêm ảnh mới</span>
          </Button>
        </section>
      </div>
    </div>
  );
}
