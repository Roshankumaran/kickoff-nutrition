import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X, ShieldCheck, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { AuthModal } from "./AuthModal";
import { CartSidebar } from "./CartSidebar";
import { SearchOverlay } from "./SearchOverlay";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/lib/products";

const staticNavItems = [
  { label: "Shop", href: "/" },
  { label: "Bestsellers", href: "/#bestsellers" },
  { label: "About Us", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { user } = useAuth();
  const { itemCount } = useCart();
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: categories } = useQuery(categoriesQueryOptions());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-base bg-ink text-ink-foreground border-b border-white/5 ${
          scrolled ? "py-2 backdrop-blur-md bg-ink/95" : "py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {staticNavItems.slice(0, 2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-bold tracking-[0.18em] uppercase text-ink-foreground/80 hover:text-primary transition-base relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-bold tracking-[0.18em] uppercase text-ink-foreground/80 hover:text-primary transition-base relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                Categories <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-6 transition-all duration-300 ${
                  categoriesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                }`}
              >
                <div className="bg-ink border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[240px]">
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        className="block px-6 py-4 text-sm font-bold tracking-wider uppercase text-ink-foreground/80 hover:text-primary hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-sm text-muted-foreground uppercase tracking-wider">No categories</div>
                  )}
                </div>
              </div>
            </div>

            {staticNavItems.slice(2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-bold tracking-[0.18em] uppercase text-ink-foreground/80 hover:text-primary transition-base relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground/80 hover:text-primary hover:bg-white/5 transition-base"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-white/5 transition-base"
                aria-label="Admin Dashboard"
              >
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}

            {user ? (
              <Link
                to="/account"
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-white/5 transition-base"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground/80 hover:text-primary hover:bg-white/5 transition-base"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground/80 hover:text-primary hover:bg-white/5 transition-base"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground/80 hover:text-primary hover:bg-white/5 transition-base"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-white/5 animate-fade-in max-h-[80vh] overflow-y-auto">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4">
              {staticNavItems.slice(0, 2).map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-bold tracking-[0.18em] uppercase text-ink-foreground/90 hover:text-primary transition-base border-b border-white/5"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="py-3 border-b border-white/5">
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2 block">Categories</span>
                <div className="flex flex-col pl-4 gap-3 mt-3">
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-bold tracking-[0.18em] uppercase text-ink-foreground/80 hover:text-primary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">No categories</span>
                  )}
                </div>
              </div>

              {staticNavItems.slice(2).map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-bold tracking-[0.18em] uppercase text-ink-foreground/90 hover:text-primary transition-base border-b border-white/5"
                >
                  {item.label}
                </Link>
              ))}
              
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-bold tracking-[0.18em] text-left uppercase text-primary transition-base border-b border-white/5"
                >
                  Admin Dashboard
                </Link>
              )}

              {user ? (
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-bold tracking-[0.18em] text-left uppercase text-primary transition-base border-none"
                >
                  Account
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    setAuthOpen(true);
                  }}
                  className="py-3 text-sm font-bold tracking-[0.18em] text-left uppercase text-primary transition-base border-none"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Scaffolded Modals */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
