import type { OrderDetailModalProps } from "../../../../shared/types/order";
import React from "react";
import { useNavigate } from "react-router-dom";

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
}) => {
  const navigate = useNavigate();

  // ถ้าไม่มี order ส่งมา ไม่ต้องแสดงอะไรเลย
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
              #{order.id.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Item List */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {order.items?.map((item, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🖼️</span>
                    )}
                  </div>

                  <div>
                    <p className="font-black text-gray-900">
                      {item.product?.name || "Product Name"}
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Qty: {item.quantity} × ฿
                      {item.priceAtPurchase?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="font-black text-gray-900">
                  ฿
                  {(
                    item.quantity * (item.priceAtPurchase || 0)
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Summary Block */}
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              <span>Subtotal</span>
              <span>฿{order.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-gray-900 font-black text-xl pt-2">
              <span>Total</span>
              <span className="text-indigo-600">
                ฿{order.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 bg-gray-50/50 flex gap-3">
          {order.status === "PENDING" && (
            <button
              onClick={() => navigate(`/order-success/${order.id}`)}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
            >
              Go to Payment
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
