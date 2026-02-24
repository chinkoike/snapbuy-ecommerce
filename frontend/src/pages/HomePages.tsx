import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useEffect } from "react";
import { ProductCard } from "../components/ui/ProductCard";

const HomePage = () => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();

  const { products, fetchProducts, loading } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {isAuthenticated ? (
          /* ----- Authenticated View: ธีมเน้นความเรียบหรู ----- */
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-black pb-10 gap-6">
              <div className="space-y-1">
                <h2 className="text-4xl md:text-6xl font-light tracking-tighter italic leading-none">
                  WELCOME BACK,{" "}
                  <span className="font-black uppercase not-italic">
                    {user?.name?.split(" ")[0] || "GUEST"}
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-black"></span>
                  <p className="text-gray-500 tracking-[0.4em] uppercase text-[10px] md:text-xs">
                    Exclusive Curations for Premium Members
                  </p>
                </div>
              </div>

              <Link
                to="/products"
                className="group relative text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all"
              >
                <span className="relative z-10">View All Collections</span>
                <span className="absolute bottom-0 left-0 w-full h-2px bg-black transform origin-left transition-transform group-hover:scale-x-110"></span>
              </Link>
            </div>

            {/* Product Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {products
                    .filter((product) => product.isActive === true)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${index * 100}ms` }} // ให้ค่อยๆ โผล่มาทีละชิ้น
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-zinc-300">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    No items available in this collection.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* ----- Guest View:  ----- */
          <section className="animate-in zoom-in-95 duration-500">
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

            {/* Popular Products Header */}
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-xl font-black uppercase tracking-[0.2em]">
                Essentials
              </h3>
              <div className="h-0.5 flex-1 bg-black"></div>
            </div>

            {/* Grid แสดงสินค้า */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {loading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))
                : // แสดงสินค้าจริงเมื่อโหลดเสร็จ
                  products
                    .filter((product) => product.isActive === true)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer  */}
      <footer className="border-t border-gray-200 py-10 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em]">
          © 2026 SnapBuy — All Rights Reserved
        </p>
      </footer>
    </div>
  );
};
const ProductSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="relative aspect-square w-full bg-zinc-200 rounded-sm overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
    </div>

    <div className="space-y-2 px-1">
      <div className="h-3 bg-zinc-200 rounded-full w-2/3"></div>

      <div className="flex justify-between items-center">
        <div className="h-3 bg-zinc-200 rounded-full w-1/4"></div>
        <div className="h-3 bg-zinc-300 rounded-full w-1/6"></div>
      </div>
    </div>
  </div>
);
export default HomePage;
