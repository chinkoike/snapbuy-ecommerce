import { useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { useOrderStore } from "../store/useOrderStore";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCartStore();
  const { createOrder, loading } = useOrderStore();
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: user?.email ?? "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();

      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl ?? undefined,
        })),
        totalPrice: totalPrice(),
        shippingAddress: form,
        paymentMethod: "PROMPTPAY" as const,
      };

      const result = await createOrder(orderData, token);

      if (result) {
        clearCart();
        navigate(`/order-success/${result.id}`);
      }
    } catch (err) {
      console.error("Order failed", err);
    }
  };
  if (loading)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Loading...
        </p>
      </div>
    );
  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tighter">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigate("/products")}
          className="text-xs font-black uppercase underline tracking-widest"
        >
          Return to shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back button & Title */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-12 hover:opacity-50"
        >
          <ChevronLeft size={14} /> Back to Cart
        </button>

        <form
          onSubmit={handleCheckout}
          className="grid grid-cols-1 lg:grid-cols-12 gap-20"
        >
          {/* Left: Shipping Details (7 Columns) */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-xl font-black italic">01</span>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">
                  Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    First Name
                  </label>
                  <input
                    required
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    Last Name
                  </label>
                  <input
                    required
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm"
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    Phone Number
                  </label>
                  <input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm"
                    placeholder="+66 81 234 5678"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    Full Address
                  </label>
                  <textarea
                    required
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm min-h-100px resize-none"
                    placeholder="Street name, Building, Province, Postcode"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-xl font-black italic">02</span>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">
                  Payment Method
                </h2>
              </div>
              <div className="p-6 border border-black flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">
                  PromptPay / QR Code
                </span>
                <div className="w-4 h-4 rounded-full border-4 border-black"></div>
              </div>
            </section>
          </div>

          {/* Right: Order Summary (5 Columns) */}
          <div className="lg:col-span-5">
            <div className="bg-[#F9F9F9] p-10 sticky top-32">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8">
                Your Order
              </h2>

              <div className="max-h-300px overflow-y-auto mb-8 space-y-6 pr-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-4"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 shrink-0">
                        <img
                          src={item.imageUrl || undefined}
                          alt={item.name}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-1">
                          QTY: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  {/* ✨ เติม () ต่อท้าย totalPrice */}
                  <span>฿{totalPrice().toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span> {/* หรือค่าที่คุณกำหนด */}
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-2xl font-light">
                    {/* เติม () ต่อท้าย totalPrice */}฿
                    {totalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full bg-black text-white py-6 mt-10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300"
              >
                {loading ? "Processing..." : "Confirm and Pay"}
                {!loading && <Lock size={12} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CheckoutPage;
