history_client = '''"use client";

import Link from "next/link";
import { formatTnd } from "../../../lib/utils";
import { History, Calendar, Users, Target, ArrowRight, ArrowDownRight, ArrowUpRight, CheckCircle, AlertTriangle, ArrowRightLeft } from "lucide-react";
import RankBadge from "../../../components/RankBadge";
import PlayerAvatar from "../../../components/PlayerAvatar";

interface HistoryClientProps {
  currentUser: { username: string; role: "admin" | "player" };
  allUsers: any[];
  allGames: any[];
}

export default function HistoryClient({
  currentUser,
  allUsers,
  allGames,
}: HistoryClientProps) {
  const isAdmin = currentUser.role === "admin";
  const completedGames = allGames.filter((g) => g.status === "completed").reverse();
  
  const getUserAvatar = (username: string) => {
    const user = allUsers.find(u => u.username === username);
    return user?.avatarUrl || null;
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      
      {/* Header Banner */}
      <div className="bg-white text-black border-[4px] border-black p-8 rounded-3xl shadow-[10px_10px_0_#dc2626] flex items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-[20rem] leading-none font-serif">♦</div>
        <div className="bg-black text-white p-4 rounded-full border-4 border-red-600 relative z-10">
          <History className="w-8 h-8" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black uppercase tracking-tight">Ledger & History</h1>
          <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest mt-1">
            {isAdmin ? "Global match archive" : "Your past match records"}
          </p>
        </div>
      </div>

      {completedGames.length === 0 ? (
        <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-12 text-center shadow-xl">
          <p className="text-zinc-500 font-bold uppercase tracking-widest">No completed matches available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedGames.map((game, idx) => {
            const isBalanced = game.players.reduce((sum: number, p: any) => sum + p.score, 0) === 0;
            const myEntry = game.players.find((p: any) => p.username === currentUser.username);
            const myScore = myEntry ? myEntry.score : 0;
            const iPlayed = !!myEntry;

            return (
              <div key={game._id} className="bg-black border-2 border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-500 transition-colors shadow-xl group">
                
                {/* Match Header */}
                <div className="bg-zinc-900 p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-zinc-800">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="bg-white text-black font-black text-2xl w-14 h-14 flex items-center justify-center rounded-xl border-2 border-black shadow-inner">
                      #{completedGames.length - idx}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Calendar className="w-4 h-4 text-red-600" />
                        {new Date(game.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                        <Users className="w-3 h-3" /> {game.players.length} Players
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    {!isBalanced && (
                      <span className="bg-red-900/30 text-red-500 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Unbalanced
                      </span>
                    )}
                    {iPlayed && !isAdmin && (
                      <div className={px-4 py-2 rounded-xl font-black font-mono text-xl border-2 }>
                        {myScore > 0 ? "+" : ""}{myScore} TND
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Details */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Scores */}
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b-2 border-zinc-800 pb-2">Final Scores</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {game.players.sort((a: any, b: any) => b.score - a.score).map((p: any) => {
                        const isMe = p.username === currentUser.username;
                        const pWin = p.score > 0;
                        const pLoss = p.score < 0;
                        return (
                          <div key={p.userId} className={lex items-center justify-between p-3 rounded-xl border-2 }>
                            <span className="font-bold uppercase truncate max-w-[100px]">{p.username}</span>
                            <span className={ont-black font-mono }>
                              {p.score > 0 ? "+" : ""}{p.score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b-2 border-zinc-800 pb-2">Ledger</h4>
                    {(!game.transactions || game.transactions.length === 0) ? (
                      <div className="p-4 rounded-xl border-2 border-dashed border-zinc-800 text-center">
                         <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No recorded transfers</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {game.transactions.map((tx: any, tIdx: number) => (
                          <div key={tIdx} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg">
                            <span className="text-white font-bold uppercase text-xs w-1/3 truncate">{tx.fromUser}</span>
                            <div className="flex items-center gap-1 bg-white text-black px-2 py-0.5 rounded-full font-black font-mono text-[10px]">
                              {formatTnd(tx.amount)}
                            </div>
                            <span className="text-red-500 font-bold uppercase text-xs w-1/3 text-right truncate">{tx.toUser}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
'''

with open('app/history/HistoryClient.tsx', 'w', encoding='utf-8') as f:
    f.write(history_client)
