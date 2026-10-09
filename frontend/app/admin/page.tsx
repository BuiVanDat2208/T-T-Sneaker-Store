"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, Cell 
} from "recharts";
import { 
  DollarSign, ShoppingBag, Users, Package, 
  ArrowUpRight, TrendingUp, Calendar, Loader2,
  ChevronRight, ArrowRight, MousePointer2, Eye,
  Sparkles, ShieldCheck, ShieldAlert, ToggleRight, ToggleLeft
} from "lucide-react";
import { getAdminStats, getAiSettings, updateAiSettings } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiSettings, setAiSettings] = useState({ search_products: true, get_order_status: true });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const [statsData, settingsRes] = await Promise.all([
          getAdminStats(token),
          getAiSettings(token).catch(err => {
            console.error("Failed to fetch AI settings:", err);
            return null;
          })
        ]);
        setData(statsData);
        if (settingsRes) setAiSettings(settingsRes);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const toggleAiTool = async (tool: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newValue = { ...aiSettings, [tool]: !aiSettings[tool as keyof typeof aiSettings] };
    
    try {
      await updateAiSettings(newValue, token!);
      setAiSettings(newValue);
    } catch (err) {
      console.error("Failed to update AI settings");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang kết nối trung tâm dữ liệu...</p>
      </div>
    );
  }

  const { stats, chartData, topViewedProducts, searchTrends } = data || { 
    stats: { revenue: 0, orders: 0, pageViews24h: 0, customers: 0 }, 
    chartData: [], 
    topViewedProducts: [],
    searchTrends: []
  };

  const statCards = [
    { label: "Doanh thu", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Đơn hàng", value: stats.orders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Truy cập (24h)", value: stats.pageViews24h, icon: MousePointer2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Khách hàng", value: stats.customers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard Quản Trị</h1>
          <p className="text-slate-500 font-medium mt-1">Tổng quan kinh doanh và cấu hình Gemini AI.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border shadow-sm">
           <Calendar className="h-4 w-4 text-slate-400" />
           <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
              {new Date().toLocaleDateString('vi-VN')}
           </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <article key={stat.label} className="group bg-white rounded-[32px] p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500">
            <div className="flex items-start justify-between">
               <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                  <stat.icon className={cn("h-7 w-7", stat.color)} />
               </div>
            </div>
            <div className="mt-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
               <p className="mt-2 text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Revenue Chart */}
         <section className="lg:col-span-2 bg-white rounded-[40px] border-2 border-slate-50 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                     <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Doanh thu & Xu hướng</h2>
               </div>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                     <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }} />
                     <Bar dataKey="revenue" radius={[12, 12, 0, 0]} barSize={50}>
                        {chartData.map((e: any, i: number) => (
                           <Cell key={`cell-${i}`} fill={i === chartData.length - 1 ? '#2563eb' : '#e2e8f0'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </section>

         {/* AI Settings Section */}
         <section className="bg-white rounded-[40px] border border-slate-100 p-8 text-slate-900 relative overflow-hidden shadow-sm">
            <div className="relative z-10 h-full flex flex-col">
               <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                     <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Cấu hình Gemini AI</h3>
               </div>

               <div className="space-y-6 flex-1">
                  <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-all">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", aiSettings.search_products ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-red-50 text-red-600 border-red-100/50")}>
                              {aiSettings.search_products ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                           </div>
                           <span className="text-sm font-bold text-slate-900">Tìm kiếm sản phẩm</span>
                        </div>
                        <button onClick={() => toggleAiTool('search_products')} disabled={isUpdating} className="text-slate-300 hover:text-slate-500 transition-colors">
                           {aiSettings.search_products ? <ToggleRight className="h-8 w-8 text-blue-500" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                        </button>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">Cho phép Gemini truy cập kho hàng để tư vấn sản phẩm.</p>
                  </div>

                  <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-all">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", aiSettings.get_order_status ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-red-50 text-red-600 border-red-100/50")}>
                              {aiSettings.get_order_status ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                           </div>
                           <span className="text-sm font-bold text-slate-900">Tra cứu đơn hàng</span>
                        </div>
                        <button onClick={() => toggleAiTool('get_order_status')} disabled={isUpdating} className="text-slate-300 hover:text-slate-500 transition-colors">
                           {aiSettings.get_order_status ? <ToggleRight className="h-8 w-8 text-blue-500" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                        </button>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">Cho phép Gemini kiểm tra trạng thái đơn hàng của khách.</p>
                  </div>
               </div>

               <div className="mt-8 p-4 rounded-2xl bg-blue-50 border border-blue-100/50">
                  <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                     * Các thay đổi sẽ có hiệu lực ngay lập tức đối với tất cả các phiên Chatbot đang hoạt động.
                  </p>
               </div>
            </div>
         </section>
      </div>

      {/* Popular Products Area */}
      <section className="bg-white rounded-[40px] border-2 border-slate-50 p-8 shadow-sm">
         <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" /> Xu hướng tìm kiếm thịnh hành
         </h3>
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {searchTrends && searchTrends.length > 0 ? (
               searchTrends.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-5 rounded-[24px] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-slate-300">#{idx + 1}</span>
                        {item.link ? (
                           <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm font-bold text-slate-700 truncate max-w-[170px] group-hover:text-blue-600 hover:underline"
                           >
                              {item.query}
                           </a>
                        ) : (
                           <span className="text-sm font-bold text-slate-700 truncate max-w-[170px] group-hover:text-blue-600">
                              {item.query}
                           </span>
                        )}
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{item.views}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Google Trends</p>
                     </div>
                  </div>
               ))
            ) : (
               <p className="text-sm text-slate-400 col-span-full">Không có dữ liệu xu hướng tìm kiếm.</p>
            )}
         </div>
      </section>
    </div>
  );
}
