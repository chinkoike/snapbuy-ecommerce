// frontend/src/components/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ต้องติดตั้ง react-router-dom
import type { ProductData } from "@/shared/types/product";
import { ProductService } from "../services/product.service";
import { ArrowLeft, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>(); // ดึง ID จาก URL
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const handleAddClick = () => {
    if (product) {
      addToCart(product); // ✨ กดปุ่มเดียว ได้ทั้งเพิ่มของ, เพิ่มเลข Badge และเปิดสไลด์
    }
  };
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ProductService.getById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);
  if (loading)
    return (
      <div className="min-h-screen bg-white animate-pulse">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-10"></div>
        </div>

        <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="aspect-4/5 bg-gray-100 rounded-sm"></div>{" "}
            {/* รูปสินค้าจำลอง */}
          </div>
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
            <div className="h-4 w-32 bg-gray-100 mb-4"></div>
            <div className="h-16 w-full bg-gray-200"></div>{" "}
            {/* หัวข้อสินค้าจำลอง */}
            <div className="h-8 w-24 bg-gray-100"></div>
            <div className="h-32 w-full bg-gray-50 mt-10"></div>
            <div className="h-16 w-full bg-gray-900/10 mt-10"></div>{" "}
            {/* ปุ่มจำลอง */}
          </div>
        </main>
      </div>
    );
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Navigation Bar แบบจางๆ */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-50 transition"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-xs font-black uppercase tracking-[0.4em]">
          SnapBuy.
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* ส่วนรูปภาพ (L: 7 Columns) */}
          <div className="lg:col-span-7">
            <div className="aspect-4/5 bg-[#F6F6F6] rounded-sm overflow-hidden flex items-center justify-center">
              <img
                src={product.imageUrl || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-1000"
              />
            </div>

            {/* Features เล็กๆ ใต้รูป */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-[#F6F6F6] p-4 flex items-center gap-3">
                <Truck size={18} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Express Delivery
                </span>
              </div>
              <div className="bg-[#F6F6F6] p-4 flex items-center gap-3">
                <ShieldCheck size={18} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Certified Quality
                </span>
              </div>
            </div>
          </div>

          {/* ส่วนข้อมูลสินค้า (R: 5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="black" />
                ))}
                <span className="text-[10px] font-bold ml-2 tracking-tighter">
                  (4.8/5.0)
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                {product.name}
              </h1>

              <p className="text-2xl font-light tracking-tight text-gray-500 pt-4">
                ฿{product.price.toLocaleString()}
              </p>
            </div>

            <div className="py-8 border-y border-gray-100 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 max-w-md">
                {product.description ||
                  "Sophisticated design meets unparalleled functionality. This piece represents our commitment to minimalist aesthetics and premium craftsmanship."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 space-y-4">
              <button
                onClick={handleAddClick}
                className="w-full bg-black text-white py-6 rounded-none text-xs font-black uppercase tracking-[0.3em] hover:bg-gray-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button className="w-full bg-white text-black border border-gray-200 py-6 rounded-none text-xs font-black uppercase tracking-[0.3em] hover:bg-gray-50 transition-all active:scale-[0.98]">
                Save to Wishlist
              </button>
            </div>

            {/* Additional Info */}
            <p className="mt-8 text-[9px] text-gray-400 leading-loose uppercase tracking-widest">
              Complimentary shipping on orders over ฿5,000.
              <br />
              14-day return policy. Secure checkout.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
