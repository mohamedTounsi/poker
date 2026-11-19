game_client = """"use client";

import { useState, useTransition } from "react";
import { updatePlayerScoreAction, recordBorrowAction, addPlayerToGameAction, removePlayerFromGameAction, endGameAction, decreaseAllPlayersScoreAction } from "../../actions";
import { formatTnd } from "../../../lib/utils";
import { Spade, Plus, Minus, UserPlus, AlertTriangle, CheckCircle, Clock, Trash2, Loader2, HandCoins, ArrowRight, TrendingUp, TrendingDown, Info, MoveRight } from "lucide-react";
import Link from "next/link";
import PlayerAvatar from "../../../components/PlayerAvatar";

interface GameClientProps {
  game: any;
  currentUser: { username: string; role: "admin" | "player" };
  allUsers: any[];
}

export default function GameClient({ game, currentUser, allUsers }: GameClientProps) {
  const isAdmin = currentUser.role === "admin";
  const [isPending, startTransition] = useTransition();
  const [playerInputs, setPlayerInputs] = useState<Record<string, string>>({});
  
  const getPlayerInput = (userId: string) => {
    const val = parseFloat(playerInputs[userId]);
    return isNaN(val) ? 0 : val;
  };

  const [lender, setLender] = useState<string>("");
  const [borrower, setBorrower] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<number>(0);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [isTxPending, setIsTxPending] = useState(false);
  const [selectedAddUser, setSelectedAddUser] = useState<string>("");
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);
  const [isAddPending, setIsAddPending] = useState(false);

  const totalScore = game.players.reduce((sum: number, p: any) => sum + p.score, 0);
  const isBalanced = totalScore === 0;

  const activeUsernames = game.players.map((p: any) => p.username);
  const availableUsersToAdd = allUsers.filter(u => u.role !== "admin" && !activeUsernames.includes(u.username));

  const getUserAvatar = (username: string) => {
    const user = allUsers.find(u => u.username === username);
    return user?.avatarUrl || null;
  };

  const handleScoreChange = async (userId: string, change: number) => {
    if (!isAdmin) return;
    startTransition(async () => { await updatePlayerScoreAction(game._id, userId, change); });
  };

  const handleDecreaseAll = async (amount: number) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to deduct ${amount} TND from ALL players?`)) return;
    startTransition(async () => { await decreaseAllPlayersScoreAction(game._id, amount); });
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!lender || !borrower || borrowAmount <= 0) { setTxError("Lender, borrower, and a valid amount are required."); return; }
    if (lender === borrower) { setTxError("Lender and borrower cannot be the same player."); return; }

    setTxError(null); setTxSuccess(null); setIsTxPending(true);
    try {
      const res = await recordBorrowAction(game._id, lender, borrower, borrowAmount);
      if (res && res.error) { setTxError(res.error); } 
      else {
        setTxSuccess(`Success! Transfer of ${borrowAmount} TND logged.`);
        setBorrowAmount(0); setLender(""); setBorrower("");
        setTimeout(() => setTxSuccess(null), 4000);
      }
    } catch (err: any) { setTxError(err.message || "An error occurred"); } 
    finally { setIsTxPending(false); }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!selectedAddUser) { setAddPlayerError("Please select a player to add."); return; }
    setAddPlayerError(null); setIsAddPending(true);
    try {
      const res = await addPlayerToGameAction(game._id, selectedAddUser);
      if (res && res.error) { setAddPlayerError(res.error); } 
      else { setSelectedAddUser(""); }
    } catch (err: any) { setAddPlayerError(err.message || "An error occurred"); } 
    finally { setIsAddPending(false); }
  };

  const handleRemovePlayer = async (userId: string, username: string) => {
    if (!isAdmin) return;
    if (!confirm(`Remove ${username} from the game? Their current score in this session will be lost.`)) return;
    startTransition(async () => { await removePlayerFromGameAction(game._id, userId); });
  };

  const handleEndGame = async () => {
    if (!isAdmin) return;
    let message = "Are you sure you want to end this game and save the final balances?";
    if (!isBalanced) message = `WARNING: The game is not balanced (Net Total is ${totalScore} TND). Do you still want to save and end this game?`;
    if (!confirm(message)) return;
    startTransition(async () => { await endGameAction(game._id); });
  };

  const getPlayerSuit = (username: string) => {
    const suits = [
      { char: "♠", color: "text-black" },
      { char: "♥", color: "text-red-600" },
      { char: "♦", color: "text-red-600" },
      { char: "♣", color: "text-black" },
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) { hash = username.charCodeAt(i) + ((hash << 5) - hash); }
    return suits[Math.abs(hash) % suits.length];
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Top HUD Banner */}
      <div className="bg-black border-y-4 border-red-600 py-6 shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-red-600">
              <Spade className="w-8 h-8 text-black fill-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-widest">Live Table</h1>
              <span className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">Started {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <span className="block text-red-600 font-black text-3xl">{game.players.length}</span>
              <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Players</span>
            </div>
            <div className={`p-4 rounded-xl border-4 flex flex-col items-center min-w-[150px] ${isBalanced ? 'bg-white border-white text-black' : 'bg-red-600 border-red-800 text-white animate-pulse'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isBalanced ? 'text-zinc-500' : 'text-red-200'}`}>Net Balance</span>
              <span className="text-3xl font-black font-mono">{formatTnd(totalScore)}</span>
              {isBalanced ? <span className="text-[10px] font-bold mt-1 bg-black text-white px-2 rounded-full uppercase">Perfect</span> : <span className="text-[10px] font-bold mt-1 bg-black text-white px-2 rounded-full uppercase">Unbalanced</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* The Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {game.players.map((player: any) => {
            const isPositive = player.score > 0;
            const isNegative = player.score < 0;
            const suitInfo = getPlayerSuit(player.username);
            const initial = player.username.charAt(0).toUpperCase();

            return (
              <div key={player.userId} className="relative group">
                <div className={`bg-white rounded-xl p-2 shadow-2xl transition-transform duration-300 group-hover:-translate-y-4 border-2 ${isPositive ? 'border-zinc-300' : isNegative ? 'border-red-600' : 'border-zinc-300'}`}>
                  {/* The Playing Card Inner Border */}
                  <div className={`border-[3px] rounded-lg h-full p-4 flex flex-col items-center justify-between min-h-[380px] relative overflow-hidden ${isPositive ? 'border-black' : isNegative ? 'border-red-600' : 'border-zinc-300'}`}>
                    
                    {/* Corner Indices */}
                    <div className={`absolute top-3 left-3 flex flex-col items-center ${suitInfo.color}`}>
                      <span className="text-xl font-black leading-none">{initial}</span>
                      <span className="text-2xl leading-none">{suitInfo.char}</span>
                    </div>
                    <div className={`absolute bottom-3 right-3 flex flex-col items-center rotate-180 ${suitInfo.color}`}>
                      <span className="text-xl font-black leading-none">{initial}</span>
                      <span className="text-2xl leading-none">{suitInfo.char}</span>
                    </div>

                    {isAdmin && (
                      <button onClick={() => handleRemovePlayer(player.userId, player.username)} className="absolute top-3 right-3 p-1.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-md transition-colors z-20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="mt-8 mb-2 relative z-10 flex flex-col items-center">
                      <div className="p-1 rounded-full bg-black">
                        <PlayerAvatar username={player.username} avatarUrl={getUserAvatar(player.username)} size="lg" />
                      </div>
                      <h4 className="text-3xl font-black text-black uppercase mt-3 tracking-tighter">{player.username}</h4>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        {isPositive ? "Winning" : isNegative ? "Losing" : "Even"}
                      </div>
                    </div>

                    <div className="w-full flex flex-col items-center gap-4 z-10 mt-auto pt-4 border-t-2 border-dashed border-zinc-200">
                      <span className={`text-5xl font-black font-mono tracking-tighter ${isPositive ? 'text-black' : isNegative ? 'text-red-600' : 'text-zinc-400'}`}>
                        {player.score > 0 ? "+" : ""}{player.score}
                      </span>
                      
                      {isAdmin && (
                        <div className="flex w-full items-center justify-between gap-2 bg-zinc-100 p-2 rounded-full border-2 border-zinc-300">
                          <button onClick={() => handleScoreChange(player.userId, -getPlayerInput(player.userId))} disabled={isPending || getPlayerInput(player.userId) <= 0} className="w-10 h-10 shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl transition-all active:scale-90 shadow-inner border-2 border-red-800 disabled:opacity-50">
                            -
                          </button>
                          <input type="number" placeholder="Amt" value={playerInputs[player.userId] || ""} onChange={(e) => setPlayerInputs(prev => ({ ...prev, [player.userId]: e.target.value }))} className="w-full h-10 text-center font-black bg-white text-black border-2 border-black rounded-full focus:outline-none focus:border-red-600 placeholder:text-zinc-400" />
                          <button onClick={() => handleScoreChange(player.userId, getPlayerInput(player.userId))} disabled={isPending || getPlayerInput(player.userId) <= 0} className="w-10 h-10 shrink-0 bg-black hover:bg-zinc-800 text-white rounded-full flex items-center justify-center font-bold text-xl transition-all active:scale-90 shadow-inner border-2 border-zinc-700 disabled:opacity-50">
                            +
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Express Chip Transfer */}
            <div className="lg:col-span-2 bg-zinc-900 border-4 border-black rounded-3xl p-8 shadow-[10px_10px_0_#dc2626]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center border-4 border-black shadow-inner">
                  <HandCoins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase">Chip Transfer</h3>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Move balance instantly</p>
                </div>
              </div>

              <form onSubmit={handleBorrow} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-black p-6 rounded-2xl border-2 border-zinc-800">
                    <label className="block text-white font-black text-sm uppercase tracking-widest mb-4 border-b-2 border-zinc-800 pb-2">1. Giver (+)</label>
                    <div className="flex flex-wrap gap-3">
                      {game.players.map((p: any) => (
                        <button key={p.userId} type="button" onClick={() => { setLender(p.username); if (borrower === p.username) setBorrower(""); }} className={`px-4 py-2 rounded-full font-black text-sm uppercase transition-all border-2 ${lender === p.username ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500'}`}>
                          {p.username}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`bg-black p-6 rounded-2xl border-2 border-zinc-800 transition-opacity ${!lender ? 'opacity-30 pointer-events-none' : ''}`}>
                    <label className="block text-white font-black text-sm uppercase tracking-widest mb-4 border-b-2 border-zinc-800 pb-2">2. Receiver (-)</label>
                    <div className="flex flex-wrap gap-3">
                      {game.players.filter((p: any) => p.username !== lender).map((p: any) => (
                        <button key={p.userId} type="button" onClick={() => setBorrower(p.username)} className={`px-4 py-2 rounded-full font-black text-sm uppercase transition-all border-2 ${borrower === p.username ? 'bg-red-600 text-white border-red-600' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500'}`}>
                          {p.username}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`bg-black p-6 rounded-2xl border-2 border-zinc-800 transition-opacity ${(!lender || !borrower) ? 'opacity-30 pointer-events-none' : ''}`}>
                  <label className="block text-white font-black text-sm uppercase tracking-widest mb-4 border-b-2 border-zinc-800 pb-2">3. Chips Amount</label>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center bg-zinc-900 rounded-full border-2 border-zinc-700 p-2 w-full md:w-auto">
                      <button type="button" onClick={() => setBorrowAmount(Math.max(0, borrowAmount - 1))} className="w-12 h-12 bg-white text-black rounded-full font-black text-xl">-</button>
                      <span className="w-24 text-center font-black font-mono text-3xl text-white">{borrowAmount}</span>
                      <button type="button" onClick={() => setBorrowAmount(borrowAmount + 1)} className="w-12 h-12 bg-white text-black rounded-full font-black text-xl">+</button>
                    </div>
                    <div className="flex flex-1 flex-wrap justify-center md:justify-start gap-3">
                      {[1, 5, 10, 50, 100].map(val => (
                        <button key={val} type="button" onClick={() => setBorrowAmount(borrowAmount + val)} className="w-14 h-14 rounded-full bg-white text-black font-black flex items-center justify-center border-4 border-dashed border-zinc-800 hover:scale-110 transition-transform shadow-inner">
                          {val}
                        </button>
                      ))}
                      <button type="button" onClick={() => setBorrowAmount(0)} className="w-14 h-14 rounded-full bg-red-600 text-white font-black text-xs uppercase flex items-center justify-center border-4 border-dashed border-black hover:scale-110 transition-transform shadow-inner">
                        CLR
                      </button>
                    </div>
                  </div>
                </div>

                {txError && <div className="bg-red-900/50 border-2 border-red-600 text-white font-bold p-4 rounded-xl text-center">{txError}</div>}
                {txSuccess && <div className="bg-white/10 border-2 border-white text-white font-bold p-4 rounded-xl text-center">{txSuccess}</div>}

                <button type="submit" disabled={isTxPending || !lender || !borrower || borrowAmount <= 0} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-2xl uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all active:scale-95 disabled:opacity-50 border-4 border-black">
                  {isTxPending ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : "Confirm Transfer"}
                </button>
              </form>
            </div>

            {/* Right Column Controls */}
            <div className="space-y-8 flex flex-col">
              <div className="bg-white text-black border-[4px] border-black rounded-3xl p-6 shadow-[8px_8px_0_#dc2626]">
                <h3 className="font-black text-xl uppercase mb-4">Add Player</h3>
                <form onSubmit={handleAddPlayer} className="space-y-4">
                  <select value={selectedAddUser} onChange={(e) => setSelectedAddUser(e.target.value)} className="w-full bg-zinc-100 border-2 border-black rounded-xl p-3 font-bold cursor-pointer outline-none">
                    <option value="">Choose...</option>
                    {availableUsersToAdd.map((u) => <option key={u._id} value={u._id}>{u.username}</option>)}
                  </select>
                  {addPlayerError && <div className="text-red-600 font-bold text-xs">{addPlayerError}</div>}
                  <button type="submit" disabled={isAddPending || !selectedAddUser} className="w-full bg-black text-white font-black py-3 rounded-xl uppercase disabled:opacity-50">
                    {isAddPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add to Table"}
                  </button>
                </form>
              </div>

              <div className="bg-white text-black border-[4px] border-black rounded-3xl p-6 shadow-[8px_8px_0_#dc2626]">
                <h3 className="font-black text-xl uppercase mb-4">Decrease All</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button key={val} onClick={() => handleDecreaseAll(val)} disabled={isPending || game.players.length === 0} className="w-full aspect-square bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 border-2 border-black">
                      -{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-red-600 text-white border-[4px] border-black rounded-3xl p-6 shadow-[8px_8px_0_#ffffff] mt-auto">
                <h3 className="font-black text-xl uppercase mb-2">Finalize</h3>
                <p className="text-xs font-bold mb-4 bg-black/20 p-2 rounded-lg">Closing the lobby locks scores.</p>
                <button onClick={handleEndGame} disabled={isPending} className="w-full bg-black hover:bg-zinc-900 text-white font-black py-4 rounded-xl uppercase transition-colors disabled:opacity-50">
                  {isPending ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "End Game & Save"}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Transaction History */}
        <div className="bg-zinc-900 border-4 border-black rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <Clock className="w-6 h-6 text-red-600" /> Transaction Ledger
          </h3>
          {game.transactions.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-zinc-700 rounded-xl">
              <span className="text-zinc-500 font-bold uppercase tracking-widest">No transactions</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {[...game.transactions].reverse().map((tx: any, idx: number) => (
                <div key={tx._id || idx} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-black border-2 border-zinc-800 rounded-2xl">
                  <div className="flex items-center gap-3 w-full sm:w-1/3">
                    <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center uppercase">{tx.fromUser.charAt(0)}</div>
                    <div>
                      <span className="block text-white font-black uppercase">{tx.fromUser}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Lender</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full sm:w-1/3">
                    <div className="bg-white text-black px-4 py-2 rounded-full font-black font-mono border-4 border-dashed border-zinc-300 flex items-center gap-2">
                      <MoveRight className="w-4 h-4 text-zinc-400 hidden sm:block" />
                      {formatTnd(tx.amount)}
                      <MoveRight className="w-4 h-4 text-zinc-400 hidden sm:block" />
                    </div>
                    <span className="text-[10px] text-zinc-600 font-bold mt-1">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-end gap-3 w-full sm:w-1/3 text-right">
                    <div>
                      <span className="block text-red-500 font-black uppercase">{tx.toUser}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Borrower</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black flex items-center justify-center uppercase border-2 border-black">{tx.toUser.charAt(0)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
"""

with open('app/game/[id]/GameClient.tsx', 'w', encoding='utf-8') as f:
    f.write(game_client)
