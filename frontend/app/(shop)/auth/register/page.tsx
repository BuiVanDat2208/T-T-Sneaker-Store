"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register as registerApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

const registerSchema = z.object({
  name: z.string().min(2, "Họ tên phải từ 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" }
  });

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setError(null);
    try {
      const res = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password
      });
      setAuth(res.user, res.token);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message === "API error 409" ? "Email đã được sử dụng" : "Đã có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container flex min-h-[calc(100vh-200px)] items-center justify-center py-10">
      <div className="w-full max-w-[400px] space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Đăng ký tài khoản</h1>
          <p className="text-sm text-muted-foreground">Tạo tài khoản để nhận nhiều ưu đãi từ T&T</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Họ và tên</label>
            <Input 
              placeholder="Nguyễn Văn A" 
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
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
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Xác nhận mật khẩu</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
