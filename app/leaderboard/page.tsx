import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import Game from "../../models/Game";
import Navbar from "../../components/Navbar";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge, { RankTable } from "../../components/RankBadge";
import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();

  // Fetch all players
  const users = await User.find({ role: "player" }).lean();
  const completedGames = await Game.find({ status: "completed" }).lean();

  // Compute net balance per player
  const balances: Record<string, number> = {};
  const gamesPlayed: Record<string, number> = {};

  users.forEach((u: any) => {
    balances[u.username] = 0;
    gamesPlayed[u.username] = 0;
  });

  completedGames.forEach((game: any) => {
    game.players.forEach((p: any) => {
      if (balances[p.username] !== undefined) {
        balances[p.username] += p.score;
        gamesPlayed[p.username] = (gamesPlayed[p.username] || 0) + 1;
      }
    });
  });

  // Sort players by balance desc
  const sorted = JSON.parse(JSON.stringify(users)).sort(
    (a: any, b: any) => (balances[b.username] || 0) - (balances[a.username] || 0)
  );

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: null as string | null,
    netBalance: 0,
  };

  if (currentUser.role === "player") {
    navUser.netBalance = balances[currentUser.username] || 0;
    const me = users.find((u: any) => u.username === currentUser.username) as any;
    navUser.avatarUrl = me?.avatarUrl || null;
  }

  const podiumOrder = [sorted[1], sorted[0], sorted[2]]; // 2nd, 1st, 3rd
  const podiumConfig = [
    { place: 2, barH: "h-28", color: "#94a3b8", glow: "rgba(148,163,184,0.3)", label: "2ND", avatarSize: "xl" as const, delay: "0.15s" },
    { place: 1, barH: "h-40", color: "#f5c518", glow: "rgba(245,197,24,0.5)", label: "1ST", avatarSize: "xxl" as const, delay: "0s" },
    { place: 3, barH: "h-16", color: "#d97706", glow: "rgba(217,119,6,0.3)", label: "3RD", avatarSize: "xl" as const, delay: "0.3s" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      <Navbar user={navUser} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black text-white tracking-wider"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              🏆 LEADERBOARD
            </h1>
            <p className="text-zinc-500 text-sm mt-1.5 font-medium" style={{ fontFamily: "var(--font-rajdhani)" }}>
              Global standings — Who reigns supreme?
            </p>
          </div>
          <div
            className="text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}
          >
            {sorted.length} PLAYERS RANKED
          </div>
        </div>

        {/* Top 3 Podium */}
        {sorted.length >= 3 && (
          <div
            className="game-card p-8 mb-6 hidden sm:block overflow-hidden relative"
            style={{ background: "rgba(245,197,24,0.02)", border: "1px solid rgba(245,197,24,0.1)" }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(245,197,24,0.6), transparent 70%)" }} />
            
            <p className="section-label text-center mb-8">TOP PERFORMERS</p>
            <div className="flex items-end justify-center gap-6 sm:gap-12">
              {podiumOrder.map((player, i) => {
                if (!player) return null;
                const cfg = podiumConfig[i];
                const net = balances[player.username] || 0;
                const rankInfo = getRankInfo(net);
                const logoSrc = `/${rankInfo.name.toLowerCase()}.png`;
                return (
                  <div key={player._id} className="flex flex-col items-center gap-3" style={{ animationDelay: cfg.delay }}>
                    {/* Rank logo instead of medal emoji */}
                    <div className="relative float-up" style={{ animationDelay: cfg.delay }}>
                      <Image
                        src={logoSrc}
                        alt={rankInfo.name}
                        width={cfg.place === 1 ? 72 : 52}
                        height={cfg.place === 1 ? 72 : 52}
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Avatar */}
                    <PlayerAvatar
                      username={player.username}
                      avatarUrl={player.avatarUrl}
                      size={cfg.avatarSize}
                      showRing
                      ringColor={cfg.color}
                    />

                    {/* Name */}
                    <span
                      className="text-sm font-black capitalize text-center leading-tight"
                      style={{ color: cfg.color, fontFamily: "var(--font-rajdhani)", textShadow: `0 0 12px ${cfg.glow}` }}
                    >
                      {player.username}
                    </span>

                    {/* Balance */}
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: net >= 0 ? "#34d399" : "#f87171" }}
                    >
                      {net > 0 ? "+" : ""}{formatTnd(net)}
                    </span>

                    {/* Podium bar */}
                    <div
                      className={`w-28 ${cfg.barH} rounded-t-xl flex items-center justify-center font-black text-sm podium-bar podium-${cfg.place}`}
                      style={{
                        background: `linear-gradient(180deg, ${cfg.color}22, ${cfg.color}08)`,
                        border: `1px solid ${cfg.color}44`,
                        boxShadow: `0 -8px 30px ${cfg.glow}`,
                        color: cfg.color,
                        animationFillMode: "both",
                      }}
                    >
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Rankings Grid */}
        <div className="game-card overflow-hidden p-6 mt-6">
          <div
            className="flex items-center gap-3 mb-6"
          >
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-black text-white tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
              FULL RANKINGS
            </h2>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 font-medium">
              No players yet. The throne awaits! 👑
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sorted.map((player: any, idx: number) => {
                const net = balances[player.username] || 0;
                const isMe = player.username === currentUser.username;
                const isPos = net > 0;
                const isNeg = net < 0;

                return (
                  <div
                    key={player._id}
                    className="relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.04]"
                    style={{
                      background: isMe ? "rgba(245,197,24,0.06)" : "rgba(255,255,255,0.02)",
                      border: isMe ? "1px solid rgba(245,197,24,0.2)" : "1px solid #1f2d45",
                    }}
                  >
                    <div 
                      className="absolute top-3 left-3 text-sm font-black" 
                      style={{ 
                        color: idx === 0 ? "#f5c518" : idx === 1 ? "#94a3b8" : idx === 2 ? "#d97706" : "#6b7a99",
                        fontFamily: "var(--font-orbitron)" 
                      }}
                    >
                      #{idx + 1}
                    </div>

                    <div className="relative inline-block mt-2">
                      <PlayerAvatar
                        username={player.username}
                        avatarUrl={player.avatarUrl}
                        size="xl"
                        showRing={isMe}
                        ringColor="#f5c518"
                      />
                      <div className="absolute -bottom-5 -right-5 z-10 drop-shadow-md">
                        <RankBadge netBalance={net} size="md" showName={false} />
                      </div>
                    </div>

                    <div className="text-center w-full">
                      <span
                        className="text-xl font-black text-white capitalize truncate block w-full"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {player.username}
                      </span>
                      <span
                        className={`text-sm font-black font-mono mt-1 block ${
                          isPos ? "text-emerald-400" : isNeg ? "text-red-400" : "text-zinc-500"
                        }`}
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {isPos ? "+" : ""}{formatTnd(net)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* See Ranks Section */}
        <div className="game-card p-6 mt-8">
          <h2 className="text-lg font-black text-white tracking-wider mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
            RANKS & REQUIREMENTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RankTable />
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
            style={{ fontFamily: "var(--font-rajdhani)" }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
