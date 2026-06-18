"use client";

import { useActionState } from "react";
import { changePasswordAction } from "../actions";
import { formatTnd } from "../../lib/utils";
import { Key, History, TrendingUp, TrendingDown, Award, Calendar, Loader2, ShieldCheck } from "lucide-react";

interface PlayerDashboardProps {
  currentUser: { username: string };
  myGames: any[];
  myStats: {
    netBalance: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
  };
}

export default function PlayerDashboard({
  currentUser,
  myGames,
  myStats,
}: PlayerDashboardProps) {
  // Password change state
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState(
    changePasswordAction,
    null
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Stats Grid - styled like playing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-200">
          <div className="absolute top-2 left-2 text-xs font-bold text-red-650 dark:text-red-500 select-none">♥</div>
          <div className="absolute bottom-2 right-2 text-xs font-bold text-red-650 dark:text-red-500 select-none rotate-180">♥</div>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider text-center">Net Balance</p>
          <h3 className={`text-2xl font-black font-mono mt-3 text-center ${
            myStats.netBalance > 0
              ? "text-emerald-600 dark:text-emerald-450"
              : myStats.netBalance < 0
              ? "text-red-600 dark:text-red-500"
              : "text-zinc-500"
          }`}>
            {formatTnd(myStats.netBalance)}
          </h3>
          <p className="text-[10px] text-zinc-450 text-center mt-1.5 font-medium">Overall profits / losses</p>
        </div>

        {/* Games Played Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-200">
          <div className="absolute top-2 left-2 text-xs font-bold text-zinc-950 dark:text-white select-none">♠</div>
          <div className="absolute bottom-2 right-2 text-xs font-bold text-zinc-950 dark:text-white select-none rotate-180">♠</div>

          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider text-center">Games Played</p>
          <h3 className="text-2xl font-black text-zinc-950 dark:text-white mt-3 text-center font-mono">
            {myStats.gamesPlayed}
          </h3>
          <p className="text-[10px] text-zinc-450 text-center mt-1.5 font-medium">Total game nights</p>
        </div>

        {/* Wins Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-200">
          <div className="absolute top-2 left-2 text-xs font-bold text-red-650 dark:text-red-500 select-none">♦</div>
          <div className="absolute bottom-2 right-2 text-xs font-bold text-red-650 dark:text-red-500 select-none rotate-180">♦</div>

          <p className="text-emerald-650 dark:text-emerald-450 text-xs font-bold uppercase tracking-wider text-center">Wins</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3 text-center font-mono">
            {myStats.wins}
          </h3>
          <p className="text-[10px] text-zinc-450 text-center mt-1.5 font-medium">Lobbies closed in profit (+)</p>
        </div>

        {/* Losses Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-200">
          <div className="absolute top-2 left-2 text-xs font-bold text-zinc-950 dark:text-white select-none">♣</div>
          <div className="absolute bottom-2 right-2 text-xs font-bold text-zinc-950 dark:text-white select-none rotate-180">♣</div>

          <p className="text-red-650 dark:text-red-500 text-xs font-bold uppercase tracking-wider text-center">Losses</p>
          <h3 className="text-2xl font-black text-red-600 dark:text-red-500 mt-3 text-center font-mono">
            {myStats.losses}
          </h3>
          <p className="text-[10px] text-zinc-450 text-center mt-1.5 font-medium">Lobbies closed in loss (-)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Match History (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-650 dark:text-red-500 rounded-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Your Match History</h2>
              <p className="text-zinc-550 dark:text-zinc-405 text-sm font-medium">Detailed logs of games you participated in</p>
            </div>
          </div>

          {myGames.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-12">
              You haven't participated in any games yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm font-bold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Lobby Players</th>
                    <th className="py-3 px-4 text-right">Your Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {myGames.map((game) => {
                    const myEntry = game.players.find(
                      (p: any) => p.username === currentUser.username
                    );
                    const myScore = myEntry?.score || 0;
                    const isPositive = myScore > 0;
                    const isNegative = myScore < 0;

                    return (
                      <tr key={game._id} className="text-zinc-805 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors font-semibold">
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            {new Date(game.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate font-medium">
                          {game.players.map((p: any) => p.username).join(", ")}
                        </td>
                        <td className={`py-4 px-4 text-right font-mono font-bold ${
                          isPositive ? "text-emerald-600 dark:text-emerald-400" : isNegative ? "text-red-600 dark:text-red-500" : "text-zinc-500"
                        }`}>
                          {isPositive ? "+" : ""}
                          {formatTnd(myScore)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Change Password Panel (Takes 1 column) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-650 dark:text-red-500 rounded-lg">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Change Password</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Update your account password</p>
            </div>
          </div>

          <form action={passwordFormAction} className="space-y-4">
            <div>
              <label className="block text-zinc-650 dark:text-zinc-400 text-xs font-semibold mb-1.5" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                placeholder="Enter current password"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white px-3 py-2.5 rounded-lg border border-zinc-250 dark:border-zinc-800 focus:border-red-605 dark:focus:border-red-505 focus:outline-none text-sm transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-zinc-655 dark:text-zinc-400 text-xs font-semibold mb-1.5" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                placeholder="At least 6 chars"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white px-3 py-2.5 rounded-lg border border-zinc-250 dark:border-zinc-800 focus:border-red-605 dark:focus:border-red-505 focus:outline-none text-sm transition-all font-semibold"
              />
            </div>

            {passwordState?.error && (
              <div className="text-red-650 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-xs p-2.5 rounded-lg text-center font-bold">
                {passwordState.error}
              </div>
            )}

            {passwordState?.success && (
              <div className="text-emerald-650 dark:text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 text-xs p-2.5 rounded-lg text-center font-bold flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {passwordState.success}
              </div>
            )}

            <button
              type="submit"
              disabled={isPasswordPending}
              className="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
