"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  LayoutGrid,
  Tag,
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Trang chủ", href: "/admin/homepage", icon: Home },
  { label: "Sản phẩm", href: "/admin/products", icon: Package },
  { label: "Danh mục", href: "/admin/categories", icon: LayoutGrid },
  { label: "Thương hiệu", href: "/admin/brands", icon: Tag },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ 
  collapsed, 
  setCollapsed 
}: { 
  collapsed: boolean; 
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && <span className="font-bold text-lg">Admin T&T</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 w-full px-3">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700",
            collapsed && "justify-center"
          )}
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </Button>
      </div>
    </aside>
  );
}
