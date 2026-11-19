import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import Game from "../../models/Game";
import User from "../../models/User";
import Navbar from "../../components/Navbar";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();

  let gamesDoc: any[] = [];
  if (currentUser.role === "admin") {
    gamesDoc = await Game.find({ status: "completed" }).sort({ date: -1 });
  } else {
    gamesDoc = await Game.find({
      status: "completed",
      "players.username": currentUser.username,
    }).sort({ date: -1 });
  }

  const games = JSON.parse(JSON.stringify(gamesDoc));

  // Build avatar map for all usernames in these games
  const allUsernames = new Set<string>();
  games.forEach((g: any) => g.players.forEach((p: any) => allUsernames.add(p.username)));
  const usersInGames = await User.find({ username: { $in: Array.from(allUsernames) } }).lean();
  const avatarMap: Record<string, string | null> = {};
  usersInGames.forEach((u: any) => {
    avatarMap[u.username] = u.avatarUrl || null;
  });

  // Nav user net balance
  let navNetBalance = 0;
  let navAvatarUrl: string | null = null;
  if (currentUser.role === "player") {
    const me = usersInGames.find((u: any) => u.username === currentUser.username) as any;
    navAvatarUrl = me?.avatarUrl || null;
    games.forEach((g: any) => {
      const entry = g.players.find((p: any) => p.username === currentUser.username);
      if (entry) navNetBalance += entry.score;
    });
  }

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: navAvatarUrl,
    netBalance: navNetBalance,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2.5">
            Match History & Ledgers
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
            {currentUser.role === "admin"
              ? `All ${games.length} completed game sessions with audit trails`
              : `Your ${games.length} completed matches — click to expand scorecards`}
          </p>
        </div>

        <HistoryClient
          games={games}
          currentUsername={currentUser.username}
          isAdmin={currentUser.role === "admin"}
          avatarMap={avatarMap}
        />
      </main>
    </div>
  );
}
