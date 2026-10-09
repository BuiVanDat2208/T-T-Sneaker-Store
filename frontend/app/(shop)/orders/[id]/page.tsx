"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, CreditCard, Truck, 
  Clock, Package, CheckCircle2, XCircle, 
  ChevronRight, AlertCircle, ShoppingBag,
  Loader2, Printer, MessageSquare, RefreshCcw, Landmark, ExternalLink
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { getOrder, cancelOrder } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SePayPayment } from "@/components/checkout/sepay-payment";
import { toast } from "sonner";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const statusSteps = [
  { id: "pending", label: "Đặt hàng", icon: Clock },
  { id: "processing", label: "Xác nhận", icon: RefreshCcw },
  { id: "shipped", label: "Đang giao", icon: Truck },
  { id: "delivered", label: "Hoàn thành", icon: CheckCircle2 }
];

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ xác nhận", color: "text-orange-600", bg: "bg-orange-50" },
  processing: { label: "Đang xử lý", color: "text-blue-600", bg: "bg-blue-50" },
  shipped: { label: "Đang giao hàng", color: "text-indigo-600", bg: "bg-indigo-50" },
  delivered: { label: "Đã giao hàng", color: "text-green-600", bg: "bg-green-50" },
  cancelled: { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50" }
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!token || !id) return;
      try {
        const { order: data } = await getOrder(id as string, token);
        setOrder(data);
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, token]);

  // Tự động Polling cập nhật trạng thái đơn hàng khi chưa thanh toán
  useEffect(() => {
    if (!token || !id || !order) return;
    if (order.paymentStatus === "paid" || order.paymentMethod !== "sepay" || order.status === "cancelled") return;

    const intervalId = setInterval(async () => {
      try {
        const { order: data } = await getOrder(id as string, token);
        if (data) {
          if (data.paymentStatus === "paid") {
            setOrder(data);
            toast.success("Thanh toán thành công! Đơn hàng đang được xử lý.");
            clearInterval(intervalId);
          } else {
            setOrder(data);
          }
        }
      } catch (error) {
        console.error("Polling order payment status failed:", error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [id, token, order?.paymentStatus, order?.paymentMethod, order?.status]);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    setCancelling(true);
    try {
      await cancelOrder(id as string, token!);
      // Tải lại dữ liệu
      const { order: data } = await getOrder(id as string, token!);
      setOrder(data);
    } catch (error) {
      alert("Không thể hủy đơn hàng vào lúc này.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black">Không tìm thấy đơn hàng</h2>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/orders">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(s => s.id === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <main className="container py-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-2xl border-2 hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Chi tiết đơn hàng</h1>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Đơn hàng: #{order._id.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl h-11 px-6 font-bold text-xs border-2 gap-2">
              <Printer className="h-4 w-4" /> In hóa đơn
           </Button>
           <Button className="rounded-xl h-11 px-6 font-bold text-xs shadow-lg shadow-blue-100 gap-2" variant="primary">
              <MessageSquare className="h-4 w-4" /> Chat hỗ trợ
           </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          {/* Order Progress / Timeline */}
          {!isCancelled && (
            <div className="bg-white rounded-[40px] border-2 border-slate-100 p-8 md:p-12 shadow-sm">
               <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-7 left-0 w-full h-[3px] bg-slate-100 -z-0" />
                  <div 
                    className="absolute top-7 left-0 h-[3px] bg-blue-600 transition-all duration-1000 -z-0" 
                    style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                  />

                  {statusSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;

                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 group">
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-white shadow-xl",
                          isActive ? "bg-blue-600 text-white scale-110" : "bg-white text-slate-300 ring-2 ring-slate-100"
                        )}>
                          <StepIcon className={cn("h-6 w-6", isCurrent && "animate-pulse")} />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors",
                          isActive ? "text-slate-900" : "text-slate-400"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50/50 rounded-[40px] border-2 border-dashed border-red-200 p-10 text-center animate-in zoom-in-95 duration-500">
               <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
               <h3 className="text-2xl font-black text-red-900">Đơn hàng đã bị hủy</h3>
               <p className="text-red-600 mt-2 font-medium">Đơn hàng này đã được hủy và không còn hiệu lực. Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.</p>
               <Button className="mt-8 rounded-xl" variant="destructive" asChild>
                  <Link href="/products">Quay lại mua sắm</Link>
               </Button>
            </div>
          )}

          {order.status === "pending" && order.paymentMethod === "sepay" && order.paymentStatus === "unpaid" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {order.paymentDetails?.checkoutUrl && (
                  <div className="bg-blue-50/50 border-2 border-blue-100 rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-lg font-black text-blue-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
                           Thanh toán tự động qua PayOS
                        </h3>
                        <p className="text-xs text-blue-700 font-medium max-w-md leading-relaxed">
                           Đơn hàng đã được tạo liên kết thanh toán tự động VietQR. Vui lòng bấm vào nút bên cạnh để tiến hành thanh toán qua giao diện PayOS bảo mật.
                        </p>
                     </div>
                     <Button asChild className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-blue-100/50 flex-shrink-0 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <a href={order.paymentDetails.checkoutUrl} target="_blank" rel="noopener noreferrer">
                           Thanh toán ngay <ExternalLink className="h-4 w-4" />
                        </a>
                     </Button>
                  </div>
               )}
               
               <SePayPayment orderId={order._id} amount={order.totalAmount} />
            </div>
          )}

          {/* Product Items List */}
          <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Sản phẩm đã chọn</h3>
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                   {order.items.reduce((a: any, b: any) => a + b.quantity, 0)} món
                </span>
             </div>
             <div className="divide-y divide-slate-50">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-8 flex gap-8 group hover:bg-slate-50/50 transition-colors">
                     <div className="relative h-28 w-28 flex-shrink-0 rounded-3xl overflow-hidden bg-slate-100 border-2 border-white shadow-lg">
                        <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-115" />
                     </div>
                     <div className="flex-1 py-1">
                        <h4 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kích cỡ</span>
                              <span className="text-sm font-black text-slate-900">{item.size}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng</span>
                              <span className="text-sm font-black text-slate-900">x {item.quantity}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá</span>
                              <span className="text-sm font-black text-slate-900">{formatCurrency(item.price)}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right flex flex-col justify-center">
                        <p className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(item.price * item.quantity)}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <aside className="space-y-8">
           {/* Order Info Card */}
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-300">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <Package className="h-5 w-5 text-blue-400" /> Tóm tắt chi phí
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Tiền hàng</span>
                    <span className="font-black tracking-tight">{formatCurrency(order.totalAmount - (order.shippingFee || 0))}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Phí vận chuyển</span>
                    <span className="font-black text-blue-400 tracking-tight">
                       {order.shippingFee === 0 ? "MIỄN PHÍ" : `+ ${formatCurrency(order.shippingFee)}`}
                    </span>
                 </div>
                 <div className="h-px bg-slate-800 my-2" />
                 <div className="flex justify-between items-end">
                    <span className="text-slate-400 font-bold mb-1">Tổng tiền</span>
                    <span className="text-3xl font-black text-blue-400 tracking-tighter">{formatCurrency(order.totalAmount)}</span>
                 </div>
              </div>

              {!isCancelled && ["pending", "processing"].includes(order.status) && (
                 <Button 
                   onClick={handleCancel}
                   disabled={cancelling}
                   variant="destructive" 
                   className="w-full mt-10 h-14 rounded-2xl font-black text-xs transition-all hover:scale-[1.02] shadow-xl shadow-red-900/20"
                 >
                    {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    HỦY ĐƠN HÀNG NÀY
                 </Button>
              )}
              
              {order.status === "delivered" && (
                 <Button 
                   className="w-full mt-10 h-14 rounded-2xl font-black text-xs bg-blue-600 hover:bg-blue-500 transition-all hover:scale-[1.02] shadow-xl shadow-blue-900/20"
                 >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    MUA LẠI ĐƠN HÀNG
                 </Button>
              )}
           </div>

           {/* Shipping Address */}
           <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <MapPin className="h-4 w-4 text-blue-600" /> Giao hàng
              </h3>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Phương thức</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{order.shippingMethod === "express" ? "Hỏa tốc 24h" : "Giao hàng tiêu chuẩn"}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Người nhận & Địa chỉ</p>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">{order.shippingAddress}</p>
                 </div>
              </div>
           </div>

           {/* Payment Info */}
           <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <CreditCard className="h-4 w-4 text-blue-600" /> Thanh toán
              </h3>
              <div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border flex items-center justify-center">
                           {order.paymentMethod === "sepay" ? (
                             <Landmark className="h-5 w-5 text-blue-600" />
                           ) : (
                             <CreditCard className="h-5 w-5 text-slate-400" />
                           )}
                        </div>
                        <p className="text-sm font-black text-slate-900 uppercase">
                          {order.paymentMethod === "sepay" ? "Chuyển khoản VietQR" : 
                           order.paymentMethod === "cod" ? "Tiền mặt (COD)" : 
                           order.paymentMethod}
                        </p>
                     </div>
                     <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        order.paymentStatus === "paid" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                     )}>
                        {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                     </div>
                  </div>
              </div>
           </div>
        </aside>
      </div>
    </main>
  );
}
