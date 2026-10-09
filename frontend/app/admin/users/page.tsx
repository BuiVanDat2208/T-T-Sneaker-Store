"use client";

import { useEffect, useState } from "react";
import { 
  Search, UserPlus, Shield, User, Mail, 
  Trash2, Phone, MapPin, Lock, Unlock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getUsers, updateUser, deleteUser } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / Action States
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Edit Form Fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin" | "customer">("customer");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const data = await getUsers(token);
        setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (user: UserType) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPhone(user.phone || "");
    setEditAddress(user.address || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;
    
    setIsUpdating(true);
    try {
      const response = await updateUser(selectedUser._id, {
        name: editName,
        email: editEmail,
        role: editRole,
        phone: editPhone,
        address: editAddress
      }, token);
      
      setUsers(users.map(u => u._id === selectedUser._id ? response.user : u));
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      alert(err.message || "Không thể cập nhật thông tin thành viên");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLock = async (user: UserType) => {
    if (!token) return;
    
    // Ngăn chặn admin tự khóa tài khoản của chính mình
    if (currentUser?._id === user._id) {
      alert("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const action = user.isBlocked ? "mở khóa" : "khóa";
    if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản của ${user.name}?`)) {
      return;
    }

    try {
      const response = await updateUser(user._id, {
        isBlocked: !user.isBlocked
      }, token);
      
      setUsers(users.map(u => u._id === user._id ? response.user : u));
    } catch (err: any) {
      alert(err.message || `Không thể ${action} thành viên`);
    }
  };

  const handleDeleteClick = (user: UserType) => {
    // Ngăn chặn admin tự xóa tài khoản của chính mình
    if (currentUser?._id === user._id) {
      alert("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedUser) return;

    setIsUpdating(true);
    try {
      await deleteUser(selectedUser._id, token);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      alert(err.message || "Không thể xóa người dùng");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground">Quản lý tài khoản khách hàng và phân quyền hệ thống.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo tên hoặc email..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border bg-slate-100" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg bg-white">
            Không tìm thấy người dùng nào.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <article 
              key={user._id} 
              className={cn(
                "rounded-xl border p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                user.isBlocked && "border-red-200 bg-red-50/5 opacity-90"
              )}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", user.isBlocked ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-600")}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-semibold text-slate-800">{user.name}</h2>
                        {user.isBlocked && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-800 uppercase border border-red-200">
                            Đã khóa
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase mt-1",
                        user.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                      )}>
                        {user.role === "admin" ? <Shield className="mr-1 h-2.5 w-2.5" /> : null}
                        {user.role}
                      </span>
                    </div>
                  </div>
                  {currentUser?._id !== user._id && (
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditClick(user)}
                  className="w-full h-8 text-xs rounded-xl"
                >
                  Sửa
                </Button>
                {currentUser?._id !== user._id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleLock(user)}
                    className={cn(
                      "w-full h-8 text-xs rounded-xl flex items-center justify-center gap-1",
                      user.isBlocked ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" : "text-red-600 hover:bg-red-50 hover:text-red-700"
                    )}
                  >
                    {user.isBlocked ? (
                      <>
                        <Unlock className="h-3.5 w-3.5" /> Mở khóa
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" /> Khóa
                      </>
                    )}
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] bg-white border">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase text-slate-900 tracking-tight">Sửa thông tin thành viên</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                Cập nhật thông tin chi tiết và phân quyền của {editName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold text-slate-600">Họ và tên</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-600">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-xs font-bold text-slate-600">Vai trò</Label>
                <Select 
                  value={editRole} 
                  onValueChange={(value: "user" | "admin" | "customer") => setEditRole(value)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 bg-white z-[60]">
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-600">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="rounded-xl border-slate-200"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-xs font-bold text-slate-600">Địa chỉ</Label>
                <Input
                  id="address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="rounded-xl border-slate-200"
                  placeholder="Nhập địa chỉ thành viên..."
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px] bg-white border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-red-600 tracking-tight flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Xóa tài khoản
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa tài khoản của thành viên <span className="font-black text-slate-900">{selectedUser?.name}</span> ({selectedUser?.email}) không?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-medium leading-relaxed my-2">
            Hành động này không thể hoàn tác. Mọi thông tin đơn hàng và hoạt động của người dùng sẽ bị ảnh hưởng.
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="button" 
              disabled={isUpdating}
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
