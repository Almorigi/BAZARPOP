"use client";
import Link from "next/link";
import { ShoppingCart, Menu, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const updateCount = () => {
    const cart = getCart();
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
  };

  useEffect(() => {
    updateCount();
    window.addEventListener("cart-updated", updateCount);
    return () => window.removeEventListener("cart-updated", updateCount);
  }, []);

  const links = [
    { href: "/products?category=fumetti", label: "Fumetti" },
    { href: "/products?category=libri", label: "Libri" },
    { href: "/products?category=videogiochi", label: "Videogiochi" },
    { href: "/products?category=oggetti", label: "Oggetti" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface-800/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <Zap className="text-brand-500" size={22} />
          <span className="text-white">Soffitta<span className="text-brand-500">del Collezionista</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-300 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-surface-600 transition-colors">
            <ShoppingCart size={22} className="text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-surface-700 border-t border-white/10 px-4 py-3 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
