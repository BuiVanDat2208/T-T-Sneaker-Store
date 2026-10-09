"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, User, ChevronDown, Globe, Sun, Moon } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchBox } from "@/components/layout/search-box";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { 
  getBrands, 
  getCategories,
  getSettings 
} from "@/lib/api";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export function SiteHeader() {
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [shopName, setShopName] = useState("T&T Sneaker");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    setMounted(true);

    // Initialize language from localStorage
    const savedLang = localStorage.getItem("preferred_lang") as "vi" | "en";
    if (savedLang && (savedLang === "vi" || savedLang === "en") && savedLang !== language) {
      setLanguage(savedLang);
    }

    async function loadMenuData() {
      try {
        const [catsRes, brandsRes, settingsRes] = await Promise.all([
          getCategories(),
          getBrands(),
          getSettings()
        ]);
        setCategories(catsRes.categories);
        setBrands(brandsRes.brands);
        
        const settings = settingsRes?.settings;
        if (settings?.shop_name) setShopName(settings.shop_name);
      } catch (error) {
        console.error("Failed to load header data:", error);
      }
    }
    loadMenuData();
    
    // Initialize dark mode from localStorage or system preference
    if (typeof window !== 'undefined') {
      const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur dark:bg-slate-950/95 dark:border-slate-800">
      <div className="container flex h-16 items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu">
          <Menu className="h-5 w-5 dark:text-slate-200" />
        </Button>
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
          {shopName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex dark:text-slate-200">
          <Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t("header.products")}</Link>
          
          {/* Dropdown Thương hiệu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors outline-none">
              {t("header.brands")} <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 dark:bg-slate-900 dark:border-slate-800">
              {brands.map((brand) => (
                <DropdownMenuItem key={brand._id} asChild className="dark:focus:bg-slate-800 dark:text-slate-200">
                  <Link href={`/products?brandId=${brand._id}`} className="w-full">
                    {brand.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              {brands.length === 0 && <div className="p-2 text-xs text-muted-foreground italic">{t("header.loading")}</div>}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown Danh mục */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors outline-none">
              {t("header.categories")} <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 dark:bg-slate-900 dark:border-slate-800">
              {categories.map((cat) => (
                <DropdownMenuItem key={cat._id} asChild className="dark:focus:bg-slate-800 dark:text-slate-200">
                  <Link href={`/products?categoryId=${cat._id}`} className="w-full">
                    {cat.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              {categories.length === 0 && <div className="p-2 text-xs text-muted-foreground italic">{t("header.loading")}</div>}
            </DropdownMenuContent>
          </DropdownMenu>


          <Link href="/orders" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t("header.orders")}</Link>
        </nav>
        <div className="ml-auto hidden flex-1 justify-end md:flex items-center gap-2">
          <SearchBox />
        </div>

        <div className="flex items-center gap-1">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ngôn ngữ" className="dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-800">
              <DropdownMenuItem 
                onClick={() => setLanguage("vi")} 
                className={language === "vi" ? "bg-slate-100 font-medium dark:bg-slate-800 dark:text-slate-200" : "dark:text-slate-200 dark:focus:bg-slate-800"}
              >
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage("en")} 
                className={language === "en" ? "bg-slate-100 font-medium dark:bg-slate-800 dark:text-slate-200" : "dark:text-slate-200 dark:focus:bg-slate-800"}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Đổi giao diện" className="dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("header.account")} className="dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none dark:text-slate-200">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="dark:bg-slate-800" />
                <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-200">
                  <Link href="/orders">{t("header.my_orders")}</Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-200">
                    <Link href="/admin">{t("header.admin_panel")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="dark:bg-slate-800" />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 dark:focus:bg-slate-800"
                  onSelect={() => logout()}
                >
                  {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild aria-label={t("header.login")} className="dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
              <Link href="/auth/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          <CartDrawer />
        </div>
      </div>
      <div className="container pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
