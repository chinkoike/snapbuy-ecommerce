import type { OrderDetailModalProps } from "../../../../shared/types/order";
import React from "react";
import { useNavigate } from "react-router-dom";

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl border border-black overflow-hidden shadow-[30px_30px_0px_0px_rgba(255,255,255,0.1)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - สไตล์ Industrial Minimal */}
        <div className="p-8 border-b border-zinc-100 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter italic">
              Order_Details
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-[0.2em]">
                ID: {order.id.split("-")[0].toUpperCase()}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                / {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:rotate-90 transition-transform duration-300 font-light text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Item List - ปรับให้เหมือนรายการในนิตยสาร */}
        <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {order.items?.map((item, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center group pb-6 border-b border-zinc-50 last:border-0"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-black text-zinc-300 uppercase">
                        No_Img
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-black text-black uppercase tracking-tight text-lg">
                      {item.product?.name || "Product Name"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        Qty {item.quantity}
                      </p>
                      <span className="h-1 w-1 bg-zinc-200 rounded-full"></span>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        Unit ฿{item.priceAtPurchase?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="font-black text-black text-lg tracking-tighter">
                  ฿
                  {(
                    item.quantity * (item.priceAtPurchase || 0)
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Block - เน้น Typography หนาชัด */}
        <div className="p-8 bg-zinc-50 border-t border-black">
          <div className="space-y-4">
            <div className="flex justify-between text-zinc-500 font-black uppercase tracking-[0.3em] text-[9px]">
              <span>Subtotal_Value</span>
              <span>฿{order.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-500 font-black uppercase tracking-[0.3em] text-[9px]">
              <span>Logistics / Shipping</span>
              <span className="text-black italic underline decoration-1 underline-offset-4">
                Complimentary
              </span>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-200 flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                Total_Amount
              </span>
              <span className="text-4xl font-black text-black tracking-tighter">
                ฿{order.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer Action - ปุ่มเหลี่ยมที่มีน้ำหนัก */}
          <div className="mt-10 flex gap-4">
            {order.status === "PENDING" && (
              <button
                onClick={() => navigate(`/order-success/${order.id}`)}
                className="flex-2 bg-black text-white py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-800 transition-all border border-black active:scale-[0.98]"
              >
                Execute Payment
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-transparent border border-zinc-300 text-black py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:border-black transition-all active:scale-[0.98]"
            >
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
