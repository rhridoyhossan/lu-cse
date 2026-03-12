"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Lock, User, ShieldAlert, ArrowRight, Eye, EyeOff, Cpu } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("ERR_INVALID_CREDENTIALS");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  useEffect(() => {
    document.title = "Login";
  }, []);

  return (
    <div className="relative flex flex-1 items-center justify-center font-mono overflow-hidden p-4 sm:p-6">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-size-[2rem_2rem] sm:bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_90%_60%_at_50%_50%,#000_70%,transparent_100%)] sm:mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-160 sm:h-160 bg-cyan-900/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="animate-fade w-full max-w-md relative z-10 bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-shadow duration-500 backdrop-blur-md overflow-hidden group/card"
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-size-[100%_4px] opacity-20 rounded-2xl z-20" />

        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none hidden sm:block">
          <Cpu size={140} className="text-cyan-400 group-hover/card:text-cyan-200 transition-colors" />
        </div>

        <div className="relative z-30">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-cyan-950/50 border border-cyan-400/50 text-cyan-400 flex items-center justify-center shadow-none group-hover/card:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-shadow duration-500">
              <Terminal size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2
                data-text="SYS_ACCESS"
                className="glitch text-xl sm:text-2xl font-bold text-white tracking-widest uppercase truncate"
              >
                SYS_ACCESS
              </h2>
              <p className="text-[9px] sm:text-[10px] text-cyan-500/80 uppercase tracking-widest mt-0.5 sm:mt-1 truncate">
                Establish Secure Connection...
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-500/50 p-3 text-xs text-red-400 font-bold tracking-wider animate-in fade-in slide-in-from-top-2">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5 sm:mb-6 group">
            <label className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
              <User size={12} /> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-3 sm:p-3.5 text-sm text-slate-200 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:bg-slate-900 transition-all placeholder:text-slate-700"
              placeholder="username"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6 sm:mb-8 group relative">
            <label className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
              <Lock size={12} /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-3 sm:p-3.5 pr-12 text-sm text-slate-200 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:bg-slate-900 transition-all placeholder:text-slate-700 font-mono tracking-widest"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 focus:outline-none transition-colors p-1 cursor-pointer"
              >
                <div
                  className={`transition-transform duration-300 ${showPassword ? "scale-110" : "scale-100"}`}
                >
                  {showPassword ? (
                    <EyeOff size={16} className="sm:w-4.5 sm:h-4.5" />
                  ) : (
                    <Eye size={16} className="sm:w-4.5 sm:h-4.5" />
                  )}
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-cyan-950/40 border border-cyan-500/50 p-3.5 sm:p-4 text-xs font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-900/60 hover:border-cyan-300 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <div className="absolute inset-0 bg-cyan-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            {loading ? (
              <span className="flex items-center gap-2 sm:gap-3 relative z-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                Decrypting...
              </span>
            ) : (
              <span className="flex items-center gap-2 relative z-10">
                INITIATE_LOGIN()
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}