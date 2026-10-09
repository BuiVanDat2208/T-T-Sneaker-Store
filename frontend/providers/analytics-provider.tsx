"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logActivity } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface AnalyticsContextType {
  trackEvent: (type: string, metadata?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

import { Suspense } from "react";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { trackEvent } = useAnalytics();

  // Tự động track Page View mỗi khi đổi route
  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    
    const metadata: any = { url };
    
    // Nếu là trang sản phẩm, cố gắng lấy slug/id từ path
    if (pathname.startsWith("/products/")) {
      metadata.productSlug = pathname.split("/")[2];
    }

    trackEvent("page_view", metadata);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  // Tạo hoặc lấy sessionId từ localStorage
  useEffect(() => {
    if (!localStorage.getItem("tt_session_id")) {
      localStorage.setItem("tt_session_id", crypto.randomUUID());
    }
  }, []);

  const trackEvent = async (type: string, metadata: any = {}) => {
    // Không theo dõi hành động của Admin để tránh làm nhiễu dữ liệu khách hàng
    if (user?.role === "admin") return;

    const sessionId = localStorage.getItem("tt_session_id") || "unknown";
    try {
      await logActivity({
        type,
        path: window.location.pathname,
        metadata,
        sessionId,
        userId: user?._id
      });
    } catch (err) {
      // Slient fail for analytics
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
