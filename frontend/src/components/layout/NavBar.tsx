import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/ีuseUserStore";
import { useEffect, useState } from "react";
import { useCategoryStore } from "../../store/useCategoryStore";
import { Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import logo from "../assets/logo.png";

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
      navigate("/products"); // ถ้าว่างให้ไปหน้าสินค้าทั้งหมด
    }
  };
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo & Desktop Categories */}
          <div className="flex items-center gap-4 lg:gap-10">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-2xl">{isMobileMenuOpen ? "✕" : "☰"}</span>
            </button>

            <Link to="/" className="shrink-0">
              <img
                src={logo}
                alt="snapbuy"
                className="h-12 md:h-16 w-auto object-contain"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
              <Link
                to="/products"
                className="hover:text-gray-500 transition-colors"
              >
                Shop
              </Link>

              {/* Category Dropdown with Hover */}
              <div
                className="relative h-20 flex items-center"
                onMouseEnter={() => setIsCatOpen(true)}
                onMouseLeave={() => setIsCatOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 transition-colors ${isCatOpen ? "text-gray-500" : "text-gray-900"}`}
                >
                  Categories
                  <span
                    className={`text-[8px] transition-transform duration-300 ${isCatOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isCatOpen && (
                  <div className="absolute top-[80%] left-0 w-56 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 mb-1 border-b border-gray-50">
                      <span className="text-[9px] text-gray-400 font-bold tracking-widest">
                        SELECT CATEGORY
                      </span>
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        className="flex items-center justify-between px-5 py-2.5 text-[12px] text-gray-600 hover:bg-gray-50 hover:text-indigo-600 font-bold transition-all"
                      >
                        {cat.name}
                        <span className="opacity-0 group-hover:opacity-100">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {userFromDb?.role === "ADMIN" && (
                <Link to="/admin" className="text-red-500 hover:text-red-600">
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Center: Search (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full group">
              {/* ไอคอนแว่นขยายด้านซ้าย */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Search size={18} strokeWidth={2.5} />
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                // ปรับ className: เพิ่ม pl-11 เพื่อไม่ให้ตัวหนังสือทับไอคอน
                className="snap-input w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-100 rounded-full 
                 focus:bg-white transition-all duration-300 placeholder:text-gray-400 placeholder:font-medium"
              />

              {/* ปุ่มล้างคำค้นหา (โชว์เฉพาะเมื่อมีตัวอักษร) */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-5">
            <button onClick={openDrawer} className="relative">
              <ShoppingBag
                className="hover:text-gray-400 transition duration-200"
                size={25}
              />

              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-3 pl-2 border-l border-gray-100"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-[10px] font-black text-gray-900 leading-none mb-1 uppercase tracking-tighter">
                    {auth0User?.nickname || auth0User?.name}
                  </p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                    {userFromDb?.role || "Member"}
                  </p>
                </div>
                <img
                  src={auth0User?.picture}
                  alt="Profile"
                  className="w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-black transition-all p-0.5"
                />
              </Link>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="text-[11px] font-black uppercase tracking-widest bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📱 Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 py-6 px-6 space-y-6 animate-in slide-in-from-top duration-300 z-40">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
              Navigation
            </p>
            <Link
              to="/products"
              className="block text-lg font-bold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop All
            </Link>

            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-6">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="bg-gray-50 p-3 rounded-xl text-sm font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
