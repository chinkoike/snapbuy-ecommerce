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
    <div className="min-h-screen bg-white font-sans text-black">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">
          Shopping Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* รายการสินค้า (L: 8 Columns) */}
          <div className="lg:col-span-8">
            <div className="border-t border-gray-100">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex py-8 border-b border-gray-100 group"
                >
                  {/* รูปสินค้า */}
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-[#F6F6F6] overflow-hidden rounded-sm shrink-0">
                    <img
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* รายละเอียดสินค้า */}
                  <div className="ml-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          Article No. {item.id.slice(-6)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-black transition-colors"
                      >
                        <Trash2
                          size={24}
                          strokeWidth={1.5}
                          className="text-black duration-150 hover:text-gray-400"
                        />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* ตัวปรับจำนวน */}
                      <div className="flex items-center border border-gray-200 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-50 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-50 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="text-sm font-bold tracking-tighter">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* สรุปยอด (R: 4 Columns) */}
          <div className="lg:col-span-4">
            <div className="bg-[#F9FAFB] p-8 rounded-sm sticky top-24">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                  <span>Subtotal</span>
                  <span>฿{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                  <span>Shipping</span>
                  <span className="text-black">Free</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-2xl font-black tracking-tighter">
                    ฿{totalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-black text-white py-6 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-900 transition active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>

              <div className="mt-8 space-y-3">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-loose">
                  Prices and shipping costs are not confirmed until you reach
                  checkout.
                  <br />
                  14-day withdrawal. Read more about returns and refunds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
