"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!token || user?.role !== "admin")) {
      router.push("/auth/login?callback=/admin");
    }
  }, [mounted, user, token, router]);

  if (!mounted || !token || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-20" : "ml-64"
      )}>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-8">
          <h2 className="font-semibold text-lg">Hệ thống quản trị</h2>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Xin chào, {user.name}</span>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
      {/* 
        Self-correction: The margin-left needs to be dynamic based on the sidebar state.
        Since the sidebar state is internal to AdminSidebar, I should probably move the 
        collapsed state to a store or pass it up.
        For now, I'll use a simplified version or just a fixed width sidebar.
      */}
    </div>
  );
}
