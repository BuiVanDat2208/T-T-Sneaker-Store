"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Copy, ExternalLink, Loader2, Landmark, ShieldCheck } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSettings } from "@/lib/api";

interface SePayPaymentProps {
  orderId: string;
  amount: number;
}

export function SePayPayment({ orderId, amount }: SePayPaymentProps) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { settings: data } = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load payment settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Đã sao chép vào bộ nhớ tạm");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[40px] border-2 border-slate-100 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Đang khởi tạo mã QR thanh toán...</p>
      </div>
    );
  }

  if (!settings?.enable_sepay) {
    return null;
  }

  const bankName = (settings.sepay_bank_name || "MB").toLowerCase().replace(/\s+/g, "");
  const accountNumber = settings.sepay_account_number || "0987654321";
  const accountName = settings.sepay_account_name || "TT SNEAKER STORE";
  const description = `SEVQR DH${orderId.slice(-6).toUpperCase()}`; // Mã nội dung chuyển khoản

  // VietQR Generator URL
  // Template: text (hiển thị text), qr_only (chỉ qr), compact2 (gọn gàng)
  const qrUrl = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="bg-white rounded-[40px] border-2 border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
               <Landmark className="h-5 w-5" />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-900 tracking-tight">Thanh toán Chuyển khoản</h3>
               <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Quét mã VietQR chuyển khoản nhanh chóng</p>
            </div>
         </div>
         <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase">An toàn & Bảo mật</span>
         </div>
      </div>

      <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative p-6 bg-white rounded-[32px] border-2 border-blue-50 shadow-xl shadow-blue-100/50 group">
             <div className="relative h-[240px] w-[240px] transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
                <img 
                   src={qrUrl} 
                   alt="VietQR Payment" 
                   className="max-h-full max-w-full object-contain"
                />
             </div>
             {/* Decorative corners */}
             <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-tl-lg" />
             <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-blue-600 rounded-tr-lg" />
             <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-blue-600 rounded-bl-lg" />
             <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-blue-600 rounded-br-lg" />
          </div>
          <p className="mt-6 text-xs text-slate-400 font-bold text-center leading-relaxed">
            Mở ứng dụng Ngân hàng của bạn và <span className="text-blue-600 font-black uppercase">Quét mã QR</span> để thanh toán.
          </p>
        </div>

        {/* Transfer Info Section */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-4">
             <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Chủ tài khoản</p>
                   <button onClick={() => handleCopy(accountName)} className="text-blue-600 hover:text-blue-700">
                      <Copy className="h-3.5 w-3.5" />
                   </button>
                </div>
                <p className="text-sm font-black text-slate-900">{accountName}</p>
             </div>

             <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Số tài khoản ({bankName})</p>
                   <button onClick={() => handleCopy(accountNumber)} className="text-blue-600 hover:text-blue-700">
                      <Copy className="h-3.5 w-3.5" />
                   </button>
                </div>
                <p className="text-lg font-black text-slate-900 tracking-tight">{accountNumber}</p>
             </div>

             <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 group transition-all hover:bg-white hover:shadow-md ring-2 ring-blue-600/5">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Nội dung chuyển khoản</p>
                   <button onClick={() => handleCopy(description)} className="text-blue-600 hover:text-blue-700">
                      <Copy className="h-3.5 w-3.5" />
                   </button>
                </div>
                <p className="text-xl font-black text-blue-700 tracking-wider">{description}</p>
                <p className="mt-2 text-[9px] text-blue-400 font-bold leading-tight">
                  Lưu ý: Vui lòng nhập đúng nội dung chuyển khoản để hệ thống đối soát và duyệt đơn nhanh hơn.
                </p>
             </div>

             <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center">
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Số tiền thanh toán</p>
                   <p className="text-2xl font-black text-blue-400 tracking-tighter">{formatCurrency(amount)}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400 opacity-50" />
             </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
                {["T", "H", "D", "K"].map((letter, i) => (
                  <div key={i} className={cn(
                     "h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm flex-shrink-0",
                     i === 0 ? "bg-red-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-green-500" : "bg-purple-500"
                  )}>
                     {letter}
                  </div>
                ))}
             </div>
            <p className="text-[10px] font-bold text-slate-400">Hàng ngàn khách hàng đã thanh toán thành công qua VietQR</p>
         </div>
         <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors gap-2">
            Hỗ trợ thanh toán <ExternalLink className="h-3.5 w-3.5" />
         </Button>
      </div>
    </div>
  );
}
