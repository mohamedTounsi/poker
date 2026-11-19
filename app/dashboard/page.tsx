import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import Game from "../../models/Game";
import Navbar from "../../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import PlayerDashboard from "./PlayerDashboard";

export default async function DashboardPage() {
  const currentUser = await getUserFromCookie();

  if (!currentUser) {
    redirect("/login");
  }

  await connectToDatabase();

  // Fetch all players
  const users = await User.find({ role: "player" }).sort({ username: 1 }).lean();
  const players = JSON.parse(JSON.stringify(users));

  const avatarMap: Record<string, string | null> = {};
  players.forEach((p: any) => {
    avatarMap[p.username] = p.avatarUrl || null;
  });

  // Fetch active game if any
  const active = await Game.findOne({ status: "active" }).lean();
  const activeGame = active ? JSON.parse(JSON.stringify(active)) : null;

  // Fetch completed games
  const completed = await Game.find({ status: "completed" }).sort({ date: -1 }).lean();
  const historyGames = JSON.parse(JSON.stringify(completed));

  // Compute global balances
  const balances: Record<string, number> = {};
  const gamesCount: Record<string, number> = {};
  players.forEach((p: any) => {
    balances[p.username] = 0;
    gamesCount[p.username] = 0;
  });

  historyGames.forEach((game: any) => {
    game.players.forEach((p: any) => {
      balances[p.username] = (balances[p.username] || 0) + p.score;
      gamesCount[p.username] = (gamesCount[p.username] || 0) + 1;
    });
  });

  // Player Dashboard specific metrics
  let myUser: any = null;
  let myGames: any[] = [];
  const myStats = {
    netBalance: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    bestWin: 0,
    worstLoss: 0,
    rebuys: 0,
  };

  if (currentUser.role === "player") {
    myUser = await User.findById(currentUser.userId).lean();
    myUser = myUser ? JSON.parse(JSON.stringify(myUser)) : null;

    myGames = historyGames.filter((g: any) =>
      g.players.some((p: any) => p.username === currentUser.username)
    );

    myStats.gamesPlayed = myGames.length;
    myStats.netBalance = balances[currentUser.username] || 0;

    myGames.forEach((g: any) => {
      const entry = g.players.find((p: any) => p.username === currentUser.username);
      if (entry) {
        if (entry.score > 0) myStats.wins += 1;
        if (entry.score < 0) myStats.losses += 1;
        if (entry.score > myStats.bestWin) myStats.bestWin = entry.score;
        if (entry.score < myStats.worstLoss) myStats.worstLoss = entry.score;
        if (entry.rebuys) myStats.rebuys += entry.rebuys;
      }
    });
  } else {
    // Admin user doc
    const adminDoc = await User.findById(currentUser.userId).lean();
    myUser = adminDoc ? JSON.parse(JSON.stringify(adminDoc)) : null;
  }

  // Sorted players for Top 3 podium
  const sortedPlayers = [...players].sort(
    (a, b) => (balances[b.username] || 0) - (balances[a.username] || 0)
  );

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: myUser?.avatarUrl || null,
    netBalance: balances[currentUser.username] || 0,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
        {currentUser.role === "admin" ? (
          <AdminDashboard
            players={players}
            balances={balances}
            activeGame={activeGame}
            avatarMap={avatarMap}
            sortedPlayers={sortedPlayers}
            historyGames={historyGames}
          />
        ) : (
          <PlayerDashboard
            currentUser={currentUser}
            myUser={myUser}
            myGames={myGames}
            myStats={myStats}
            activeGame={activeGame}
            topPlayers={sortedPlayers.slice(0, 3)}
            balances={balances}
            avatarMap={avatarMap}
          />
        )}
      </main>
    </div>
  );
}
