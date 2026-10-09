"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.092.063 1.541.12v3.3h-1.11c-1.724 0-2.266.82-2.266 2.351v1.787h3.2l-.55 3.667h-2.65v8.174C18.795 22.99 22 18.927 22 14.101 22 8.588 17.514 4.1 12 4.1S2 8.588 2 14.101c0 4.176 2.576 7.752 6.226 9.233l.875.357z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
    </svg>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();

  const helpLinks = [
    { key: "footer.privacy", href: "/privacy" },
    { key: "footer.returns", href: "/returns" },
    { key: "footer.shipping", href: "/shipping" },
    { key: "footer.terms", href: "/terms" },
    { key: "footer.faq", href: "/faq" },
  ];

  const aboutLinks = [
    { key: "footer.our_story", href: "/about" },
    { key: "footer.visit_store", href: "/store" },
    { key: "footer.contact", href: "/contact" },
    { key: "footer.about_us", href: "/about" },
    { key: "footer.account", href: "/auth/login" },
  ];

  const socialIcons = [
    { icon: <FacebookIcon />, href: "#", label: "Facebook" },
    { icon: <XIcon />, href: "#", label: "X" },
    { icon: <InstagramIcon />, href: "#", label: "Instagram" },
    { icon: <TikTokIcon />, href: "#", label: "TikTok" },
    { icon: <PinterestIcon />, href: "#", label: "Pinterest" },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main Footer */}
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Store Info */}
        <div className="space-y-4">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            T&T Sneaker
          </Link>
          <div className="space-y-1.5 text-sm text-slate-400 mt-4">
            <p>{t("footer.address")}</p>
            <p>{t("footer.email")}</p>
            <p>{t("footer.phone")}</p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-blue-400 transition-colors mt-2"
          >
            {t("footer.get_direction")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            {socialIcons.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-white transition-colors"
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Help */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-5">{t("footer.help")}</h3>
          <ul className="space-y-3">
            {helpLinks.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: About Us */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-5">{t("footer.about_us")}</h3>
          <ul className="space-y-3">
            {aboutLinks.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">{t("footer.newsletter")}</h3>
          <p className="text-sm text-slate-400 mb-5">{t("footer.newsletter_desc")}</p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t("footer.email_placeholder")}
              className="flex-1 rounded-l-md border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-r-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-500 hover:text-white transition-colors"
            >
              {t("footer.subscribe")} <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-slate-500">{t("footer.copyright")}</p>
          {/* Payment Icons */}
          <div className="flex items-center gap-2">
            {["Visa", "PayPal", "Mastercard", "Amex", "JCB"].map((card) => (
              <span
                key={card}
                className="inline-flex items-center justify-center h-7 px-2.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wide"
              >
                {card}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
