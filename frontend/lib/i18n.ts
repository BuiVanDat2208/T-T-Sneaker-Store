"use client";

import { create } from "zustand";

type Language = "vi" | "en";

interface TranslationStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    "header.products": "Sản phẩm",
    "header.brands": "Thương hiệu",
    "header.categories": "Danh mục",
    "header.orders": "Đơn hàng",
    "header.login": "Đăng nhập",
    "header.account": "Tài khoản",
    "header.my_orders": "Đơn hàng của tôi",
    "header.admin_panel": "Trang quản trị",
    "header.logout": "Đăng xuất",
    "header.loading": "Đang tải...",
    "slider.slide1.title": "Mới Nhất Mùa Này",
    "slider.slide1.subtitle": "Khám phá bộ sưu tập sneaker thời trang đẳng cấp nhất.",
    "slider.slide2.title": "Thể Thao Đỉnh Cao",
    "slider.slide2.subtitle": "Tối đa hóa hiệu suất với công nghệ giày tiên tiến.",
    "slider.slide3.title": "Phong Cách Đường Phố",
    "slider.slide3.subtitle": "Tự tin bước đi với những thiết kế độc quyền.",
    "slider.explore": "Khám Phá Ngay",
    "home.hero_tag": "T&T Sneaker Store",
    "home.hero_title": "Giày thể thao chính hãng cho nhịp sống năng động",
    "home.hero_desc": "Chọn nhanh Nike, Adidas, New Balance và nhiều mẫu sneaker được tuyển chọn cho chạy bộ, tập luyện và phối đồ hằng ngày.",
    "home.buy_now": "Mua ngay",
    "home.best_seller": "Bán chạy",
    "home.new_products": "Sản phẩm mới",
    "home.new_products_desc": "Các mẫu sneaker vừa cập nhật tại T&T.",
    "home.view_all": "Xem tất cả",
    "home.hot_products": "Sản phẩm bán chạy",
    "home.hot_products_desc": "Những lựa chọn đang được khách hàng đặt nhiều.",
    "home.shop_by_brand": "Mua theo thương hiệu",
    "product.featured": "Nổi bật",
    "product.best_seller": "Bán chạy",
    "product.out_of_stock": "HẾT HÀNG",
    "product.temp_out": "Tạm hết",
    "product.in_stock": "Còn ",
    "banner.running.title": "Giày Chạy Bộ",
    "banner.running.subtitle": "Giá chỉ từ 1.299.000₫",
    "banner.collection.title": "Bộ Sưu Tập Mùa Hè",
    "banner.collection.subtitle": "Giá chỉ từ 999.000₫",
    "banner.street.title": "Sneaker Đường Phố",
    "banner.street.subtitle": "Giá chỉ từ 1.499.000₫",
    "video.title": "Khám Phá Bộ Sưu Tập Mới",
    "video.subtitle": "Phong cách đỉnh cao cho những bước chân không ngừng chuyển động.",
    "footer.help": "Hỗ trợ",
    "footer.privacy": "Chính sách bảo mật",
    "footer.returns": "Đổi trả & Hoàn tiền",
    "footer.shipping": "Vận chuyển",
    "footer.terms": "Điều khoản & Điều kiện",
    "footer.faq": "Câu hỏi thường gặp",
    "footer.about_us": "Về chúng tôi",
    "footer.our_story": "Câu chuyện của chúng tôi",
    "footer.visit_store": "Ghé thăm cửa hàng",
    "footer.contact": "Liên hệ",
    "footer.account": "Tài khoản",
    "footer.newsletter": "Đăng ký nhận tin",
    "footer.newsletter_desc": "Đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi và nhiều ưu đãi hấp dẫn!",
    "footer.email_placeholder": "Nhập địa chỉ email",
    "footer.subscribe": "Đăng ký",
    "footer.address": "Địa chỉ: Kiot 46 Tòa HH03E KĐT Thanh Hà Cienco 5, Phường Phú Lương, Quận Hà Đông, Thành phố Hà Nội",
    "footer.email": "Email: buivandat2003hn@gmail.com",
    "footer.phone": "Điện thoại: 0343289288",
    "footer.get_direction": "Chỉ đường",
    "footer.copyright": "© 2026 DotSpace. Tất cả quyền được bảo lưu.",
    "gallery.title": "Shop Gram",
    "gallery.desc": "Truyền cảm hứng và hãy để bản thân được truyền cảm hứng, từ phong cách thời trang độc đáo này đến phong cách khác."
  },
  en: {
    "header.products": "Products",
    "header.brands": "Brands",
    "header.categories": "Categories",
    "header.orders": "Orders",
    "header.login": "Login",
    "header.account": "Account",
    "header.my_orders": "My Orders",
    "header.admin_panel": "Admin Panel",
    "header.logout": "Logout",
    "header.loading": "Loading...",
    "slider.slide1.title": "Newest This Season",
    "slider.slide1.subtitle": "Discover the most premium fashion sneaker collection.",
    "slider.slide2.title": "Peak Athletics",
    "slider.slide2.subtitle": "Maximize performance with advanced shoe technology.",
    "slider.slide3.title": "Street Style",
    "slider.slide3.subtitle": "Walk with confidence in exclusive designs.",
    "slider.explore": "Explore Now",
    "home.hero_tag": "T&T Sneaker Store",
    "home.hero_title": "Authentic Sneakers for an Active Lifestyle",
    "home.hero_desc": "Quickly select Nike, Adidas, New Balance and many curated sneaker models for running, training and everyday wear.",
    "home.buy_now": "Shop Now",
    "home.best_seller": "Best Sellers",
    "home.new_products": "New Arrivals",
    "home.new_products_desc": "Fresh sneaker drops just updated at T&T.",
    "home.view_all": "View All",
    "home.hot_products": "Trending Products",
    "home.hot_products_desc": "Top choices currently being ordered by our customers.",
    "home.shop_by_brand": "Shop by Brand",
    "product.featured": "Featured",
    "product.best_seller": "Top Rated",
    "product.out_of_stock": "SOLD OUT",
    "product.temp_out": "Sold out",
    "product.in_stock": "Left ",
    "banner.running.title": "Running Shoes",
    "banner.running.subtitle": "Start from $59",
    "banner.collection.title": "Summer Collection",
    "banner.collection.subtitle": "Start from $45",
    "banner.street.title": "Street Sneakers",
    "banner.street.subtitle": "Start from $69",
    "video.title": "Discover The New Collection",
    "video.subtitle": "Premium style for steps that never stop moving.",
    "footer.help": "Help",
    "footer.privacy": "Privacy Policy",
    "footer.returns": "Returns + Exchanges",
    "footer.shipping": "Shipping",
    "footer.terms": "Terms & Conditions",
    "footer.faq": "FAQ's",
    "footer.about_us": "About Us",
    "footer.our_story": "Our Story",
    "footer.visit_store": "Visit Our Store",
    "footer.contact": "Contact Us",
    "footer.account": "Account",
    "footer.newsletter": "Sign Up for Email",
    "footer.newsletter_desc": "Sign up to get first dibs on new arrivals, sales, exclusive content, events and more!",
    "footer.email_placeholder": "Enter email address",
    "footer.subscribe": "Subscribe",
    "footer.address": "Address: 123 Fashion Street, District 1, HCMC",
    "footer.email": "Email: buivandat2003hn@gmail.com",
    "footer.phone": "Phone: 0900 000 000",
    "footer.get_direction": "Get direction",
    "footer.copyright": "© 2026 T&T Sneaker Store. All rights reserved.",
    "gallery.title": "Shop Gram",
    "gallery.desc": "Inspire and let yourself be inspired, from one unique fashion to another."
  }
};

export const useTranslation = create<TranslationStore>((set, get) => ({
  language: "vi",
  setLanguage: (lang) => {
    set({ language: lang });
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", lang);
    }
  },
  t: (key) => {
    const lang = get().language;
    // @ts-ignore
    return translations[lang]?.[key] || key;
  }
}));
