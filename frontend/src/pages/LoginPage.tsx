import { useAuth0 } from "@auth0/auth0-react";
import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const nav = useNavigate();
  if (isAuthenticated) {
    nav("/");
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 bg-white text-black">
      {/* Icon Section */}
      <div className="mb-10 p-6 border-2 border-black rounded-full">
        <Lock size={40} strokeWidth={1.5} />
      </div>

      {/* Text Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          Access Denied. <br /> Members Only.
        </h1>
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500 max-w-280px mx-auto leading-relaxed">
          Please log in to your account to continue your journey with SnapBuy.
        </p>
      </div>

      {/* Button Section */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <button
          onClick={() => loginWithRedirect()}
          className="w-full bg-black text-white py-6 flex items-center justify-center gap-3 group hover:bg-zinc-800 transition-all duration-300"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.4em] ml-4">
            Log In Now
          </span>
          <ArrowRight
            size={16}
            className="group-hover:translate-x-2 transition-transform duration-300"
          />
        </button>

        <button
          onClick={() => window.history.back()}
          className="text-[9px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-all"
        >
          Go Back
        </button>
      </div>

      {/* Decorative Line */}
      <div className="mt-24 w-px h-20 bg-linear-to-b from-black to-transparent" />
    </div>
  );
};

export default LoginPage;
