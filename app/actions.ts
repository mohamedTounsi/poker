"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectToDatabase } from "../lib/db";
import User from "../models/User";
import Game from "../models/Game";
import Message from "../models/Message";
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
      bio: "Chief Tournament Director",
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

export async function signUpAction(prevState: any, formData: FormData) {
  try {
    await seedAdminIfNeeded();

    const username = formData.get("username")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const bio = formData.get("bio")?.toString()?.trim() || "";

    if (!username || !password) {
      return { error: "Username and password are required" };
    }

    if (username.length < 3 || username.length > 20) {
      return { error: "Username must be between 3 and 20 characters" };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { error: "Username can only contain letters, numbers, and underscores" };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long" };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    await connectToDatabase();
    const existing = await User.findOne({ username });
    if (existing) {
      return { error: "Username is already taken" };
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: "player",
      bio,
      medals: { gold: 0, silver: 0, bronze: 0 },
    });

    // Log the user in immediately
    const token = await signJWT({
      userId: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("poker_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: error.message || "An error occurred during registration" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("poker_session");
  redirect("/login");
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const bio = formData.get("bio")?.toString()?.slice(0, 250);
    const themePreference = formData.get("themePreference")?.toString();

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return { error: "User not found" };
    }

    if (bio !== undefined) user.bio = bio;
    if (themePreference === "dark" || themePreference === "light") {
      user.themePreference = themePreference;
    }

    await user.save();
    revalidatePath("/dashboard");
    revalidatePath(`/profile/${session.username}`);
    return { success: "Profile updated successfully!" };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { error: error.message || "Failed to update profile" };
  }
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
    const bio = formData.get("bio")?.toString()?.trim() || "";

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
      bio,
      medals: { gold: 0, silver: 0, bronze: 0 },
    });

    revalidatePath("/dashboard");
    revalidatePath("/players");
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
      rebuys: 0,
      rebuyTotal: 0,
    }));

    const newGame = await Game.create({
      status: "active",
      players: gamePlayers,
      transactions: [],
      actions: [
        {
          id: Math.random().toString(36).slice(2, 9),
          type: "score",
          description: `Game started with ${gamePlayers.length} players`,
          timestamp: new Date(),
          stateSnapshot: {
            players: gamePlayers.map((p) => ({
              userId: p.userId.toString(),
              username: p.username,
              score: 0,
              rebuys: 0,
            })),
          },
        },
      ],
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

    const playerIndex = game.players.findIndex((p: any) => p.userId.toString() === userId);
    if (playerIndex === -1) {
      throw new Error("Player not in this game");
    }

    const currentSnapshot = game.players.map((p: any) => ({
      userId: p.userId.toString(),
      username: p.username,
      score: p.score,
      rebuys: p.rebuys || 0,
    }));

    game.players[playerIndex].score += change;

    // Log action with snapshot for Undo
    if (!game.actions) game.actions = [];
    game.actions.push({
      id: Math.random().toString(36).slice(2, 9),
      type: "score",
      description: `${change >= 0 ? "+" : ""}${change} TND adjusted for ${game.players[playerIndex].username}`,
      timestamp: new Date(),
      stateSnapshot: { players: currentSnapshot },
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update score error:", error);
    return { error: error.message };
  }
}

export async function rebuyPlayerAction(gameId: string, userId: string, amount: number) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (amount <= 0) {
      throw new Error("Rebuy amount must be greater than 0");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot edit a completed game");
    }

    const playerIndex = game.players.findIndex((p: any) => p.userId.toString() === userId);
    if (playerIndex === -1) {
      throw new Error("Player not in this game");
    }

    const currentSnapshot = game.players.map((p: any) => ({
      userId: p.userId.toString(),
      username: p.username,
      score: p.score,
      rebuys: p.rebuys || 0,
    }));

    // In a cash game, a rebuy adds buy-in cost (-amount to their balance)
    game.players[playerIndex].score -= amount;
    game.players[playerIndex].rebuys = (game.players[playerIndex].rebuys || 0) + 1;
    game.players[playerIndex].rebuyTotal = (game.players[playerIndex].rebuyTotal || 0) + amount;

    // Record rebuy in transactions ledger
    game.transactions.push({
      fromUser: "TABLE",
      toUser: game.players[playerIndex].username,
      amount,
      type: "rebuy",
      timestamp: new Date(),
    });

    // Record action for undo
    if (!game.actions) game.actions = [];
    game.actions.push({
      id: Math.random().toString(36).slice(2, 9),
      type: "rebuy",
      description: `Rebuy: ${game.players[playerIndex].username} bought in for ${amount} TND`,
      timestamp: new Date(),
      stateSnapshot: { players: currentSnapshot },
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Rebuy error:", error);
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

    const lenderIdx = game.players.findIndex((p: any) => p.username === lenderUsername);
    const borrowerIdx = game.players.findIndex((p: any) => p.username === borrowerUsername);

    if (lenderIdx === -1 || borrowerIdx === -1) {
      throw new Error("Both players must be in the game to perform a transfer");
    }

    const currentSnapshot = game.players.map((p: any) => ({
      userId: p.userId.toString(),
      username: p.username,
      score: p.score,
      rebuys: p.rebuys || 0,
    }));

    // Add + to giver/lender, - to getter/borrower
    game.players[lenderIdx].score += amount;
    game.players[borrowerIdx].score -= amount;

    // Log transaction
    game.transactions.push({
      fromUser: lenderUsername,
      toUser: borrowerUsername,
      amount,
      type: "transfer",
      timestamp: new Date(),
    });

    if (!game.actions) game.actions = [];
    game.actions.push({
      id: Math.random().toString(36).slice(2, 9),
      type: "transfer",
      description: `Transfer: ${lenderUsername} → ${borrowerUsername} (${amount} TND)`,
      timestamp: new Date(),
      stateSnapshot: { players: currentSnapshot },
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Borrow transaction error:", error);
    return { error: error.message };
  }
}

export async function undoLastAction(gameId: string) {
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
      throw new Error("Cannot modify a completed game");
    }

    if (!game.actions || game.actions.length <= 1) {
      throw new Error("No action to undo");
    }

    // Get the last action
    const lastAction = game.actions.pop();

    if (lastAction?.stateSnapshot?.players) {
      // Restore previous player scores and rebuys
      const snapshotMap = new Map<string, { score: number; rebuys?: number }>();
      lastAction.stateSnapshot.players.forEach((p: any) => {
        snapshotMap.set(p.userId.toString(), { score: p.score, rebuys: p.rebuys || 0 });
      });

      game.players.forEach((p: any) => {
        const prev = snapshotMap.get(p.userId.toString());
        if (prev) {
          p.score = prev.score;
          if (prev.rebuys !== undefined) p.rebuys = prev.rebuys;
        }
      });
    }

    // Also pop the corresponding transaction if it was a transfer or rebuy
    if (lastAction?.type === "transfer" || lastAction?.type === "rebuy") {
      if (game.transactions && game.transactions.length > 0) {
        game.transactions.pop();
      }
    }

    await game.save();
    revalidatePath(`/game/${gameId}`);
    return { success: true, undoneDescription: lastAction?.description };
  } catch (error: any) {
    console.error("Undo error:", error);
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
      rebuys: 0,
      rebuyTotal: 0,
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Add player error:", error);
    return { error: error.message };
  }
}

export async function addMultiplePlayersToGameAction(gameId: string, userIds: string[]) {
  try {
    const session = await getUserFromCookie();
    if (!session || session.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (!userIds || userIds.length === 0) {
      throw new Error("Please select at least one player to add");
    }

    await connectToDatabase();
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "active") {
      throw new Error("Cannot edit a completed game");
    }

    const existingIds = new Set(game.players.map((p: any) => p.userId.toString()));
    const validUsers = await User.find({ _id: { $in: userIds } });

    let addedCount = 0;
    for (const u of validUsers) {
      if (!existingIds.has(u._id.toString())) {
        game.players.push({
          userId: u._id,
          username: u.username,
          score: 0,
          rebuys: 0,
          rebuyTotal: 0,
        });
        existingIds.add(u._id.toString());
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await game.save();
      revalidatePath(`/game/${gameId}`);
    }

    return { success: true, addedCount };
  } catch (error: any) {
    console.error("Add multiple players error:", error);
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

    if (!game.players || game.players.length === 0) {
      throw new Error("No players seated in this game");
    }

    const currentSnapshot = game.players.map((p: any) => ({
      userId: p.userId ? p.userId.toString() : "",
      username: p.username || "",
      score: Number(p.score) || 0,
      rebuys: Number(p.rebuys) || 0,
    }));

    game.players.forEach((p: any) => {
      p.score = (Number(p.score) || 0) - amount;
    });

    if (!game.actions) game.actions = [];
    game.actions.push({
      id: Math.random().toString(36).slice(2, 9),
      type: "decrease_all",
      description: `Deducted ${amount} TND from all ${game.players.length} players`,
      timestamp: new Date(),
      stateSnapshot: { players: currentSnapshot },
    });

    await game.save();

    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Decrease all scores error:", error);
    return { error: error.message };
  }
}

// ----------------------------------------------------
// CHAT ACTIONS
// ----------------------------------------------------

export async function sendMessageAction(payload: {
  channelType: "global" | "direct" | "game";
  content: string;
  recipient?: string;
  gameId?: string;
}) {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return { error: "You must be logged in to send messages" };
    }

    const content = payload.content?.trim();
    if (!content) {
      return { error: "Message cannot be empty" };
    }

    if (content.length > 1000) {
      return { error: "Message too long (max 1000 chars)" };
    }

    await connectToDatabase();
    const senderDoc = await User.findById(session.userId);

    const message = await Message.create({
      sender: session.username,
      senderAvatar: senderDoc?.avatarUrl || null,
      channelType: payload.channelType,
      recipient: payload.recipient ? payload.recipient.toLowerCase().trim() : null,
      gameId: payload.gameId || null,
      content,
    });

    return {
      success: true,
      message: JSON.parse(JSON.stringify(message)),
    };
  } catch (error: any) {
    console.error("Send message error:", error);
    return { error: error.message || "Failed to send message" };
  }
}

export async function getMessagesAction(params: {
  channelType: "global" | "direct" | "game";
  recipient?: string;
  gameId?: string;
  limit?: number;
}) {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return { error: "Unauthorized" };
    }

    await connectToDatabase();
    const limit = params.limit || 50;

    let query: any = { channelType: params.channelType };

    if (params.channelType === "direct") {
      if (!params.recipient) return { messages: [] };
      const other = params.recipient.toLowerCase().trim();
      const me = session.username.toLowerCase().trim();
      query = {
        channelType: "direct",
        $or: [
          { sender: me, recipient: other },
          { sender: other, recipient: me },
        ],
      };
    } else if (params.channelType === "game") {
      if (!params.gameId) return { messages: [] };
      query = { channelType: "game", gameId: params.gameId };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      messages: JSON.parse(JSON.stringify(messages.reverse())),
    };
  } catch (error: any) {
    console.error("Get messages error:", error);
    return { error: error.message || "Failed to fetch messages" };
  }
}

export async function deleteMessageAction(messageId: string) {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return { error: "Unauthorized" };
    }

    await connectToDatabase();
    const message = await Message.findById(messageId);
    if (!message) {
      return { error: "Message not found" };
    }

    // Only allow message sender or admin to delete
    if (message.sender !== session.username && session.role !== "admin") {
      return { error: "Forbidden: You can only delete your own messages" };
    }

    message.deleted = true;
    message.content = "This message was deleted";
    await message.save();

    return { success: true };
  } catch (error: any) {
    console.error("Delete message error:", error);
    return { error: error.message || "Failed to delete message" };
  }
}
