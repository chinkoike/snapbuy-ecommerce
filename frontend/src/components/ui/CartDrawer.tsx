// src/components/CartDrawer.tsx
import { useCartStore } from "../../store/useCartStore";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    totalPrice,
  } = useCartStore();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-hidden font-sans">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-100 bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">
            Your Bag ({cart.length})
          </h2>
          <button
            onClick={closeDrawer}
            className="hover:rotate-90 transition-transform duration-300"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-400">
              <ShoppingBag size={40} strokeWidth={1} className="mb-4" />
              <p className="text-[10px] uppercase tracking-widest">
                Bag is empty
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex py-6 border-b border-gray-50 group"
              >
                <div className="w-20 h-24 bg-gray-50 shrink-0 overflow-hidden">
                  <img
                    src={item.imageUrl || undefined}
                    alt={item.name}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      {item.name}
                    </h3>
                    <p className="text-[10px] font-bold">
                      ฿{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    {/* กลุ่มซ้าย: ตัวปรับจำนวน */}
                    <div className="flex items-center border border-gray-100 w-fit">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-1 hover:bg-gray-50"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="px-3 text-[10px] font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-1 hover:bg-gray-50"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    {/* กลุ่มขวา: ปุ่มลบ */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="group"
                    >
                      <Trash2
                        size={18} // ปรับขนาดให้เข้ากับดีไซน์รวมๆ
                        strokeWidth={1.5}
                        className="group-hover:text-gray-300 :text-black transition-colors"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-8 border-t border-gray-100 bg-white">
            <div className="flex justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest">
                Subtotal
              </span>
              <span className="text-lg font-black tracking-tighter">
                ฿{totalPrice().toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                navigate("/cart");
                closeDrawer();
              }}
              className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-900 transition mb-3"
            >
              View Full Bag
            </button>
            <button
              onClick={() => {
                navigate("/checkout");
                closeDrawer();
              }}
              className="w-full border border-black text-black py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition"
            >
              Quick Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
