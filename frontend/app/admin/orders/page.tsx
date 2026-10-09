"use client";

import { useEffect, useState } from "react";
import { 
  Search, Filter, Eye, Package, User, 
  MapPin, CreditCard, Truck, Calendar,
  X, CheckCircle2, Clock, RefreshCcw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Order } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const statusMap: any = {
  pending: { label: "Chờ xác nhận", color: "text-orange-600", bg: "bg-orange-50", icon: Clock },
  processing: { label: "Đang xử lý", color: "text-blue-600", bg: "bg-blue-50", icon: RefreshCcw },
  shipped: { label: "Đang giao", color: "text-indigo-600", bg: "bg-indigo-50", icon: Truck },
  delivered: { label: "Đã giao", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50", icon: X }
};

export default function AdminOrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const data = await getOrders(token);
        setOrders(data.orders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!token) return;
    try {
      await updateOrderStatus(orderId, newStatus, token);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert("Cập nhật trạng thái thất bại");
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id.toLowerCase().includes(search.toLowerCase()) ||
                         o.shippingAddress.toLowerCase().includes(search.toLowerCase()) ||
                         (o.userId?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi và cập nhật trạng thái đơn hàng từ khách hàng.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Tìm theo mã đơn, khách hàng hoặc địa chỉ..." 
            className="pl-10 h-11 rounded-xl border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-11 rounded-xl border-slate-200 font-bold">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(statusMap).map(([key, { label }]: any) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-[24px] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Đơn hàng</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Khách hàng</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Tổng tiền</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Trạng thái</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang nạp dữ liệu...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Package className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Không có đơn hàng nào.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = statusMap[order.status] || statusMap.pending;
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-black text-slate-900">#{order._id.slice(-6).toUpperCase()}</span>
                           <span className="text-[10px] text-slate-400 font-bold mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900">{order.userId?.name || "Khách vãng lai"}</span>
                           <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[200px]">{order.shippingAddress}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-blue-600">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={order.status} 
                          onValueChange={(val) => handleStatusChange(order._id, val)}
                        >
                          <SelectTrigger className={cn("w-[150px] h-9 rounded-xl font-bold text-[11px] border-none", status.bg, status.color)}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusMap).map(([key, { label }]: any) => (
                              <SelectItem key={key} value={key} className="text-xs font-bold">
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Chi tiết đơn hàng</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Mã: #{selectedOrder._id.toUpperCase()}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedOrder(null)}
                   className="h-10 w-10 rounded-full hover:bg-white hover:shadow-md flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                 >
                    <X className="h-5 w-5" />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
                 {/* Customer Info */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <User className="h-3 w-3" /> Người đặt hàng
                       </h4>
                       <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="font-black text-slate-900 text-sm">{selectedOrder.userId?.name || "N/A"}</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">{selectedOrder.userId?.email || "No email"}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="h-3 w-3" /> Địa chỉ giao hàng
                       </h4>
                       <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-xs text-slate-600 font-bold leading-relaxed line-clamp-2">
                             {selectedOrder.shippingAddress}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Order Items */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm trong đơn</h4>
                    <div className="space-y-3">
                       {selectedOrder.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100">
                            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-50 border">
                               <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-black text-slate-900 line-clamp-1">{item.name}</p>
                               <div className="flex gap-4 mt-1">
                                  <span className="text-[10px] font-bold text-slate-400">Size: {item.size}</span>
                                  <span className="text-[10px] font-bold text-slate-400">SL: x{item.quantity}</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Summary & Payment */}
                 <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard className="h-3 w-3" /> Thanh toán
                       </h4>
                       <p className="text-sm font-black text-slate-900 uppercase">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-400">Tạm tính:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(selectedOrder.totalAmount - selectedOrder.shippingFee)}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-400">Phí ship:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(selectedOrder.shippingFee)}</span>
                       </div>
                       <div className="flex justify-between pt-2">
                          <span className="text-xs font-black text-slate-900 uppercase">Tổng cộng:</span>
                          <span className="text-lg font-black text-blue-600 tracking-tighter">{formatCurrency(selectedOrder.totalAmount)}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 md:p-8 bg-slate-50/50 border-t flex gap-4">
                 <div className="flex-1">
                    <Select 
                      value={selectedOrder.status} 
                      onValueChange={(val) => handleStatusChange(selectedOrder._id, val)}
                    >
                      <SelectTrigger className={cn("w-full h-12 rounded-xl font-black text-xs border-2", statusMap[selectedOrder.status].bg, statusMap[selectedOrder.status].color)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusMap).map(([key, { label }]: any) => (
                          <SelectItem key={key} value={key} className="text-xs font-bold">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <Button onClick={() => setSelectedOrder(null)} className="h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-slate-900 text-white">
                    Đóng
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("animate-spin", className)} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
