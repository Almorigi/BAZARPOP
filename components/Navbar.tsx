"use client";
import Link from "next/link";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { useWishlistCount } from "./WishlistButton";
import { clsx } from "clsx";

const links: { href: string; label: string; highlight?: boolean }[] = [
  { href: "/products?category=fumetti",     label: "Fumetti" },
  { href: "/products?category=libri",       label: "Libri" },
  { href: "/products?category=videogiochi", label: "Videogiochi" },
  { href: "/products?category=dvd",         label: "Film DVD" },
  { href: "/products?category=oggetti",     label: "Oggetti" },
  { href: "/blog",                           label: "Blog" },
  { href: "/chi-siamo",                     label: "Chi siamo" },
  { href: "/contatti",                      label: "Contatti" },
];

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wishlistCount = useWishlistCount();

  useEffect(() => {
    const updateCart = () => {
      const c = getCart();
      setCartCount(c.reduce((s, i) => s + i.quantity, 0));
    };
    updateCart();
    window.addEventListener("cart-updated", updateCart);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={clsx(
      "fixed top-0 inset-x-0 z-50 transition-all duration-500",
      scrolled
        ? "bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span className="font-serif text-xl font-bold text-white tracking-wide group-hover:text-accent transition-colors duration-300">
            La Soffitta
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-accent font-sans font-medium">
            del Collezionista
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "hover-underline text-sm font-medium transition-colors duration-200 tracking-wide",
                l.highlight
                  ? "text-accent hover:text-orange-400 font-semibold"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link href="/preferiti" className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
            <Heart size={20} className="text-neutral-400 group-hover:text-red-400 transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
            <ShoppingCart size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-neutral-400" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={clsx(
        "md:hidden overflow-hidden transition-all duration-300",
        menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "text-sm transition-colors py-1 tracking-wide",
                l.highlight ? "text-accent font-semibold" : "text-neutral-400 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
