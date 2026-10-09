"use client";

import { useState, useEffect } from "react";
import { 
  Save, Truck, CreditCard, Info, 
  CheckCircle2, AlertCircle, Loader2,
  Settings as SettingsIcon, Globe, Store, Landmark, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSettings, updateSettings } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Settings states
  const [shipping, setShipping] = useState({
    standard_fee: 30000,
    express_fee: 50000,
    free_shipping_threshold: 1000000
  });

  const [payment, setPayment] = useState({
    enable_cod: true,
    enable_sepay: false,
    sepay_bank_name: "",
    sepay_account_number: "",
    sepay_account_name: "",
    sepay_webhook_token: "",
    payos_client_id: "",
    payos_api_key: "",
    payos_checksum_key: ""
  });

  const [general, setGeneral] = useState({
    shop_name: "T&T Sneaker Store",
    shop_email: "contact@ttsneaker.com",
    shop_phone: "0123456789",
    shop_address: "Hà Nội, Việt Nam"
  });

  useEffect(() => {
    async function loadSettings() {
      if (!token) return;
      try {
        const { settings } = await getSettings();

        if (settings && Object.keys(settings).length > 0) {
           setShipping({
             standard_fee: settings.standard_fee ?? 30000,
             express_fee: settings.express_fee ?? 50000,
             free_shipping_threshold: settings.free_shipping_threshold ?? 1000000
           });
           setPayment({
             enable_cod: settings.enable_cod ?? true,
             enable_sepay: settings.enable_sepay ?? false,
             sepay_bank_name: settings.sepay_bank_name || "",
             sepay_account_number: settings.sepay_account_number || "",
             sepay_account_name: settings.sepay_account_name || "",
             sepay_webhook_token: settings.sepay_webhook_token || "",
             payos_client_id: settings.payos_client_id || "",
             payos_api_key: settings.payos_api_key || "",
             payos_checksum_key: settings.payos_checksum_key || ""
           });
           setGeneral({
             shop_name: settings.shop_name || "T&T Sneaker Store",
             shop_email: settings.shop_email || "contact@ttsneaker.com",
             shop_phone: settings.shop_phone || "0123456789",
             shop_address: settings.shop_address || "Hà Nội, Việt Nam"
           });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [token]);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        ...shipping,
        ...payment,
        ...general
      };
      await updateSettings(payload, token);
      setStatus({ type: 'success', message: 'Cài đặt đã được lưu thành công!' });
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Không thể lưu cài đặt. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Cài đặt hệ thống</h1>
          <p className="text-slate-500 mt-1">Quản lý cấu hình vận chuyển, thanh toán và thông tin shop.</p>
        </div>
        <div className="flex items-center gap-4">
          {status && (
            <div className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4",
              status.type === 'success' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
            )}>
              {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {status.message}
            </div>
          )}
          <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-xl shadow-lg shadow-blue-100">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* General Settings */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50/50 flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Store className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900">Thông tin cơ bản</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tên shop & Liên hệ</p>
             </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên cửa hàng</label>
              <Input value={general.shop_name} onChange={e => setGeneral({...general, shop_name: e.target.value})} className="rounded-xl h-11" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                <Input value={general.shop_phone} onChange={e => setGeneral({...general, shop_phone: e.target.value})} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email liên hệ</label>
                <Input value={general.shop_email} onChange={e => setGeneral({...general, shop_email: e.target.value})} className="rounded-xl h-11" />
              </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ trụ sở</label>
                <Input value={general.shop_address} onChange={e => setGeneral({...general, shop_address: e.target.value})} className="rounded-xl h-11" />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50/50 flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <Truck className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900">Vận chuyển</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phí ship & Ưu đãi</p>
             </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phí chuẩn (₫)</label>
                <Input type="number" value={shipping.standard_fee} onChange={e => setShipping({...shipping, standard_fee: Number(e.target.value)})} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phí hỏa tốc (₫)</label>
                <Input type="number" value={shipping.express_fee} onChange={e => setShipping({...shipping, express_fee: Number(e.target.value)})} className="rounded-xl h-11" />
              </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngưỡng Freeship (₫)</label>
                <Input type="number" value={shipping.free_shipping_threshold} onChange={e => setShipping({...shipping, free_shipping_threshold: Number(e.target.value)})} className="rounded-xl h-11" />
                <p className="text-[10px] text-slate-400 italic font-medium">Đơn hàng trên mức này sẽ được miễn phí vận chuyển tiêu chuẩn.</p>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-6 border-b bg-slate-50/50 flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <CreditCard className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900">Phương thức thanh toán</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bật / Tắt cổng thanh toán</p>
             </div>
          </div>
          <div className="p-8 grid gap-6 md:grid-cols-2">
            {[
              { id: "enable_cod", label: "Thanh toán COD", desc: "Trả tiền khi nhận hàng", state: payment.enable_cod, set: (v: boolean) => setPayment({...payment, enable_cod: v}) },
              { id: "enable_sepay", label: "Chuyển khoản VietQR", desc: "Tạo mã QR thanh toán VietQR", state: payment.enable_sepay, set: (v: boolean) => setPayment({...payment, enable_sepay: v}) },
            ].map(method => (
              <div key={method.id} className={cn(
                "p-6 rounded-2xl border-2 transition-all flex items-center justify-between",
                method.state ? "border-blue-100 bg-blue-50/20 shadow-sm" : "border-slate-100 bg-slate-50/50 opacity-60"
              )}>
                <div>
                  <p className="font-bold text-slate-900">{method.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{method.desc}</p>
                </div>
                <Switch checked={method.state} onCheckedChange={method.set} />
              </div>
            ))}
          </div>

          {payment.enable_sepay && (
            <div className="mx-8 mb-8 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-6">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                 <Landmark className="h-4 w-4" />
                 <span className="text-xs font-black uppercase tracking-widest">Cấu hình tài khoản VietQR</span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Ngân hàng (VD: Vietcombank, MBBank...)</label>
                  <Input 
                    value={payment.sepay_bank_name} 
                    onChange={e => setPayment({...payment, sepay_bank_name: e.target.value})} 
                    className="h-10 text-sm rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Số tài khoản</label>
                  <Input 
                    value={payment.sepay_account_number} 
                    onChange={e => setPayment({...payment, sepay_account_number: e.target.value})} 
                    className="h-10 text-sm rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tên chủ tài khoản (In hoa không dấu)</label>
                  <Input 
                    value={payment.sepay_account_name} 
                    onChange={e => setPayment({...payment, sepay_account_name: e.target.value})} 
                    className="h-10 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-tight">Hướng dẫn đối soát thanh toán:</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Khi khách hàng chọn phương thức Chuyển khoản VietQR, hệ thống sẽ tự động tạo mã QR chứa số tiền và nội dung chuyển khoản tương ứng.
                  <br />
                  Bạn (Admin) sẽ đối soát số dư trong tài khoản ngân hàng của mình và duyệt thủ công trạng thái thanh toán trong trang quản lý đơn hàng.
                </p>
              </div>

              <div className="h-px bg-slate-200 my-6" />

              <div className="flex items-center gap-2 text-blue-600 mb-2">
                 <ShieldCheck className="h-4 w-4" />
                 <span className="text-xs font-black uppercase tracking-widest">Cấu hình Cổng tự động PayOS</span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Nếu bạn điền các cấu hình PayOS dưới đây, hệ thống sẽ kích hoạt <strong>tự động duyệt đơn hàng</strong> khi khách hàng chuyển khoản thành công. 
                Nếu bỏ trống, hệ thống sẽ tự động chuyển sang chế độ đối soát thủ công bằng thông tin tài khoản ở trên.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">PayOS Client ID</label>
                  <Input 
                    value={payment.payos_client_id} 
                    onChange={e => setPayment({...payment, payos_client_id: e.target.value})} 
                    className="h-10 text-sm rounded-xl"
                    placeholder="Nhập Client ID từ PayOS"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">PayOS API Key</label>
                  <Input 
                    value={payment.payos_api_key} 
                    onChange={e => setPayment({...payment, payos_api_key: e.target.value})} 
                    className="h-10 text-sm rounded-xl"
                    placeholder="Nhập API Key từ PayOS"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">PayOS Checksum Key</label>
                  <Input 
                    type="password"
                    value={payment.payos_checksum_key} 
                    onChange={e => setPayment({...payment, payos_checksum_key: e.target.value})} 
                    className="h-10 text-sm rounded-xl"
                    placeholder="Nhập Checksum Key từ PayOS"
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-dashed border-blue-200">
                <p className="text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-tight">Cấu hình Webhook PayOS:</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Truy cập dashboard PayOS của bạn và cấu hình URL Webhook sau để nhận thông báo thanh toán tự động:
                  <br />
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-bold">https://domain-cua-ban.com/api/webhooks/payos</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
