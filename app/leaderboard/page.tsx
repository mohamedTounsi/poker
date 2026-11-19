import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import Game from "../../models/Game";
import Navbar from "../../components/Navbar";
import LeaderboardClient from "./LeaderboardClient";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();

  const usersDoc = await User.find({ role: "player" }).lean();
  const allUsers = JSON.parse(JSON.stringify(usersDoc));

  const completedGames = await Game.find({ status: "completed" }).lean();
  const completed = JSON.parse(JSON.stringify(completedGames));

  const avatarMap: Record<string, string | null> = {};
  allUsers.forEach((u: any) => {
    avatarMap[u.username] = u.avatarUrl || null;
  });

  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  // Compute stats helper
  const computeRankings = (gamesList: any[]) => {
    const balances: Record<string, number> = {};
    const counts: Record<string, number> = {};

    allUsers.forEach((u: any) => {
      balances[u.username] = 0;
      counts[u.username] = 0;
    });

    gamesList.forEach((game: any) => {
      game.players.forEach((p: any) => {
        balances[p.username] = (balances[p.username] || 0) + p.score;
        counts[p.username] = (counts[p.username] || 0) + 1;
      });
    });

    return allUsers
      .map((u: any) => ({
        username: u.username,
        avatarUrl: u.avatarUrl,
        netBalance: balances[u.username] || 0,
        gamesCount: counts[u.username] || 0,
      }))
      .sort((a: any, b: any) => b.netBalance - a.netBalance);
  };

  const allTimeRankings = computeRankings(completed);
  const monthlyRankings = computeRankings(
    completed.filter((g: any) => new Date(g.date) >= oneMonthAgo)
  );
  const weeklyRankings = computeRankings(
    completed.filter((g: any) => new Date(g.date) >= oneWeekAgo)
  );

  const me = allUsers.find((u: any) => u.username === currentUser.username);

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: me?.avatarUrl || null,
    netBalance: allTimeRankings.find((p: any) => p.username === currentUser.username)?.netBalance || 0,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" /> Leaderboard & Ranks
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
            Global club standings, podium trophies, and tier movements
          </p>
        </div>

        <LeaderboardClient
          allTimeRankings={allTimeRankings}
          monthlyRankings={monthlyRankings}
          weeklyRankings={weeklyRankings}
          avatarMap={avatarMap}
          currentUsername={currentUser.username}
        />
      </main>
    </div>
  );
}
