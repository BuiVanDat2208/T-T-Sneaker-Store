"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CreditCard, Truck, MapPin, CheckCircle2, 
  ChevronRight, ShoppingBag, ShieldCheck, 
  Info, Wallet, Landmark, Loader2, Search
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { createOrder, getSettings } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/providers/analytics-provider";

const checkoutSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã/Thị trấn"),
  addressDetail: z.string().min(5, "Vui lòng nhập số nhà, tên đường"),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["cod", "stripe", "vnpay", "sepay"]),
  note: z.string().optional()
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface Province {
  name: string;
  code: string;
}

interface Ward {
  name: string;
  code: string;
}

function CheckoutContent() {
  const { trackEvent } = useAnalytics();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, clear } = useCartStore();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const message = searchParams.get("message");
  const loginRequired = message === "login_required";
  
  // Administrative Data State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [wardSearch, setWardSearch] = useState("");
  
  // Settings from API
  const [settings, setSettings] = useState<any>({
    standard_fee: 30000,
    express_fee: 55000,
    free_shipping_threshold: 1000000,
    enable_cod: true,
    enable_stripe: true,
    enable_vnpay: true
  });

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const [shippingFee, setShippingFee] = useState(30000);
  const total = subtotal + shippingFee;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
      name: (user as any)?.name || "", 
      phone: (user as any)?.phone || "", 
      province: "",
      ward: "",
      addressDetail: (user as any)?.address || "",
      shippingMethod: "standard", 
      paymentMethod: "cod",
      note: ""
    }
  });

  const selectedProvinceCode = form.watch("province");
  const selectedShipping = form.watch("shippingMethod");

  // Load danh sách tỉnh ban đầu
  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch("/data/vn/provinces.json");
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    }
    loadProvinces();
  }, []);

  // Load danh sách xã khi tỉnh thay đổi (Lazy Loading)
  useEffect(() => {
    if (!selectedProvinceCode) {
      setWards([]);
      return;
    }

    async function loadWards() {
      setLoadingWards(true);
      try {
        const res = await fetch(`/data/vn/${selectedProvinceCode}.json`);
        const data = await res.json();
        setWards(data);
        form.setValue("ward", ""); // Reset ward when province changes
      } catch (err) {
        console.error("Failed to load wards:", err);
      } finally {
        setLoadingWards(false);
      }
    }
    loadWards();
  }, [selectedProvinceCode, form]);

  // Lọc danh sách xã theo từ khóa tìm kiếm
  const filteredWards = useMemo(() => {
    return wards
      .filter(item => item.name.toLowerCase().includes(wardSearch.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wards, wardSearch]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { settings: apiSettings } = await getSettings();
        if (apiSettings) {
          setSettings(apiSettings);
          if (apiSettings.enable_cod === false) {
             if (apiSettings.enable_stripe) form.setValue("paymentMethod", "stripe");
             else if (apiSettings.enable_vnpay) form.setValue("paymentMethod", "vnpay");
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setFetchingSettings(false);
      }
    }
    loadSettings();
  }, [form]);

  useEffect(() => {
    let fee = 0;
    const isFreeShipping = subtotal >= (settings.free_shipping_threshold ?? 1000000);

    if (selectedShipping === "express") {
      fee = settings.express_fee ?? 55000;
    } else {
      fee = isFreeShipping ? 0 : (settings.standard_fee ?? 30000);
    }
    setShippingFee(fee);
  }, [selectedShipping, subtotal, settings]);

  async function onSubmit(data: CheckoutForm) {
    if (!token) {
      router.push("/auth/login?callback=/checkout&message=login_required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const provinceName = provinces.find(p => p.code === data.province)?.name || data.province;
      const fullAddress = `${data.addressDetail}, ${data.ward}, ${provinceName}`;
      
      const res = await createOrder({
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        })),
        shippingAddress: fullAddress,
        phone: data.phone,
        shippingMethod: data.shippingMethod,
        shippingFee: shippingFee,
        paymentMethod: data.paymentMethod
      }, token);

      // Track purchase for AI
      trackEvent("purchase", {
        total,
        itemCount: items.length,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod
      });

      clear();
      if (res.checkoutUrl) {
         window.location.href = res.checkoutUrl;
      } else {
         // Chuyển tới trang chi tiết đơn hàng để khách xem mã QR thủ công hoặc xem trạng thái
         router.push(`/orders/${res.order._id}?success=true`);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold">Giỏ hàng đang trống</h2>
        <p className="text-slate-500 mt-2">Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán.</p>
        <Button asChild className="mt-8">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  if (fetchingSettings) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium tracking-tight">Đang tải cấu hình thanh toán...</p>
      </div>
    );
  }

  return (
    <main className="container py-10 max-w-7xl">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
        <Link href="/cart" className="hover:text-blue-600 transition-colors">Giỏ hàng</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-bold tracking-tight">Thanh toán</span>
        <ChevronRight className="h-3 w-3" />
        <span>Hoàn tất</span>
      </div>

      <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-10">Thanh toán</h1>
      
      <div className="grid gap-10 lg:grid-cols-[1fr_450px]">
        <div className="space-y-10">
          {/* Shipping Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-base font-black shadow-lg shadow-slate-200">1</div>
              <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                <MapPin className="h-6 w-6 text-blue-600" /> Thông tin giao hàng
              </h2>
            </div>
            
            <div className="grid gap-6 bg-white p-8 rounded-3xl border shadow-sm transition-all hover:shadow-md">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Họ và tên người nhận</label>
                  <Input placeholder="Nhập đầy đủ họ tên" {...form.register("name")} className="rounded-xl h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all" />
                  {form.formState.errors.name && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Số điện thoại</label>
                  <Input placeholder="Số điện thoại liên hệ" {...form.register("phone")} className="rounded-xl h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all" />
                  {form.formState.errors.phone && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tỉnh / Thành phố</label>
                  <div className="relative">
                    <select 
                      {...form.register("province")} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 h-12 pl-3 pr-10 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.4c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_14px_center] bg-no-repeat cursor-pointer"
                    >
                      <option value="">-- Chọn Tỉnh / Thành phố --</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  {form.formState.errors.province && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.province.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Phường / Xã / Thị trấn</label>
                  {!selectedProvinceCode ? (
                    <div className="relative">
                      <select 
                        disabled
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 h-12 pl-3 pr-10 text-sm font-bold transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23CBD5E1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.4c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_14px_center] bg-no-repeat opacity-60 cursor-not-allowed"
                      >
                        <option value="">Vui lòng chọn Tỉnh trước</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="relative group">
                        <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <Search className="h-4 w-4" />
                        </div>
                        <Input 
                          placeholder="Tìm nhanh xã, phường..." 
                          value={wardSearch}
                          onChange={(e) => setWardSearch(e.target.value)}
                          disabled={loadingWards}
                          className="pl-10 rounded-xl h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm font-bold"
                        />
                        {loadingWards && (
                           <div className="absolute right-3 top-3.5">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                           </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        <select 
                          {...form.register("ward")} 
                          disabled={loadingWards}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 h-12 pl-3 pr-10 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.4c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_14px_center] bg-no-repeat cursor-pointer"
                        >
                          <option value="">{`-- Chọn trong ${filteredWards.length} đơn vị --`}</option>
                          {filteredWards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                        </select>
                        {filteredWards.length === 0 && !loadingWards && (
                           <p className="text-[10px] text-orange-500 font-bold mt-1">Không tìm thấy địa danh nào khớp với từ khóa.</p>
                        )}
                      </div>
                    </div>
                  )}
                  {form.formState.errors.ward && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.ward.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Số nhà, tên đường</label>
                <Input placeholder="VD: 123 Đường ABC, Tổ dân phố 4..." {...form.register("addressDetail")} className="rounded-xl h-12 bg-slate-50/50 border-slate-200 focus:bg-white" />
                {form.formState.errors.addressDetail && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.addressDetail.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ghi chú thêm cho shipper</label>
                <Input placeholder="Giao giờ hành chính, gọi trước khi đến..." {...form.register("note")} className="rounded-xl h-12 bg-slate-50/50 border-slate-200 focus:bg-white" />
              </div>
            </div>
          </section>

          {/* Shipping Method Section (Same as before but with better UI refinement) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-base font-black shadow-lg shadow-slate-200">2</div>
              <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                <Truck className="h-6 w-6 text-blue-600" /> Vận chuyển
              </h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={cn(
                "relative flex cursor-pointer items-start gap-4 rounded-3xl border-2 p-6 transition-all",
                selectedShipping === "standard" ? "border-blue-600 bg-blue-50/30 shadow-md" : "bg-white border-slate-100 hover:border-slate-200"
              )}>
                <input type="radio" value="standard" {...form.register("shippingMethod")} className="mt-1 h-4 w-4 accent-blue-600" />
                <div className="flex-1">
                  <p className="font-black text-slate-900">Giao hàng Tiêu chuẩn</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Nhận hàng sau 3-5 ngày</p>
                  <p className="mt-4 font-black text-blue-600 text-base">
                    {subtotal >= (settings.free_shipping_threshold ?? 1000000) ? "MIỄN PHÍ" : `${formatCurrency(settings.standard_fee ?? 30000)}`}
                  </p>
                </div>
                {selectedShipping === "standard" && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
              </label>

              <label className={cn(
                "relative flex cursor-pointer items-start gap-4 rounded-3xl border-2 p-6 transition-all",
                selectedShipping === "express" ? "border-blue-600 bg-blue-50/30 shadow-md" : "bg-white border-slate-100 hover:border-slate-200"
              )}>
                <input type="radio" value="express" {...form.register("shippingMethod")} className="mt-1 h-4 w-4 accent-blue-600" />
                <div className="flex-1">
                  <p className="font-black text-slate-900">Giao hàng Hỏa tốc</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Nhận ngay trong vòng 24h</p>
                  <p className="mt-4 font-black text-blue-600 text-base">{formatCurrency(settings.express_fee ?? 55000)}</p>
                </div>
                {selectedShipping === "express" && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
              </label>
            </div>
          </section>

          {/* Payment Method Section (Same as before) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-base font-black shadow-lg shadow-slate-200">3</div>
              <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                <Wallet className="h-6 w-6 text-blue-600" /> Thanh toán
              </h2>
            </div>
            
            <div className="grid gap-3">
              {[
                { id: "cod", label: "Tiền mặt khi nhận hàng (COD)", icon: Truck, desc: "An tâm kiểm tra hàng trước khi trả tiền", enabled: settings.enable_cod },
                { id: "sepay", label: "Chuyển khoản VietQR", icon: Landmark, desc: "Quét mã QR VietQR chuyển khoản nhanh chóng", enabled: settings.enable_sepay },
              ].filter(m => m.enabled).map((m) => (
                <label key={m.id} className={cn(
                  "flex cursor-pointer items-center gap-5 rounded-3xl border-2 p-6 transition-all",
                  form.watch("paymentMethod") === m.id ? "border-blue-600 bg-blue-50/20 shadow-md" : "bg-white border-slate-100 hover:bg-slate-50"
                )}>
                  <input type="radio" value={m.id} {...form.register("paymentMethod")} className="h-5 w-5 accent-blue-600" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border shadow-sm flex-shrink-0">
                    <m.icon className="h-7 w-7 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 text-base">{m.label}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="space-y-6">
           <div className="sticky top-24 rounded-[32px] border-2 border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="p-10 border-b bg-slate-50/50">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đơn hàng của bạn</h2>
                 <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-black">Tổng cộng {items.reduce((a, b) => a + b.quantity, 0)} sản phẩm</p>
              </div>
              
              <div className="p-10 space-y-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-5 group">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-slate-50 bg-slate-100 shadow-inner">
                        <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-115" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-black border-2 border-white shadow-lg z-10">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <p className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest">Kích cỡ: {item.size}</p>
                      <p className="mt-3 text-base font-black text-slate-900">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-slate-50/50 space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Tạm tính</span>
                  <span className="font-black text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Phí giao hàng</span>
                  <span className={cn("font-black", shippingFee === 0 ? "text-green-600" : "text-blue-600")}>
                    {shippingFee === 0 ? "MIỄN PHÍ" : `+ ${formatCurrency(shippingFee)}`}
                  </span>
                </div>
                <div className="h-px bg-slate-200/60 my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900 tracking-tight">Tổng thanh toán</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(total)}</span>
                </div>

                <div className="pt-8 space-y-5">
                  {error && (
                    <div className="rounded-2xl bg-red-50 p-5 text-xs font-bold text-red-600 flex items-start gap-3 border border-red-100">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" /> {error}
                    </div>
                  )}
                  
                  <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    className="w-full h-14 text-base font-black rounded-2xl shadow-xl transition-all active:scale-[0.97] bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 group" 
                    disabled={loading || fetchingSettings}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                         <Loader2 className="h-5 w-5 animate-spin" />
                         Đang xử lý...
                      </div>
                    ) : (
                      <>
                        XÁC NHẬN ĐẶT HÀNG
                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
           </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium tracking-tight">Đang tải trang thanh toán...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
