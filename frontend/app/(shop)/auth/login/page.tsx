"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự")
});

type LoginForm = z.infer<typeof loginSchema>;

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const message = searchParams.get("message");
  const loginRequired = message === "login_required";

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError(null);
    try {
      const res = await login(data);
      setAuth(res.user, res.token);
      
      const callback = searchParams.get("callback") || "/";
      router.push(callback);
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid email or password") {
        setError("Email hoặc mật khẩu không chính xác");
      } else if (
        err instanceof Error &&
        (err.name === "AbortError" || err.message === "Failed to fetch")
      ) {
        setError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend và thử lại.");
      } else if (err instanceof Error && err.message === "Internal server error") {
        setError("Máy chủ gặp lỗi khi đăng nhập. Vui lòng thử lại; nếu lỗi tiếp diễn, kiểm tra log backend.");
      } else if (err instanceof Error && err.message.startsWith("Tài khoản của bạn")) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Không thể đăng nhập lúc này. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container flex min-h-[calc(100vh-200px)] items-center justify-center py-10">
      <div className="w-full max-w-[400px] space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">Nhập thông tin để truy cập tài khoản của bạn</p>
        </div>

        {loginRequired && !error && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-600 border border-blue-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Vui lòng đăng nhập để tiếp tục thanh toán
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="name@example.com" 
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Link href="#" className="text-xs text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
