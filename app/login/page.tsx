"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { loginAction, signUpAction } from "../actions";
import { Loader2, Spade, User, Lock, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, null);
  const [signupState, signupFormAction, isSignupPending] = useActionState(signUpAction, null);
  const [logoError, setLogoError] = useState(false);

  const isPending = isLoginPending || isSignupPending;

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 relative overflow-hidden lounge-bg">
      {/* Background card suits watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-12 left-12 text-[140px] opacity-[0.03] text-white">♠</div>
        <div className="absolute bottom-12 right-12 text-[140px] opacity-[0.04] text-red-600">♦</div>
        <div className="absolute top-1/3 right-1/4 text-[140px] opacity-[0.04] text-red-600">♥</div>
        <div className="absolute bottom-1/3 left-1/4 text-[140px] opacity-[0.03] text-white">♣</div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md relative z-10 rounded-3xl bg-zinc-950/95 border border-red-900/40 p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-6">
        
        {/* Logo & Headline */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-red-950 border border-red-600/50 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            {!logoError ? (
              <Image
                src="/pokerfrerlogo.png"
                alt="POKER FRERE Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain rounded-xl"
                onError={() => setLogoError(true)}
                unoptimized
              />
            ) : (
              <Spade className="w-9 h-9 text-red-500 fill-red-500" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              POKER <span className="text-red-600 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]">FRERE</span>
            </h1>
            <p className="text-xs text-zinc-400 font-semibold tracking-wider mt-0.5 uppercase">
              High Stakes Poker Lounge & Financial Ledger
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-zinc-800">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "login"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Container */}
        {mode === "login" ? (
          <form action={loginFormAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-white outline-none transition-colors"
                />
              </div>
            </div>

            {loginState?.error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-600/40 text-red-400 text-xs font-bold">
                {loginState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoginPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entering Club...
                </>
              ) : (
                <>
                  Enter Lounge <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form action={signupFormAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="Choose your poker handle"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Create a secure password"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Invite Code
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="inviteCode"
                  type="text"
                  placeholder="Optional club invite code"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-white outline-none transition-colors"
                />
              </div>
            </div>

            {signupState?.error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-600/40 text-red-400 text-xs font-bold">
                {signupState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSignupPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Seat...
                </>
              ) : (
                <>
                  Claim Your Seat <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
