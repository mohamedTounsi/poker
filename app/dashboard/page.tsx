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

  let players: any[] = [];
  let balances: Record<string, number> = {};
  let activeGame: any = null;
  let historyGames: any[] = [];

  // Player Dashboard Data
  let myGames: any[] = [];
  let myStats = {
    netBalance: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
  };

  if (currentUser.role === "admin") {
    // Admin needs all players to show standings and start games
    const users = await User.find({ role: "player" }).sort({ username: 1 });
    players = JSON.parse(JSON.stringify(users));

    // Active game (if any)
    const active = await Game.findOne({ status: "active" });
    activeGame = active ? JSON.parse(JSON.stringify(active)) : null;

    // Completed games for history summary
    const completed = await Game.find({ status: "completed" }).sort({ date: -1 });
    historyGames = JSON.parse(JSON.stringify(completed));

    // Initialize all player balances to 0
    players.forEach((p) => {
      balances[p.username] = 0;
    });

    // Sum up player balances across all completed games
    historyGames.forEach((game) => {
      game.players.forEach((p: any) => {
        if (balances[p.username] !== undefined) {
          balances[p.username] += p.score;
        } else {
          balances[p.username] = p.score;
        }
      });
    });
  } else {
    // Player needs their own statistics and match history
    const completed = await Game.find({
      status: "completed",
      "players.username": currentUser.username,
    }).sort({ date: -1 });

    myGames = JSON.parse(JSON.stringify(completed));

    // Calculate player stats
    myStats.gamesPlayed = myGames.length;
    myGames.forEach((game) => {
      const entry = game.players.find((p: any) => p.username === currentUser.username);
      if (entry) {
        myStats.netBalance += entry.score;
        if (entry.score > 0) {
          myStats.wins += 1;
        } else if (entry.score < 0) {
          myStats.losses += 1;
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 flex flex-col transition-colors duration-200">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-850 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white capitalize">
              Welcome back, {currentUser.username}!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium">
              Here is your poker tracking overview for tonight.
            </p>
          </div>
        </div>

        {currentUser.role === "admin" ? (
          <AdminDashboard
            currentUser={currentUser}
            players={players}
            balances={balances}
            activeGame={activeGame}
            historyGames={historyGames}
          />
        ) : (
          <PlayerDashboard
            currentUser={currentUser}
            myGames={myGames}
            myStats={myStats}
          />
        )}
      </main>
    </div>
  );
}
