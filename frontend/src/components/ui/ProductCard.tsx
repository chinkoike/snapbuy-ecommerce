import type { ProductCardProps } from "../../../shared/types/product";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ใช้ as any เพื่อข้ามการตรวจ Type (ไม่แนะนำในระยะยาวแต่แก้ปัญหาได้ทันที)
    addToCart(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white group cursor-pointer transition-all duration-300"
    >
      {/* ส่วนรูปภาพ */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#F5F5F5]">
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />

        {/* Category Tag */}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white text-[10px] font-black uppercase tracking-widest px-2 py-1 shadow-sm z-10">
            {product.category.name}
          </span>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <button
            onClick={handleQuickAdd} // ✨ เรียกฟังก์ชันที่เราสร้างไว้
            className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-900"
          >
            Quick Add +
          </button>
        </div>
      </div>

      {/* รายละเอียดสินค้า */}
      <div className="py-5 px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold uppercase tracking-tight text-gray-900 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm font-medium text-gray-950">
            ฿{product.price.toLocaleString()}
          </p>
        </div>

        {/* เส้นขีดตกแต่ง */}
        <div className="h-px w-8 bg-gray-200 mt-3 group-hover:w-full group-hover:bg-black transition-all duration-500" />
      </div>
    </div>
  );
};
