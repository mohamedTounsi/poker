import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import Game from "../../models/Game";
import Navbar from "../../components/Navbar";
import { formatTnd } from "../../lib/utils";
import { Calendar, Users, History, DollarSign, ChevronDown } from "lucide-react";

export default async function HistoryPage() {
  const currentUser = await getUserFromCookie();

  if (!currentUser) {
    redirect("/login");
  }

  await connectToDatabase();

  let gamesDoc = [];
  if (currentUser.role === "admin") {
    gamesDoc = await Game.find({ status: "completed" }).sort({ date: -1 });
  } else {
    gamesDoc = await Game.find({
      status: "completed",
      "players.username": currentUser.username,
    }).sort({ date: -1 });
  }

  const games = JSON.parse(JSON.stringify(gamesDoc));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 flex flex-col transition-colors duration-200">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-850 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Match <span className="text-red-650 dark:text-red-500">History Log</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium">
              {currentUser.role === "admin"
                ? "Global log of all finalized poker games"
                : "Archive of poker games you played in"}
            </p>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
            <History className="w-12 h-12 text-zinc-400 dark:text-zinc-650 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No Match Logs Found</h3>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1 font-medium">
              There are no completed gameplay sessions recorded in the database.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {games.map((game: any) => {
              const totalPot = game.players.reduce(
                (sum: number, p: any) => (p.score > 0 ? sum + p.score : sum),
                0
              );

              return (
                <div
                  key={game._id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors duration-205"
                >
                  {/* Lobby Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-4 font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-zinc-950 dark:text-white text-base">
                          {new Date(game.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs font-mono font-medium mt-0.5">
                          Lobby ID: {game._id}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase block">Lobby Size</span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-1 mt-0.5 justify-end">
                          <Users className="w-4 h-4 text-red-650 dark:text-red-500" />
                          {game.players.length} Players
                        </span>
                      </div>
                      <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-4">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase block">Total Pot Size</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1 mt-0.5 justify-end font-mono">
                          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                          {formatTnd(totalPot)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Player Scores Sheet */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Scorecard</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {game.players.map((player: any) => {
                        const isWin = player.score > 0;
                        const isLoss = player.score < 0;

                        return (
                          <div
                            key={player.userId}
                            className={`p-3.5 rounded-xl border flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/60 font-semibold ${
                              isWin
                                ? "border-emerald-500/20 dark:border-emerald-500/10 shadow-sm"
                                : isLoss
                                ? "border-red-500/25 dark:border-red-500/20 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-850"
                            }`}
                          >
                            <span className="font-extrabold text-zinc-800 dark:text-zinc-300 capitalize text-sm truncate pr-2">
                              {player.username}
                            </span>
                            <span
                              className={`font-mono text-sm font-bold shrink-0 ${
                                isWin ? "text-emerald-600 dark:text-emerald-450" : isLoss ? "text-red-600 dark:text-red-500" : "text-zinc-500"
                              }`}
                            >
                              {player.score > 0 ? "+" : ""}
                              {formatTnd(player.score)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Accordion for Audit Logs */}
                  {game.transactions.length > 0 && (
                    <details className="group border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 overflow-hidden font-semibold">
                      <summary className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-950/80 hover:bg-zinc-200 dark:hover:bg-zinc-950 transition-colors cursor-pointer select-none text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <History className="w-4 h-4 text-red-605 dark:text-red-500" />
                          Audit Log ({game.transactions.length} Transactions)
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-open:rotate-180" />
                      </summary>
                      <div className="p-4 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20 space-y-2 max-h-48 overflow-y-auto">
                        {game.transactions.map((tx: any, idx: number) => (
                          <div
                            key={tx._id || idx}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                          >
                            <span className="text-zinc-650 dark:text-zinc-400 capitalize">
                              <strong className="text-red-650 dark:text-red-400 font-bold">{tx.toUser}</strong> borrowed{" "}
                              <strong className="text-zinc-900 dark:text-white font-mono font-bold">{formatTnd(tx.amount)}</strong> from{" "}
                              <strong className="text-zinc-800 dark:text-zinc-205 font-bold">{tx.fromUser}</strong>
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-600 font-mono">
                              {new Date(tx.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
