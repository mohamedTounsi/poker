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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 flex flex-col transition-colors duration-200">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-850 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Poker Table <span className="text-red-600 dark:text-red-500">#Session</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium">
              Active scoring sheet. Click cards to adjust chips, or use the borrow logger below.
            </p>
          </div>
        </div>

        <GameClient game={game} currentUser={currentUser} allUsers={allUsers} />
      </main>
    </div>
  );
}
