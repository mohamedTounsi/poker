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
  const balances: Record<string, number> = {};
  let activeGame: any = null;
  let historyGames: any[] = [];
  const avatarMap: Record<string, string | null> = {};

  // Player Dashboard Data
  let myGames: any[] = [];
  const myStats = {
    netBalance: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
  };
  let myUser: any = null;
  let navNetBalance = 0;

  if (currentUser.role === "admin") {
    const users = await User.find({ role: "player" }).sort({ username: 1 });
    players = JSON.parse(JSON.stringify(users));

    // Build avatar map
    players.forEach((p) => {
      avatarMap[p.username] = p.avatarUrl || null;
    });

    const active = await Game.findOne({ status: "active" });
    activeGame = active ? JSON.parse(JSON.stringify(active)) : null;

    const completed = await Game.find({ status: "completed" }).sort({ date: -1 });
    historyGames = JSON.parse(JSON.stringify(completed));

    players.forEach((p) => { balances[p.username] = 0; });
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
    // Fetch current player's full user doc
    myUser = await User.findById(currentUser.userId).lean();
    myUser = JSON.parse(JSON.stringify(myUser));

    const completed = await Game.find({
      status: "completed",
      "players.username": currentUser.username,
    }).sort({ date: -1 });

    myGames = JSON.parse(JSON.stringify(completed));

    myStats.gamesPlayed = myGames.length;
    myGames.forEach((game) => {
      const entry = game.players.find((p: any) => p.username === currentUser.username);
      if (entry) {
        myStats.netBalance += entry.score;
        if (entry.score > 0) myStats.wins += 1;
        else if (entry.score < 0) myStats.losses += 1;
      }
    });
    navNetBalance = myStats.netBalance;
  }

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: myUser?.avatarUrl || null,
    netBalance: navNetBalance,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      <Navbar user={navUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-black text-white tracking-wider"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {currentUser.role === "admin" ? "COMMAND CENTER" : "MY PROFILE"}
          </h1>
          <p className="text-zinc-500 text-sm mt-1.5 font-medium" style={{ fontFamily: "var(--font-rajdhani)" }}>
            {currentUser.role === "admin"
              ? "Manage players, start games, and view global standings"
              : `Welcome back, ${currentUser.username}! Here's your poker profile.`}
          </p>
        </div>

        {currentUser.role === "admin" ? (
          <AdminDashboard
            players={players}
            balances={balances}
            activeGame={activeGame}
            avatarMap={avatarMap}
          />
        ) : (
          <PlayerDashboard
            currentUser={currentUser}
            myUser={myUser}
            myGames={myGames}
            myStats={myStats}
          />
        )}
      </main>
    </div>
  );
}
