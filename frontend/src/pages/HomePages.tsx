// src/pages/HomePage.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore"; // ดึงข้อมูลสินค้าจาก Store
import { useEffect } from "react";
import { ProductCard } from "../components/ui/ProductCard";

const HomePage = () => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();

  // สมมติว่าใน productStore มีสถานะ products และฟังก์ชัน fetchProducts
  const { products, fetchProducts, loading } = useProductStore();

  useEffect(() => {
    fetchProducts(); // โหลดข้อมูลสินค้าเมื่อหน้าจอถูกเปิด
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {isAuthenticated ? (
          /* ----- Authenticated View: ธีมเน้นความเรียบหรู ----- */
          <section className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-black pb-8 gap-4">
              <div>
                <h2 className="text-3xl md:text-5xl font-light tracking-tighter italic">
                  WELCOME BACK,{" "}
                  <span className="font-black uppercase">
                    {user?.name?.split(" ")[0]}
                  </span>
                </h2>
                <p className="text-gray-500 mt-2 tracking-widest uppercase text-xs">
                  Exclusive Curations for Premium Members
                </p>
              </div>
              <Link
                to="/products"
                className="text-sm font-bold border-b-2 border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition uppercase tracking-widest"
              >
                View All Collections
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {loading ? (
                <div className="col-span-full py-20 text-center animate-pulse tracking-widest uppercase">
                  Loading Inventory...
                </div>
              ) : (
                products.slice(0, 6).map((product) => (
                  <div key={product.id} className="group cursor-pointer">
                    <div className="relative aspect-4/5 bg-gray-100 overflow-hidden mb-4">
                      <img
                        src={
                          product.imageUrl ||
                          "https://via.placeholder.com/400x500"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold uppercase tracking-widest">
                          Sold Out
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold uppercase text-sm tracking-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">
                          Member Price Available
                        </p>
                      </div>
                      <p className="font-black">
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>
                    <button className="mt-4 w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition">
                      Add to Bag
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : (
          /* ----- Guest View: ธีมเน้นความ Impact ขาวดำจัดจ้าน ----- */
          <section className="animate-in zoom-in-95 duration-500">
            {/* Hero Section */}
            <div className="bg-black text-white p-8 md:p-20 text-center mb-16 rounded-sm">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-none">
                Snap
                <br className="md:hidden" />
                Buy.
              </h1>
              <p className="text-gray-400 text-sm md:text-lg max-w-xl mx-auto mb-10 tracking-widest uppercase font-light">
                Modern Essentials. Minimalist Design. Exclusive Access for
                Members.
              </p>
              <button
                onClick={() => loginWithRedirect()}
                className="bg-white text-black px-10 py-4 font-black uppercase text-sm tracking-[0.3em] hover:bg-gray-200 transition"
              >
                Join the Club
              </button>
            </div>

            {/* Popular Products */}
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-xl font-black uppercase tracking-[0.2em]">
                Essentials
              </h3>
              <div className="h-0.5 flex-1 bg-black"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer จบงานแบบขาวดำ */}
      <footer className="border-t border-gray-200 py-10 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em]">
          © 2026 SnapBuy — All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
