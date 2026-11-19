import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import Game from "../../models/Game";
import Navbar from "../../components/Navbar";
import ChatClient from "./ChatClient";
import { MessageSquare } from "lucide-react";

interface ChatPageProps {
  searchParams: Promise<{ dm?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { dm } = await searchParams;
  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();

  const playersDoc = await User.find({ role: "player" }).sort({ username: 1 }).lean();
  const allPlayers = JSON.parse(JSON.stringify(playersDoc));

  const activeGame = await Game.findOne({ status: "active" }).lean();
  const me = allPlayers.find((p: any) => p.username === currentUser.username);

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: me?.avatarUrl || null,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-400" /> Club Chat Lounge
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
            Global community room, private 1-on-1 direct messages & table chats
          </p>
        </div>

        <ChatClient
          currentUser={currentUser}
          allPlayers={allPlayers}
          initialDmTarget={dm ? dm.toLowerCase().trim() : null}
          activeGameId={activeGame ? activeGame._id.toString() : null}
        />
      </main>
    </div>
  );
}
