"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div
      className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 relative overflow-hidden"
      style={{ background: "#0a0e1a" }}
    >
      {/* Animated background suits */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-8 left-8 text-[120px] opacity-[0.04] text-white suit-pulse">♠</div>
        <div className="absolute bottom-8 right-8 text-[120px] opacity-[0.04] text-red-500 suit-pulse" style={{ animationDelay: "2s" }}>♦</div>
        <div className="absolute top-1/3 right-1/5 text-[120px] opacity-[0.04] text-red-400 suit-pulse" style={{ animationDelay: "4s" }}>♥</div>
        <div className="absolute bottom-1/3 left-1/5 text-[120px] opacity-[0.04] text-white suit-pulse" style={{ animationDelay: "6s" }}>♣</div>
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#3d5a80 1px, transparent 1px), linear-gradient(90deg, #3d5a80 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glow blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(224,48,48,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="w-full max-w-md relative z-10 card-deal"
        style={{
          background: "rgba(17,24,39,0.9)",
          border: "1px solid #1f2d45",
          borderRadius: "20px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Top corner decorations */}
        <div className="absolute top-4 left-4 text-red-500 flex flex-col items-center leading-none select-none">
          <span className="text-sm font-black" style={{ fontFamily: "var(--font-orbitron)" }}>A</span>
          <span className="text-lg leading-none">♥</span>
        </div>
        <div className="absolute bottom-4 right-4 text-red-500 flex flex-col items-center leading-none select-none rotate-180">
          <span className="text-sm font-black" style={{ fontFamily: "var(--font-orbitron)" }}>A</span>
          <span className="text-lg leading-none">♥</span>
        </div>

        <div className="p-8 space-y-7">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(224,48,48,0.12)",
                border: "1px solid rgba(224,48,48,0.35)",
                boxShadow: "0 0 30px rgba(224,48,48,0.2)",
              }}
            >
              <span className="text-4xl">♠</span>
            </div>
            <div className="text-center">
              <h1
                className="text-3xl font-black text-white tracking-wider"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                POKER<span className="text-red-400">ZONE</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-1.5 font-medium" style={{ fontFamily: "var(--font-rajdhani)" }}>
                Track · Rank · Dominate
              </p>
            </div>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#6b7a99", fontFamily: "var(--font-rajdhani)" }}
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your username"
                className="game-input w-full px-4 py-3 text-sm font-semibold"
                style={{ fontFamily: "var(--font-rajdhani)" }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#6b7a99", fontFamily: "var(--font-rajdhani)" }}
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="game-input w-full px-4 py-3 text-sm font-semibold"
                style={{ fontFamily: "var(--font-rajdhani)" }}
              />
            </div>

            {state?.error && (
              <div
                className="text-sm font-bold p-3 rounded-xl text-center"
                style={{
                  background: "rgba(224,48,48,0.1)",
                  border: "1px solid rgba(224,48,48,0.3)",
                  color: "#f87171",
                  fontFamily: "var(--font-rajdhani)",
                }}
              >
                ⚠ {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm tracking-widest"
              style={{ fontFamily: "var(--font-orbitron)", marginTop: "8px" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SIGNING IN...
                </>
              ) : (
                "ENTER THE GAME"
              )}
            </button>
          </form>

          {/* Admin hint */}
          <div
            className="text-center p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1f2d45",
              fontFamily: "var(--font-rajdhani)",
            }}
          >
            <span className="text-xs text-red-400 font-bold block mb-1">First time?</span>
            <span className="text-xs text-zinc-500 font-medium">
              Use{" "}
              <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded font-bold">admin</code>
              {" / "}
              <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded font-bold">adminpassword123</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
