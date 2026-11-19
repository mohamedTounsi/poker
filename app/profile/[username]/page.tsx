import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUserFromCookie } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import Game from "../../../models/Game";
import Navbar from "../../../components/Navbar";
import PlayerAvatar from "../../../components/PlayerAvatar";
import RankBadge from "../../../components/RankBadge";
import PerformanceChart from "../../../components/PerformanceChart";
import { formatTnd } from "../../../lib/utils";
import { getRankInfo } from "../../../lib/rankUtils";
import {
  Trophy,
  Award,
  TrendingUp,
  MessageSquare,
  Settings,
  Swords,
  Coins,
  History,
  Flame,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).toLowerCase().trim();

  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();

  const targetUserDoc = await User.findOne({ username: decodedUsername }).lean();
  if (!targetUserDoc) notFound();

  const targetUser = JSON.parse(JSON.stringify(targetUserDoc));

  // Viewer user doc
  const viewerDoc = await User.findById(currentUser.userId).lean();
  const viewer = viewerDoc ? JSON.parse(JSON.stringify(viewerDoc)) : null;

  // Fetch games
  const allCompletedGames = await Game.find({ status: "completed" }).sort({ date: -1 }).lean();
  const completed = JSON.parse(JSON.stringify(allCompletedGames));

  // Filter games for target user
  const targetGames = completed.filter((g: any) =>
    g.players.some((p: any) => p.username === targetUser.username)
  );

  let netBalance = 0;
  let wins = 0;
  let losses = 0;
  let bestWin = 0;
  let worstLoss = 0;
  let totalRebuys = 0;

  targetGames.forEach((g: any) => {
    const entry = g.players.find((p: any) => p.username === targetUser.username);
    if (entry) {
      netBalance += entry.score;
      if (entry.score > 0) wins++;
      if (entry.score < 0) losses++;
      if (entry.score > bestWin) bestWin = entry.score;
      if (entry.score < worstLoss) worstLoss = entry.score;
      if (entry.rebuys) totalRebuys += entry.rebuys;
    }
  });

  const gamesCount = targetGames.length;
  const winRate = gamesCount > 0 ? ((wins / gamesCount) * 100).toFixed(1) : "0.0";
  const rank = getRankInfo(netBalance);

  // Calculate current streak
  let streakCount = 0;
  let streakType: "win" | "loss" | "none" = "none";

  for (const g of targetGames) {
    const entry = g.players.find((p: any) => p.username === targetUser.username);
    if (!entry) continue;
    if (entry.score > 0) {
      if (streakType === "none") {
        streakType = "win";
        streakCount = 1;
      } else if (streakType === "win") {
        streakCount++;
      } else break;
    } else if (entry.score < 0) {
      if (streakType === "none") {
        streakType = "loss";
        streakCount = 1;
      } else if (streakType === "loss") {
        streakCount++;
      } else break;
    } else {
      break;
    }
  }

  // Head-to-Head record vs viewer
  const isMe = currentUser.username.toLowerCase() === targetUser.username;
  let h2hGames = 0;
  let targetH2HWins = 0;
  let viewerH2HWins = 0;
  let h2hNetDiff = 0;

  if (!isMe) {
    completed.forEach((g: any) => {
      const targetEntry = g.players.find((p: any) => p.username === targetUser.username);
      const viewerEntry = g.players.find((p: any) => p.username === currentUser.username);

      if (targetEntry && viewerEntry) {
        h2hGames++;
        if (targetEntry.score > viewerEntry.score) targetH2HWins++;
        else if (viewerEntry.score > targetEntry.score) viewerH2HWins++;
        h2hNetDiff += targetEntry.score - viewerEntry.score;
      }
    });
  }

  // Chart data
  const chartData = (() => {
    let running = 0;
    const result = [];
    const reversed = [...targetGames].reverse();
    for (let i = 0; i < reversed.length; i++) {
      const g = reversed[i];
      const entry = g.players.find((p: any) => p.username === targetUser.username);
      running += entry?.score || 0;
      result.push({
        label: `G${i + 1}`,
        balance: running,
        date: new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return result;
  })();

  // Badges & Achievements
  const achievements = [];
  if (gamesCount >= 1) {
    achievements.push({
      title: "First Buy-In",
      desc: "Played 1st poker session",
      icon: "♠",
      unlocked: true,
    });
  }
  if (gamesCount >= 10) {
    achievements.push({
      title: "Table Regular",
      desc: "Played 10+ completed games",
      icon: "🎖️",
      unlocked: true,
    });
  }
  if (netBalance >= 50) {
    achievements.push({
      title: "High Roller",
      desc: "Accumulated +50 TND career net profit",
      icon: "💎",
      unlocked: true,
    });
  }
  if (streakType === "win" && streakCount >= 3) {
    achievements.push({
      title: "On Fire",
      desc: "3+ consecutive match winning streak",
      icon: "🔥",
      unlocked: true,
    });
  }
  if (targetUser.medals?.gold > 0) {
    achievements.push({
      title: "Gold Podium",
      desc: `${targetUser.medals.gold} 1st place finishes`,
      icon: "🥇",
      unlocked: true,
    });
  }

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: viewer?.avatarUrl || null,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-8">
        {/* Profile Header Hero Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-zinc-950/90 border border-red-900/40 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
            <div className="flex items-center">
              <PlayerAvatar
                username={targetUser.username}
                avatarUrl={targetUser.avatarUrl}
                size="xxl"
                rankScore={netBalance}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                  {targetUser.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold uppercase">
                  {rank.name}
                </span>
                {streakCount >= 2 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
                      streakType === "win"
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-950/60 text-red-400 border border-red-600/30"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {streakCount} {streakType} streak
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 max-w-md">
                {targetUser.bio || "No bio yet. The chips speak for themselves."}
              </p>

              {/* Action Buttons: Message or Edit */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                {!isMe ? (
                  <Link
                    href={`/chat?dm=${targetUser.username}`}
                    className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message {targetUser.username}
                  </Link>
                ) : (
                  <Link
                    href="/settings"
                    className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors border border-zinc-800"
                  >
                    <Settings className="w-3.5 h-3.5 text-red-500" /> Edit Profile & Bio
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Big Career Net Profit */}
          <div className="z-10 p-6 rounded-2xl bg-black border border-zinc-800 text-center min-w-[200px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
              Career Net Profit
            </span>
            <span
              className={`text-2xl sm:text-3xl font-mono font-black ${
                netBalance > 0 ? "text-emerald-400" : netBalance < 0 ? "text-red-500" : "text-white"
              }`}
            >
              {formatTnd(netBalance, true)}
            </span>
          </div>
        </div>

        {/* Head-to-Head Widget (if viewing someone else) */}
        {!isMe && (
          <div className="rounded-3xl p-6 bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-amber-950/20 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-100">
                  Head-to-Head Record vs You
                </h3>
                <p className="text-xs text-zinc-400">
                  Matches where both {currentUser.username} and {targetUser.username} competed
                </p>
              </div>
            </div>

            {h2hGames === 0 ? (
              <p className="text-xs text-zinc-500 font-semibold">
                You haven&apos;t faced each other at the table yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-black block">Matches</span>
                  <span className="text-xl font-mono font-black text-zinc-100">{h2hGames}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-black block">Score</span>
                  <span className="text-base font-black text-amber-400">
                    {targetUser.username} {targetH2HWins} - {viewerH2HWins} You
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-black block">Net Edge</span>
                  <span
                    className={`text-xl font-mono font-black ${
                      h2hNetDiff > 0 ? "text-rose-400" : h2hNetDiff < 0 ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    {h2hNetDiff > 0 ? `+${h2hNetDiff} (They lead)` : h2hNetDiff < 0 ? `${Math.abs(h2hNetDiff)} (You lead)` : "Even"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black block mb-0.5">Games</span>
            <span className="text-2xl font-mono font-black text-zinc-100">{gamesCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black block mb-0.5">Win Rate</span>
            <span className="text-2xl font-mono font-black text-emerald-400">{winRate}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black block mb-0.5">Best Win</span>
            <span className="text-sm sm:text-base font-mono font-black text-emerald-400">{formatTnd(bestWin, true)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black block mb-0.5">Worst Loss</span>
            <span className="text-sm sm:text-base font-mono font-black text-red-500">{formatTnd(worstLoss)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black block mb-0.5">Rebuys</span>
            <span className="text-2xl font-mono font-black text-white">{totalRebuys}</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black block mb-0.5">Medals</span>
            <span className="text-xl font-black text-white">
              🥇{targetUser.medals?.gold || 0} 🥈{targetUser.medals?.silver || 0}
            </span>
          </div>
        </div>

        {/* Career Graph & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl p-6 sm:p-8 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" /> Career Trajectory
            </h3>
            <div className="h-64 w-full pt-2">
              <PerformanceChart data={chartData} />
            </div>
          </div>

          {/* Badges / Achievements */}
          <div className="rounded-3xl p-6 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-red-500" /> Trophies & Badges
            </h3>
            <div className="space-y-2.5">
              {achievements.length === 0 ? (
                <p className="text-xs text-zinc-500 font-semibold text-center py-6">
                  No trophies unlocked yet.
                </p>
              ) : (
                achievements.map((a, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-black border border-zinc-850 flex items-center gap-3"
                  >
                    <span className="text-2xl shrink-0">{a.icon}</span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">{a.title}</h4>
                      <p className="text-[10px] text-zinc-400">{a.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="rounded-3xl p-6 sm:p-8 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <History className="w-4 h-4 text-red-500" /> Match Ledger
          </h3>
          {targetGames.length === 0 ? (
            <p className="text-xs text-zinc-500 font-semibold text-center py-6">
              No games on record for this player yet.
            </p>
          ) : (
            <div className="space-y-2">
              {targetGames.slice(0, 10).map((g: any) => {
                const entry = g.players.find((p: any) => p.username === targetUser.username);
                if (!entry) return null;
                const isWin = entry.score > 0;
                const isLoss = entry.score < 0;

                return (
                  <div
                    key={g._id}
                    className="p-3.5 rounded-2xl bg-black border border-zinc-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {new Date(g.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                        {g.players.length} players at table
                      </span>
                    </div>

                    <span
                      className={`font-mono font-black text-sm ${
                        isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-white"
                      }`}
                    >
                      {formatTnd(entry.score, true)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
