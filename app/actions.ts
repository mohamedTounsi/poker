"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectToDatabase } from "../lib/db";
import User from "../models/User";
import Game from "../models/Game";
import { hashPassword, comparePassword, signJWT, getUserFromCookie } from "../lib/auth";

// Helper to seed admin account if DB is empty
async function seedAdminIfNeeded() {
  await connectToDatabase();
  const count = await User.countDocuments();
  if (count === 0) {
    const hashed = await hashPassword("adminpassword123");
    await User.create({
      username: "admin",
      password: hashed,
      role: "admin",
    });
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await seedAdminIfNeeded();

    const username = formData.get("username")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!username || !password) {
      return { error: "Please enter both username and password" };
    }

    const user = await User.findOne({ username });
    if (!user) {
      return { error: "Invalid username or password" };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { error: "Invalid username or password" };
    }

    // Generate token
    const token = await signJWT({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    // Save token in cookie
    const cookieStore = await cookies();
    cookieStore.set("poker_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("poker_session");
  redirect("/login");
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();

    if (!currentPassword || !newPassword) {
      return { error: "All fields are required" };
    }

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long" };
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return { error: "User not found" };
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password" };
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return { success: "Password changed successfully!" };
  } catch (error: any) {
    console.error("Change password error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function createUserAction(prevState: any, formData: FormData) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      return { error: "Unauthorized: Admin access required" };
    }

    const username = formData.get("username")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!username || !password) {
      return { error: "All fields are required" };
    }

    if (username.length < 3) {
      return { error: "Username must be at least 3 characters" };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    await connectToDatabase();
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return { error: "Username already exists" };
    }

    const hashedPassword = await hashPassword(password);
    await User.create({
      username,
      password: hashedPassword,
      role: "player",
      medals: { gold: 0, silver: 0, bronze: 0 },
    });

    revalidatePath("/dashboard");
    return { success: `Account for ${username} created successfully!` };
  } catch (error: any) {
    console.error("Create user error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function startGameAction(playerIds: string[]) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (!playerIds || playerIds.length === 0) {
      throw new Error("Select at least one player to start the game");
    }

    await connectToDatabase();
    const players = await User.find({ _id: { $in: playerIds } });

    const gamePlayers = players.map((p) => ({
      userId: p._id,
      username: p.username,
      score: 0,
    }));

    const newGame = await Game.create({
      status: "active",
      players: gamePlayers,
      transactions: [],
    });

    revalidatePath("/dashboard");
    return { gameId: newGame._id.toString() };
  } catch (error: any) {
    console.error("Start game error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function updatePlayerScoreAction(gameId: string, userId: string, change: number) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot edit a completed game");
    }

    // Find the player and update score
    const playerIndex = game.players.findIndex((p: any) => p.userId.toString() === userId);
    if (playerIndex === -1) {
      throw new Error("Player not in this game");
    }

    game.players[playerIndex].score += change;
    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update score error:", error);
    return { error: error.message };
  }
}

export async function recordBorrowAction(
  gameId: string,
  lenderUsername: string,
  borrowerUsername: string,
  amount: number
) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (lenderUsername === borrowerUsername) {
      throw new Error("Lender and borrower cannot be the same person");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot modify a completed game");
    }

    // Verify both are in the game
    const lenderIdx = game.players.findIndex((p: any) => p.username === lenderUsername);
    const borrowerIdx = game.players.findIndex((p: any) => p.username === borrowerUsername);

    if (lenderIdx === -1 || borrowerIdx === -1) {
      throw new Error("Both players must be in the game to perform a transfer");
    }

    // Add + to giver/lender, - to getter/borrower
    game.players[lenderIdx].score += amount;
    game.players[borrowerIdx].score -= amount;

    // Log transaction
    game.transactions.push({
      fromUser: lenderUsername,
      toUser: borrowerUsername,
      amount,
      timestamp: new Date(),
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Borrow transaction error:", error);
    return { error: error.message };
  }
}

export async function addPlayerToGameAction(gameId: string, userId: string) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot edit a completed game");
    }

    const alreadyIn = game.players.some((p: any) => p.userId.toString() === userId);
    if (alreadyIn) {
      throw new Error("Player already in game");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    game.players.push({
      userId: user._id,
      username: user.username,
      score: 0,
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Add player error:", error);
    return { error: error.message };
  }
}

export async function removePlayerFromGameAction(gameId: string, userId: string) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot edit a completed game");
    }

    game.players = game.players.filter((p: any) => p.userId.toString() !== userId);
    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Remove player error:", error);
    return { error: error.message };
  }
}

export async function endGameAction(gameId: string) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    game.status = "completed";
    await game.save();

    // Award medals to top 3 players by score
    const sorted = [...game.players].sort((a: any, b: any) => b.score - a.score);
    const medalMap: Record<number, keyof { gold: number; silver: number; bronze: number }> = {
      0: "gold",
      1: "silver",
      2: "bronze",
    };

    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      const medal = medalMap[i];
      if (sorted[i].score > 0 || i === 0) {
        // Award medal even to 1st place if score is 0 or positive
        await User.findOneAndUpdate(
          { username: sorted[i].username },
          { $inc: { [`medals.${medal}`]: 1 } }
        );
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/leaderboard");
  } catch (error: any) {
    console.error("End game error:", error);
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function decreaseAllPlayersScoreAction(gameId: string, amount: number) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot edit a completed game");
    }

    // Decrease score for all players
    game.players.forEach((p: any) => {
      p.score -= amount;
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Decrease all scores error:", error);
    return { error: error.message };
  }
}
