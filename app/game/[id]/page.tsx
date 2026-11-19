import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";
import Game from "../../../models/Game";
import User from "../../../models/User";
import Navbar from "../../../components/Navbar";
import GameClient from "./GameClient";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  const currentUser = await getUserFromCookie();

  if (!currentUser) {
    redirect("/login");
  }

  await connectToDatabase();

  const gameDoc = await Game.findById(id);
  if (!gameDoc) {
    redirect("/dashboard");
  }

  if (gameDoc.status === "completed") {
    redirect("/dashboard");
  }

  const game = JSON.parse(JSON.stringify(gameDoc));

  const usersDoc = await User.find({}).sort({ username: 1 });
  const allUsers = JSON.parse(JSON.stringify(usersDoc));

  const completedGames = await Game.find({ status: "completed" }).lean();
  const playerBalances: Record<string, number> = {};
  allUsers.forEach((u: any) => {
    playerBalances[u.username] = 0;
  });
  completedGames.forEach((g: any) => {
    g.players?.forEach((p: any) => {
      playerBalances[p.username] = (playerBalances[p.username] || 0) + (p.score || 0);
    });
  });

  const me = allUsers.find((u: any) => u.username === currentUser.username);
  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: me?.avatarUrl || null,
    netBalance: playerBalances[currentUser.username] || 0,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <GameClient
          game={game}
          currentUser={{
            username: currentUser.username,
            role: currentUser.role,
          }}
          allUsers={allUsers || []}
          playerBalances={playerBalances || {}}
        />
      </main>
    </div>
  );
}
