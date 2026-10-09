import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Không tìm thấy trang</h1>
      <p className="max-w-md text-muted-foreground">
        Trang bạn đang tìm có thể đã được di chuyển hoặc không còn tồn tại.
      </p>
      <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/">
        Về trang chủ
      </Link>
    </main>
  );
}
