"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Award, Compass, Heart, Users, Sparkles, Milestone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageContent = {
  vi: {
    heroTitle: "Câu Chuyện Của Chúng Tôi",
    heroSubtitle: "Hành trình định hình phong cách, kết nối đam mê và mang sự độc bản đến từng bước chân của bạn.",
    
    storyTitle: "Khởi nguồn từ đam mê Sneaker",
    storyParagraph1: "DotSpace được thành lập vào năm 2022 bởi một nhóm những người trẻ có niềm đam mê mãnh liệt với văn hóa đường phố và những đôi giày thể thao độc đáo. Chúng tôi nhận thấy rằng một đôi giày không chỉ đơn giản là vật dụng bảo vệ đôi chân, mà còn là tuyên ngôn cá tính, là câu chuyện riêng biệt của người mang.",
    storyParagraph2: "Với tinh thần đó, DotSpace ra đời với sứ mệnh mang về những dòng sản phẩm Sneaker chính hãng, chất lượng nhất từ các thương hiệu toàn cầu như Nike, Adidas, New Balance, Puma... giúp giới trẻ tự tin khẳng định bản thân và nâng tầm phong cách sống mỗi ngày.",
    
    valueTitle: "Giá trị cốt lõi",
    valueSubtitle: "Kim chỉ nam giúp DotSpace không ngừng nỗ lực và phát triển.",
    value1Title: "100% Chính Hãng",
    value1Desc: "Cam kết tuyệt đối về nguồn gốc và chất lượng sản phẩm. Từng sản phẩm đều được kiểm định kỹ lưỡng trước khi trao đến tay khách hàng.",
    value2Title: "Kết Nối Cộng Đồng",
    value2Desc: "DotSpace không chỉ bán giày, chúng tôi xây dựng một không gian kết nối những tâm hồn đồng điệu có chung niềm đam mê với Streetwear.",
    value3Title: "Trải Nghiệm Đột Phá",
    value3Desc: "Không ngừng đổi mới công nghệ từ thanh toán tự động VietQR đến tư vấn size bằng Trợ lý AI thông minh để hỗ trợ khách hàng tốt nhất.",

    timelineTitle: "Mốc lịch sử quan trọng",
    timelineYear1: "2022",
    timelineYear1Title: "Khởi Đầu Hành Trình",
    timelineYear1Desc: "Thành lập cửa hàng vật lý đầu tiên tại TP.HCM với bộ sưu tập sneaker tuyển chọn giới hạn.",
    timelineYear2: "2024",
    timelineYear2Title: "Mở Rộng Kỹ Thuật Số",
    timelineYear2Desc: "Ra mắt website thương mại điện tử DotSpace phục vụ khách hàng yêu giày trên toàn quốc.",
    timelineYear3: "2026",
    timelineYear3Title: "Nâng Tầm Công Nghệ AI",
    timelineYear3Desc: "Tích hợp trợ lý AI thông minh tư vấn size 24/7 và hệ thống thanh toán tự động PayOS VietQR.",

    statsTitle: "Những con số ấn tượng",
    stats1Num: "50,000+",
    stats1Text: "Khách hàng tin dùng",
    stats2Num: "100%",
    stats2Text: "Sản phẩm chính hãng",
    stats3Num: "24/7",
    stats3Text: "Hỗ trợ khách hàng bởi AI",
    stats4Num: "5+",
    stats4Text: "Thương hiệu đối tác",

    ctaTitle: "Sẵn sàng tìm kiếm đôi giày của bạn?",
    ctaSubtitle: "Khám phá ngay bộ sưu tập Sneaker mới nhất được tuyển chọn riêng cho bạn.",
    ctaBtn: "Khám Phá Sản Phẩm"
  },
  en: {
    heroTitle: "Our Story",
    heroSubtitle: "A journey of shaping style, connecting passion, and bringing uniqueness to your every step.",
    
    storyTitle: "Born from Passion for Sneakers",
    storyParagraph1: "DotSpace was founded in 2022 by a group of young people with a fierce passion for street culture and unique sneakers. We realized that a pair of shoes is not just utility for your feet, but a statement of identity, a unique story of the wearer.",
    storyParagraph2: "With that spirit, DotSpace was born with the mission to bring genuine, highest-quality Sneaker lines from global brands like Nike, Adidas, New Balance, Puma... helping youth confidently assert themselves and elevate their daily lifestyle.",
    
    valueTitle: "Core Values",
    valueSubtitle: "The guiding principles that drive DotSpace's constant efforts and growth.",
    value1Title: "100% Genuine",
    value1Desc: "Absolute commitment to product origin and quality. Every single product is thoroughly verified before reaching our customers.",
    value2Title: "Community Connection",
    value2Desc: "DotSpace does not just sell shoes; we build a space connecting like-minded souls sharing a passion for Streetwear.",
    value3Title: "Innovative Experience",
    value3Desc: "Constantly innovating technology from VietQR automatic payment to dynamic size advice by our smart AI Assistant.",

    timelineTitle: "Key Milestones",
    timelineYear1: "2022",
    timelineYear1Title: "Journey Beginning",
    timelineYear1Desc: "Established the first physical boutique in HCMC with a curated limited sneaker collection.",
    timelineYear2: "2024",
    timelineYear2Title: "Digital Expansion",
    timelineYear2Desc: "Launched the DotSpace e-commerce website to serve sneakerheads nationwide.",
    timelineYear3: "2026",
    timelineYear3Title: "AI & Tech Integration",
    timelineYear3Desc: "Integrated smart AI chatbot for 24/7 sizing support and automatic PayOS VietQR payment.",

    statsTitle: "Impressive Numbers",
    stats1Num: "50,000+",
    stats1Text: "Happy Customers",
    stats2Num: "100%",
    stats2Text: "Genuine Products",
    stats3Num: "24/7",
    stats3Text: "AI Sizing Support",
    stats4Num: "5+",
    stats4Text: "Brand Partners",

    ctaTitle: "Ready to find your perfect shoes?",
    ctaSubtitle: "Explore the latest Sneaker collections handpicked just for you.",
    ctaBtn: "Shop Collection"
  }
};

export default function AboutPage() {
  const { language } = useTranslation();
  const t = pageContent[language] || pageContent.vi;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about_store.png"
            alt="DotSpace Store Interior"
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105"
          />
          {/* Custom HSL Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-900 dark:to-slate-950" />
        </div>

        <div className="container relative z-10 text-center max-w-3xl px-4 mt-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 tracking-tight leading-tight uppercase mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {t.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-slate-200 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-20 md:py-28 container max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">DotSpace Origin</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t.storyTitle}
            </h2>
            <div className="h-1.5 w-20 bg-blue-600 rounded-full" />
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              {t.storyParagraph1}
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              {t.storyParagraph2}
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none group">
            <Image
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80"
              alt="Streetwear Sneaker Culture"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Corner styling accents */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-white/60 rounded-tl-lg" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-white/60 rounded-br-lg" />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="container max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {t.valueTitle}
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              {t.valueSubtitle}
            </p>
            <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="flex flex-col bg-white dark:bg-slate-950 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                {t.value1Title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.value1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col bg-white dark:bg-slate-950 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-sm">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                {t.value2Title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.value2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col bg-white dark:bg-slate-950 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1 mx-auto sm:max-w-md lg:max-w-none">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 shadow-sm">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                {t.value3Title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.value3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Milestones Timeline */}
      <section className="py-20 md:py-28 container max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center justify-center gap-3">
            <Milestone className="h-8 w-8 text-blue-600" /> {t.timelineTitle}
          </h2>
          <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto" />
        </div>

        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 md:ml-32 space-y-12 md:space-y-16">
          {/* Milestone 1 */}
          <div className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950 bg-blue-600 transition-all duration-300 group-hover:scale-125 group-hover:ring-4 group-hover:ring-blue-600/10" />
            <div className="absolute left-[-110px] top-0 hidden md:block w-20 text-right">
              <span className="text-2xl font-black text-blue-600 tracking-tight">{t.timelineYear1}</span>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group-hover:shadow-md">
              <span className="inline-block md:hidden text-lg font-black text-blue-600 mb-2">{t.timelineYear1}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{t.timelineYear1Title}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.timelineYear1Desc}</p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950 bg-blue-600 transition-all duration-300 group-hover:scale-125 group-hover:ring-4 group-hover:ring-blue-600/10" />
            <div className="absolute left-[-110px] top-0 hidden md:block w-20 text-right">
              <span className="text-2xl font-black text-blue-600 tracking-tight">{t.timelineYear2}</span>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group-hover:shadow-md">
              <span className="inline-block md:hidden text-lg font-black text-blue-600 mb-2">{t.timelineYear2}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{t.timelineYear2Title}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.timelineYear2Desc}</p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950 bg-blue-600 transition-all duration-300 group-hover:scale-125 group-hover:ring-4 group-hover:ring-blue-600/10" />
            <div className="absolute left-[-110px] top-0 hidden md:block w-20 text-right">
              <span className="text-2xl font-black text-blue-600 tracking-tight">{t.timelineYear3}</span>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group-hover:shadow-md animate-pulse-slow">
              <span className="inline-block md:hidden text-lg font-black text-blue-600 mb-2">{t.timelineYear3}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                {t.timelineYear3Title} <Sparkles size={16} className="text-amber-500" />
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.timelineYear3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Statistics Block */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-900">
        <div className="container max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-5xl font-black text-blue-400 tracking-tight">{t.stats1Num}</p>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest">{t.stats1Text}</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-5xl font-black text-blue-400 tracking-tight">{t.stats2Num}</p>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest">{t.stats2Text}</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-5xl font-black text-blue-400 tracking-tight">{t.stats3Num}</p>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest">{t.stats3Text}</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-5xl font-black text-blue-400 tracking-tight">{t.stats4Num}</p>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest">{t.stats4Text}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 text-center container max-w-3xl px-4 space-y-6">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {t.ctaTitle}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          {t.ctaSubtitle}
        </p>
        <div className="pt-4">
          <Button asChild className="rounded-2xl h-14 px-8 text-base font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 dark:shadow-none group">
            <Link href="/products">
              {t.ctaBtn} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
