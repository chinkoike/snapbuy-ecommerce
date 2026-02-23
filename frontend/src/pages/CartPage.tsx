import { useCartStore } from "../store/useCartStore";
import { Trash2, Plus, Minus, ShoppingBag, ArrowDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCartStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <div className="max-w-7xl mx-auto px-6 h-[70vh] flex flex-col justify-center items-center">
          <ShoppingBag
            size={48}
            strokeWidth={1}
            className="mb-6 text-gray-300"
          />
          <h1 className="text-xl font-black uppercase tracking-[0.3em] mb-4">
            Your bag is empty
          </h1>
          <p className="text-gray-500 text-sm mb-8 italic">
            Items remain in your bag for 30 days.
          </p>
          <Link
            to="/products"
            className="flex flex-col items-center text-gray-600 group-hover  hover:text-gray-400 duration-100 btn-snap btn-black px-12 py-4"
          >
            <ArrowDown className="cursor-pointer" />
            <button className="cursor-pointer ">Explore Collection</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-black animate-in fade-in duration-700">
      <main className="max-w-350 mx-auto px-6 py-16 md:py-24">
        {/* Page Header - เน้นความกว้างและการขีดเส้นแบ่งส่วน */}
        <div className="border-b-4 border-black pb-8 mb-16 flex justify-between items-end">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
            Bag_Summary
          </h1>
          <p className="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase hidden md:block">
            Verification_Phase_01
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* รายการสินค้า (L: 8 Columns) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-0">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex py-10 border-b border-zinc-200 group transition-all"
                >
                  {/* รูปสินค้า: ทรงเหลี่ยมคมพร้อมเงา Solid */}
                  <div className="w-28 h-36 md:w-40 md:h-52 bg-white border border-zinc-100 overflow-hidden shrink-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.03)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    <img
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>

                  {/* รายละเอียดสินค้า */}
                  <div className="ml-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-tight group-hover:italic transition-all">
                          {item.name}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                          SKU: {item.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 border border-transparent hover:border-black hover:rotate-90 transition-all duration-300 cursor-pointer"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="mt-auto flex justify-between items-end">
                      {/* ตัวปรับจำนวน: แบบ Minimal Box */}
                      <div className="flex items-center border-2 border-black bg-white h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-10 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="w-12 text-center text-xs font-black">
                          {item.quantity.toString().padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-10 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors border-l border-zinc-100"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      <p className="text-xl font-black tracking-tighter">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* สรุปยอด (R: 4 Columns) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border-2 border-black p-10 sticky top-24 shadow-[15px_15px_0px_0px_rgba(0,0,0,0.05)]">
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] mb-10 text-zinc-400 border-b border-zinc-100 pb-4">
                Order_Valuation
              </h2>

              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-400">Net_Subtotal</span>
                  <span>฿{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-400">Logistics_Fee</span>
                  <span className="text-green-600 italic">Complementary</span>
                </div>

                <div className="pt-8 border-t-2 border-black flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-[0.3em]">
                    Total_Amount
                  </span>
                  <span className="text-4xl font-black tracking-tighter italic">
                    ฿{totalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all active:scale-[0.97] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer"
              >
                Checkout_Process
              </button>

              <div className="mt-10 pt-6 border-t border-zinc-100">
                <div className="flex items-start gap-3 opacity-40">
                  <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                    Prices are inclusive of VAT. Final tax assessment will be
                    conducted at the payment gateway.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="max-w-350 mx-auto px-6 pb-20 opacity-10 flex justify-between text-[10px] font-black uppercase tracking-[0.5em]">
        <span>Secure_Checkout_Active</span>
        <span>Global_Shipping_Available</span>
      </div>
    </div>
  );
};

export default CartPage;
