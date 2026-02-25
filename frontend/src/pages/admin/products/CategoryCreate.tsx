import { useState } from "react";
import { useCategoryStore } from "../../../store/useCategoryStore";
import { useAuth0 } from "@auth0/auth0-react";

export const CategoryCreate = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    msg: string;
  }>({
    type: null,
    msg: "",
  });
  const { addCategory, loading } = useCategoryStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setStatus({ type: null, msg: "" }); // Reset status

    try {
      const token = await getAccessTokenSilently();
      await addCategory(name, token);
      setName("");
      setStatus({ type: "success", msg: "สร้างหมวดหมู่สำเร็จแล้ว!" });

      // หายไปเองหลังจาก 3 วินาที
      setTimeout(() => setStatus({ type: null, msg: "" }), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus({ type: "error", msg: err.message });
      } else {
        setStatus({ type: "error", msg: "Something went wrong" });
      }
    }
  };

  return (
    <div className="bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group transition-all duration-300">
      {/* Label เล็กๆ ด้านบนเพิ่มความ High-end */}
      <p className="text-[9px] font-black text-zinc-400 tracking-[0.4em] uppercase mb-2">
        Database_Entry
      </p>

      <h3 className="text-xl font-black mb-6 uppercase tracking-tighter italic">
        Quick_Add_Category
      </h3>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-0 mb-4 border border-black overflow-hidden bg-black"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="CATEGORY_NAME_REQUIRED..."
          className={`flex-1 px-5 py-4 text-[11px] font-bold tracking-widest uppercase focus:outline-none bg-white transition-all
        ${status.type === "error" ? "text-red-500 placeholder:text-red-300" : "text-black placeholder:text-zinc-300"}`}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 disabled:bg-zinc-300 transition-all cursor-pointer border-l border-black sm:border-l"
        >
          {loading ? "Processing..." : "Submit_Add"}
        </button>
      </form>

      {/* UI Feedback Area - ปรับให้ดูเป็น System Message */}
      <div className="min-h-5">
        {status.msg && (
          <p
            className={`text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-left duration-300 
        ${status.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {status.type === "success" ? ">> Success: " : ">> Error: "}
            <span className="opacity-70">{status.msg}</span>
          </p>
        )}
      </div>
    </div>
  );
};
