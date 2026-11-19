dashboard = """"use client";

import { useActionState, useRef, useState } from "react";
import { changePasswordAction } from "../actions";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import { Key, TrendingUp, TrendingDown, Award, Loader2, ShieldCheck, Camera, ChevronDown, ChevronUp } from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge from "../../components/RankBadge";
import PerformanceChart from "../../components/PerformanceChart";

interface PlayerDashboardProps {
  currentUser: { username: string };
  myUser: any;
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
  myUser,
  myGames,
  myStats,
}: PlayerDashboardProps) {
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState(changePasswordAction, null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(myUser?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const rank = getRankInfo(myStats.netBalance);
  
  const chartData = (() => {
    let running = 0;
    const result = [];
    const reversedGames = [...myGames].reverse();
    for (let i = 0; i < reversedGames.length; i++) {
      const game = reversedGames[i];
      const entry = game.players.find((p: any) => p.username === currentUser.username);
      running += entry?.score || 0;
      result.push({
        label: `G${i + 1}`,
        balance: running,
        date: new Date(game.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return result;
  })();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadError("File too large."); return; }
    setIsUploading(true); setUploadError(null);
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) setUploadError(data.error); else setAvatarUrl(data.url);
    } catch { setUploadError("Upload failed."); } finally { setIsUploading(false); }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      
      {/* Top Profile Banner - Poker Card Style */}
      <div className="relative bg-white text-black border-[4px] border-black rounded-3xl p-8 shadow-[10px_10px_0_#dc2626] overflow-hidden flex flex-col md:flex-row items-center gap-8">
        
        {/* Large Suit Background */}
        <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none select-none text-[30rem] leading-none text-black font-serif">♠</div>
        
        {/* Avatar Section */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group">
            <div className="p-2 bg-black rounded-full shadow-xl border-4 border-red-600 relative">
              <PlayerAvatar username={currentUser.username} avatarUrl={avatarUrl} size="xl" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-red-600 text-white p-3 rounded-full border-4 border-black hover:scale-110 transition-transform shadow-lg cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
          </div>
          {uploadError && <p className="text-red-600 text-xs font-bold mt-2 bg-red-100 px-2 py-1 rounded">{uploadError}</p>}
        </div>

        {/* Info Section */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tight">{currentUser.username}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
            <span className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-red-500" /> {rank.name} Rank
            </span>
            <span className="bg-zinc-200 text-black px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest">
              {myStats.gamesPlayed} Matches
            </span>
          </div>
        </div>

        {/* Big Net Balance */}
        <div className="relative z-10 bg-black text-white p-6 rounded-2xl border-4 border-zinc-800 text-center min-w-[200px]">
          <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Net Balance</span>
          <span className={`text-4xl font-black font-mono ${myStats.netBalance >= 0 ? "text-white" : "text-red-500"}`}>
            {myStats.netBalance > 0 ? "+" : ""}{formatTnd(myStats.netBalance)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Stats & Settings */}
        <div className="space-y-12">
          
          {/* Stats Chips */}
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-white font-black text-xl mb-6 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-600" /> Career Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-3xl font-black text-white mb-1">{myStats.wins}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sessions Won</span>
              </div>
              <div className="bg-black p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-3xl font-black text-red-600 mb-1">{myStats.losses}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sessions Lost</span>
              </div>
              <div className="col-span-2 bg-white text-black p-4 rounded-xl border-4 border-dashed border-zinc-300 text-center">
                <span className="block text-3xl font-black font-mono mb-1">{((myStats.wins / Math.max(1, myStats.gamesPlayed)) * 100).toFixed(1)}%</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Win Rate</span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-white font-black text-xl mb-6 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-600" /> Security
            </h2>
            <form action={passwordFormAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="password" name="newPassword" required className="w-full bg-black border-2 border-zinc-800 focus:border-red-600 text-white pl-10 pr-4 py-3 rounded-xl outline-none font-bold placeholder:text-zinc-700 transition-all" placeholder="Enter new password" minLength={6} />
                </div>
              </div>
              {passwordState?.error && <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-400 text-xs font-bold rounded-lg text-center">{passwordState.error}</div>}
              {passwordState?.success && <div className="p-3 bg-white/10 border border-white/30 text-white text-xs font-bold rounded-lg text-center">{passwordState.success}</div>}
              <button type="submit" disabled={isPasswordPending} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50">
                {isPasswordPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "UPDATE PASSWORD"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Chart & History */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Chart */}
          <div className="bg-white border-[4px] border-black rounded-3xl p-6 shadow-[8px_8px_0_#dc2626]">
            <h2 className="text-black font-black text-xl mb-6 uppercase tracking-wider">Performance Graph</h2>
            <div className="h-64 w-full">
              <PerformanceChart data={chartData} />
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl">
             <h2 className="text-white font-black text-xl mb-6 uppercase tracking-wider flex justify-between items-center">
               Recent Matches
               <span className="text-xs bg-red-600 px-3 py-1 rounded-full text-white">Last {Math.min(5, myGames.length)}</span>
             </h2>
             
             {myGames.length === 0 ? (
               <div className="text-center py-10 bg-black rounded-2xl border border-zinc-800 border-dashed">
                 <p className="text-zinc-500 font-bold uppercase tracking-widest">No matches played yet.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {myGames.slice(0, 5).map((game) => {
                   const entry = game.players.find((p: any) => p.username === currentUser.username);
                   if (!entry) return null;
                   const isWin = entry.score > 0;
                   const isLoss = entry.score < 0;
                   const isExpanded = expandedGame === game._id;

                   return (
                     <div key={game._id} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden transition-all hover:border-zinc-600">
                       <button onClick={() => setExpandedGame(isExpanded ? null : game._id)} className="w-full flex items-center justify-between p-4 cursor-pointer">
                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 ${isWin ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : isLoss ? "bg-red-600 text-white border-red-800 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                             {isWin ? "+" : isLoss ? "-" : "="}
                           </div>
                           <div className="text-left">
                             <div className="text-white font-bold text-sm">{new Date(game.date).toLocaleDateString()}</div>
                             <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{game.players.length} Players</div>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                           <span className={`text-2xl font-black font-mono ${isWin ? "text-white" : isLoss ? "text-red-500" : "text-zinc-500"}`}>
                             {entry.score > 0 ? "+" : ""}{entry.score}
                           </span>
                           {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                         </div>
                       </button>

                       {/* Expanded Details */}
                       {isExpanded && (
                         <div className="p-4 bg-zinc-950 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                           {game.players.sort((a:any, b:any) => b.score - a.score).map((p: any) => (
                             <div key={p.userId} className={`p-2 rounded-xl border flex items-center justify-between ${p.username === currentUser.username ? "bg-red-600/10 border-red-500/30" : "bg-zinc-900 border-zinc-800"}`}>
                               <span className="text-xs font-bold text-white uppercase truncate">{p.username}</span>
                               <span className={`text-xs font-black font-mono ${p.score > 0 ? "text-white" : p.score < 0 ? "text-red-400" : "text-zinc-500"}`}>
                                 {p.score > 0 ? "+" : ""}{p.score}
                               </span>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
""""

with open('app/dashboard/PlayerDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)
