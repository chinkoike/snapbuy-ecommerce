import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/ีuseUserStore";
import { useEffect, useState } from "react";
import { useCategoryStore } from "../../store/useCategoryStore";
import { Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loginWithRedirect, user: auth0User } = useAuth0();
  const userFromDb = useUserStore((state) => state.user);
  const { categories, fetchCategories } = useCategoryStore();
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { cart } = useCartStore();
  const navigate = useNavigate();
  useEffect(() => {
    // ตรวจสอบก่อนว่าถ้ายังมีข้อมูลไม่ครบ ให้โหลดใหม่
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories, fetchCategories]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // ส่งไปที่หน้า products พร้อม query string
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate("/products");
    }
  };
  return (
    <nav className="bg-white border-b border-black sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Left: Logo & Desktop Categories */}
          <div className="flex items-center gap-6 lg:gap-12">
            {/* Mobile Menu Button - ปรับให้เหลี่ยม */}
            <button
              className="md:hidden p-2 -ml-2 text-black hover:bg-zinc-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-xl font-light">
                {isMobileMenuOpen ? "✕" : "☰"}
              </span>
            </button>

            <Link to="/" className="shrink-0">
              <img
                src={logo}
                alt="snapbuy"
                className="h-10 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500"
              />
            </Link>

            {/* Desktop Nav - ฟอนต์เล็กลงแต่เน้นระยะห่าง (Kerning) */}
            <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
              <Link to="/products" className="relative group py-2">
                <span>Shop</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
              </Link>

              {/* Category Dropdown */}
              <div
                className="relative h-24 flex items-center group cursor-pointer"
                onMouseEnter={() => setIsCatOpen(true)}
                onMouseLeave={() => setIsCatOpen(false)}
              >
                <button
                  className={`flex items-center gap-2 transition-colors ${isCatOpen ? "text-zinc-400" : "text-black"}`}
                >
                  Categories
                  <span
                    className={`text-[7px] transition-transform duration-300 ${isCatOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu - ปรับเป็นทรงเหลี่ยม Shadow คมๆ */}
                {isCatOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white border border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] py-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-6 py-2 mb-2 border-b border-zinc-50">
                      <span className="text-[8px] text-zinc-400 font-black tracking-[0.3em]">
                        COLLECTIONS
                      </span>
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        className="flex items-center justify-between px-6 py-3 text-[11px] text-black hover:bg-black hover:text-white font-black transition-all uppercase tracking-widest"
                      >
                        {cat.name}
                        <span className="text-[14px]">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {userFromDb?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-red-500 hover:bg-red-50 px-2 py-1 border border-transparent hover:border-red-100 transition-all"
                >
                  Admin_Panel
                </Link>
              )}
            </div>
          </div>

          {/* Center: Search (Desktop) - ปรับจากทรงกลมเป็นทรงเหลี่ยม (Snap Input Style) */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex md:flex flex-1 max-w-sm mx-10"
          >
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:scale-110 transition-transform">
                <Search size={16} strokeWidth={3} />
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH CATALOGUE..."
                className="w-full pl-12 pr-10 py-3 bg-zinc-50 border border-zinc-100 focus:border-black focus:bg-white transition-all duration-300 text-[11px] font-bold tracking-widest uppercase outline-none rounded-sm"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={openDrawer} className="relative group p-2">
              <ShoppingBag
                className="group-hover:scale-110 transition-transform duration-300"
                size={22}
                strokeWidth={2}
              />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[7px] w-4 h-4 flex items-center justify-center font-black">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-4 pl-6 border-l border-zinc-100"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-[9px] font-black text-black leading-none mb-1 uppercase tracking-widest">
                    {auth0User?.nickname || auth0User?.name}
                  </p>
                  <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
                    {userFromDb?.role || "Verified Member"}
                  </p>
                </div>
                <div className="relative">
                  <img
                    src={auth0User?.picture}
                    alt="Profile"
                    className="w-8 h-8 border border-black p-0.5 hover:bg-black transition-all"
                  />
                </div>
              </Link>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="text-[10px] font-black uppercase tracking-[0.3em] border border-black px-6 py-3 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📱 Mobile Menu Overlay - ปรับให้เหลี่ยมและดู Clean ขึ้น */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b border-black py-8 px-8 space-y-8 animate-in slide-in-from-top duration-300 z-40 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[9px] font-black text-zinc-300 tracking-[0.4em] uppercase">
                Navigation
              </p>
              <Link
                to="/products"
                className="block text-2xl font-black uppercase tracking-tighter"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop Catalogue
              </Link>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <p className="text-[9px] font-black text-zinc-300 tracking-[0.4em] uppercase">
                Categories
              </p>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="flex justify-between items-center bg-zinc-50 px-5 py-4 text-xs font-black uppercase tracking-widest border border-transparent hover:border-black transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.name}
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
