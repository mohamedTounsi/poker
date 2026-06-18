"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { Spade, User, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 transition-colors duration-200 relative overflow-hidden">
      {/* Decorative Poker Suits floating in the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 select-none">
        <div className="absolute top-10 left-10 text-9xl text-zinc-950 dark:text-white suit-pulse">♠</div>
        <div className="absolute bottom-10 right-10 text-9xl text-red-600 dark:text-red-550 suit-pulse" style={{ animationDelay: '2s' }}>♦</div>
        <div className="absolute top-1/3 right-1/4 text-9xl text-red-650 dark:text-red-500 suit-pulse" style={{ animationDelay: '4s' }}>♥</div>
        <div className="absolute bottom-1/3 left-1/4 text-9xl text-zinc-950 dark:text-white suit-pulse" style={{ animationDelay: '6s' }}>♣</div>
      </div>

      {/* Main card box styled like a physical poker card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-8 relative z-10 transition-colors duration-200">
        
        {/* Suit markers in corners, resembling a real playing card */}
        <div className="absolute top-3 left-3 text-sm font-bold text-red-600 dark:text-red-500 flex flex-col items-center">
          <span>A</span>
          <span className="leading-none mt-0.5">♥</span>
        </div>
        <div className="absolute bottom-3 right-3 text-sm font-bold text-red-600 dark:text-red-500 flex flex-col items-center rotate-180">
          <span>A</span>
          <span className="leading-none mt-0.5">♥</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 dark:border-red-500/30 rounded-full mb-3 text-red-600 dark:text-red-550 animate-pulse">
            <Spade className="w-10 h-10 fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Poker <span className="text-red-650 dark:text-red-500">Tracker</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium">Manage gameplays and balances with friends</p>
        </div>

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <User className="w-5 h-5" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Enter username"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white pl-10 pr-4 py-3 rounded-lg border border-zinc-250 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500 focus:outline-none transition-all duration-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter password"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white pl-10 pr-4 py-3 rounded-lg border border-zinc-250 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500 focus:outline-none transition-all duration-200 font-medium"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-red-650 dark:text-red-400 bg-red-550/10 border border-red-500/20 text-sm p-3 rounded-lg text-center font-bold">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold tracking-wide transition-all duration-200 shadow-[0_4px_15px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 text-center">
          <div className="bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3.5 text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
            <span className="font-bold text-red-650 dark:text-red-400 block mb-1">First-time login?</span>
            Use admin credentials:<br />
            <code className="text-zinc-800 dark:text-white bg-zinc-200 dark:bg-zinc-900 px-1 py-0.5 rounded font-bold">admin</code> / <code className="text-zinc-800 dark:text-white bg-zinc-200 dark:bg-zinc-900 px-1 py-0.5 rounded font-bold">adminpassword123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
