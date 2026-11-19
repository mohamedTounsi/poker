import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import Game from "../../models/Game";
import Navbar from "../../components/Navbar";
import PlayersDirectoryClient from "./PlayersDirectoryClient";
import { Users } from "lucide-react";

export default async function PlayersPage() {
  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();

  const usersDoc = await User.find({ role: "player" }).sort({ username: 1 }).lean();
  const players = JSON.parse(JSON.stringify(usersDoc));

  const completedGames = await Game.find({ status: "completed" }).lean();
  const completed = JSON.parse(JSON.stringify(completedGames));

  const balances: Record<string, number> = {};
  const gamesCounts: Record<string, number> = {};

  players.forEach((p: any) => {
    balances[p.username] = 0;
    gamesCounts[p.username] = 0;
  });

  completed.forEach((g: any) => {
    g.players.forEach((p: any) => {
      balances[p.username] = (balances[p.username] || 0) + p.score;
      gamesCounts[p.username] = (gamesCounts[p.username] || 0) + 1;
    });
  });

  const me = players.find((p: any) => p.username === currentUser.username);

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: me?.avatarUrl || null,
    netBalance: balances[currentUser.username] || 0,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2.5">
              <Users className="w-7 h-7 text-emerald-400" /> Players Directory
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
              Browse public club profiles, view career stats, and connect directly
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300">
            {players.length} Total Players Registered
          </div>
        </div>

        <PlayersDirectoryClient
          players={players}
          balances={balances}
          gamesCounts={gamesCounts}
          currentUsername={currentUser.username}
        />
      </main>
    </div>
  );
}
