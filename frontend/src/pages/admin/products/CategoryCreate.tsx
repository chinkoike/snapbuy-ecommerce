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
        // TypeScript จะยอมให้เข้าถึง .message ได้เพราะมั่นใจว่าเป็น Error object
        setStatus({ type: "error", msg: err.message });
      } else {
        setStatus({ type: "error", msg: "Something went wrong" });
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all">
      <h3 className="text-lg font-bold mb-4">Quick Add Category</h3>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Category Name..."
          className={`flex-1 px-4 py-2 rounded-xl border transition-all focus:outline-none focus:ring-2 
            ${status.type === "error" ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-black/5"}`}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-black hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-medium  disabled:bg-gray-400 focus:cursor-pointer transition-colors"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {/* UI Feedback Area */}
      {status.msg && (
        <p
          className={`text-sm font-medium animate-in fade-in duration-300 
          ${status.type === "success" ? "text-green-600" : "text-red-500"}`}
        >
          {status.type === "success" ? "✓ " : "⚠ "} {status.msg}
        </p>
      )}
    </div>
  );
};
