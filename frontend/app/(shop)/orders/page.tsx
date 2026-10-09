"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, Truck, Package, CheckCircle2, 
  XCircle, Clock, ChevronRight, MapPin, 
  CreditCard, RefreshCcw, Loader2, ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { getOrders } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "Chờ xác nhận", color: "text-orange-600", icon: Clock, bg: "bg-orange-50" },
  processing: { label: "Đang xử lý", color: "text-blue-600", icon: RefreshCcw, bg: "bg-blue-50" },
  shipped: { label: "Đang giao hàng", color: "text-indigo-600", icon: Truck, bg: "bg-indigo-50" },
  delivered: { label: "Đã giao hàng", color: "text-green-600", icon: CheckCircle2, bg: "bg-green-50" },
  cancelled: { label: "Đã hủy đơn", color: "text-red-600", icon: XCircle, bg: "bg-red-50" }
};

export default function OrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    async function loadOrders() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { orders: data } = await getOrders(token);
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold tracking-tight uppercase text-[10px]">Đang nạp danh sách đơn hàng...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto h-24 w-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8 border-2 border-dashed border-slate-200">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vui lòng đăng nhập</h2>
        <p className="text-slate-500 mt-3 max-w-md mx-auto font-medium">Bạn cần đăng nhập để xem lịch sử đơn hàng và theo dõi hành trình vận chuyển.</p>
        <Button asChild className="mt-8 h-14 px-10 rounded-2xl shadow-xl shadow-blue-100" variant="primary">
          <Link href="/auth/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="container py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Đơn hàng của tôi</h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi và quản lý các đơn hàng đã đặt tại T&T Sneaker.</p>
        </div>
        
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ xác nhận" },
            { id: "shipped", label: "Đang giao" },
            { id: "delivered", label: "Hoàn thành" },
            { id: "cancelled", label: "Đã hủy" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
          <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Không tìm thấy đơn hàng nào</h3>
          <p className="text-slate-500 mt-2 font-medium">Dường như bạn chưa có đơn hàng nào ở trạng thái này.</p>
          <Button asChild variant="outline" className="mt-8 rounded-xl border-2">
            <Link href="/products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status as OrderStatus] || statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <article key={order._id} className="group bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6 bg-slate-50/30">
                   <div className="flex items-center gap-4">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", config.bg)}>
                         <StatusIcon className={cn("h-7 w-7", config.color)} />
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Đơn #{order._id.slice(-6).toUpperCase()}</h2>
                            <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", config.bg, config.color)}>
                               {config.label}
                            </div>
                         </div>
                         <p className="text-xs text-slate-400 font-bold mt-1">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                   </div>
                   
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tổng thanh toán</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                   </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-[1fr_300px] gap-10">
                   <div className="space-y-6">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-5 group/item">
                           <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 border shadow-sm">
                              <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover/item:scale-110" />
                           </div>
                           <div className="flex-1 min-w-0 py-1">
                              <h4 className="font-black text-slate-900 text-sm line-clamp-1 group-hover/item:text-blue-600 transition-colors">{item.name}</h4>
                              <div className="flex items-center gap-4 mt-2">
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kích cỡ: {item.size}</p>
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số lượng: {item.quantity}</p>
                              </div>
                              <p className="mt-2 font-black text-slate-900">{formatCurrency(item.price)}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="bg-slate-50/50 rounded-2xl p-6 space-y-5 border border-slate-100">
                      <div className="flex items-start gap-3">
                         <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                         <div className="text-xs">
                            <p className="font-black text-slate-900 mb-1">Địa chỉ nhận hàng</p>
                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">{order.shippingAddress}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                         <CreditCard className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                         <div className="text-xs">
                            <p className="font-black text-slate-900 mb-1">Hình thức thanh toán</p>
                            <p className="text-slate-500 font-medium uppercase tracking-tight">
                               {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : 
                                order.paymentMethod === "stripe" ? "Thẻ quốc tế (Stripe)" : "Ví điện tử / QR VNPAY"}
                            </p>
                         </div>
                      </div>

                      <div className="pt-2">
                         <Button asChild variant="outline" className="w-full rounded-xl h-11 text-[10px] font-black border-2 group">
                            <Link href={`/orders/${order._id}`}>
                               CHI TIẾT ĐƠN HÀNG
                               <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                         </Button>
                      </div>
                   </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
