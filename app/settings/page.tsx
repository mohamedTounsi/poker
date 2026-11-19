import { redirect } from "next/navigation";
import { getUserFromCookie } from "../../lib/auth";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import Navbar from "../../components/Navbar";
import SettingsClient from "./SettingsClient";
import { Settings as SettingsIcon } from "lucide-react";

export default async function SettingsPage() {
  const currentUser = await getUserFromCookie();
  if (!currentUser) redirect("/login");

  await connectToDatabase();
  const userDoc = await User.findById(currentUser.userId).lean();
  if (!userDoc) redirect("/login");

  const user = JSON.parse(JSON.stringify(userDoc));

  const navUser = {
    username: currentUser.username,
    role: currentUser.role,
    avatarUrl: user.avatarUrl || null,
  };

  return (
    <div className="min-h-screen flex flex-col lounge-bg">
      <Navbar user={navUser} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-amber-400" /> Account Settings
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
            Manage your personal profile, credentials, and app preferences
          </p>
        </div>

        <SettingsClient user={user} />
      </main>
    </div>
  );
}
