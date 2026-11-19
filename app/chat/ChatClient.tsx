"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessageAction, getMessagesAction, deleteMessageAction } from "../actions";
import {
  Send,
  MessageSquare,
  Users,
  Globe,
  Trash2,
  Smile,
  Shield,
  Loader2,
  Spade,
  CheckCheck,
} from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";

interface ChatClientProps {
  currentUser: { username: string; role: "admin" | "player" };
  allPlayers: any[];
  initialDmTarget?: string | null;
  activeGameId?: string | null;
}

export default function ChatClient({
  currentUser,
  allPlayers,
  initialDmTarget = null,
  activeGameId = null,
}: ChatClientProps) {
  const [activeTab, setActiveTab] = useState<"global" | "direct" | "game">(
    initialDmTarget ? "direct" : "global"
  );
  const [selectedRecipient, setSelectedRecipient] = useState<string>(
    initialDmTarget || (allPlayers[0]?.username ?? "")
  );

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages function
  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await getMessagesAction({
        channelType: activeTab,
        recipient: activeTab === "direct" ? selectedRecipient : undefined,
        gameId: activeTab === "game" && activeGameId ? activeGameId : undefined,
      });
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Initial fetch and on tab/recipient change
  useEffect(() => {
    fetchMessages(true);
  }, [activeTab, selectedRecipient]);

  // Polling for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeTab, selectedRecipient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      const res = await sendMessageAction({
        channelType: activeTab,
        content,
        recipient: activeTab === "direct" ? selectedRecipient : undefined,
        gameId: activeTab === "game" && activeGameId ? activeGameId : undefined,
      });

      if (res && res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessageAction(msgId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, deleted: true, content: "This message was deleted" } : m
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const quickEmojis = ["♠️", "♥️", "♦️", "♣️", "🔥", "🏆", "💰", "😎", "😂", "👀"];

  return (
    <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row h-[750px]">
      {/* Sidebar: Channel & DM Switcher */}
      <div className="w-full md:w-72 bg-zinc-950/70 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Chat Channels
          </h2>
        </div>

        {/* Channel Selector */}
        <div className="p-3 space-y-1">
          <button
            onClick={() => setActiveTab("global")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === "global"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe className="w-4 h-4" /> Global Lounge
          </button>

          {activeGameId && (
            <button
              onClick={() => setActiveTab("game")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === "game"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Spade className="w-4 h-4 text-amber-400" /> Live Table Chat
            </button>
          )}

          <button
            onClick={() => setActiveTab("direct")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === "direct"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" /> Direct Messages
          </button>
        </div>

        {/* DM User Sub-list */}
        {activeTab === "direct" && (
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 border-t border-zinc-800/80 custom-scrollbar">
            <span className="text-[10px] font-black uppercase text-zinc-500 px-2 block mb-1">
              Select Player
            </span>
            {allPlayers
              .filter((p) => p.username !== currentUser.username)
              .map((p) => {
                const isSelected = selectedRecipient === p.username;
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedRecipient(p.username)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold uppercase transition-all text-left ${
                      isSelected
                        ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <PlayerAvatar username={p.username} avatarUrl={p.avatarUrl} size="sm" />
                    <span className="truncate">{p.username}</span>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Main Chat Conversation */}
      <div className="flex-1 flex flex-col justify-between h-full bg-zinc-900/40">
        {/* Chat Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            {activeTab === "global" ? (
              <>
                <Globe className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-100">Global Poker Lounge</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold">Community public room</span>
                </div>
              </>
            ) : activeTab === "game" ? (
              <>
                <Spade className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-100">Live Table Room</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold">Current session talk</span>
                </div>
              </>
            ) : (
              <>
                <PlayerAvatar username={selectedRecipient} size="sm" />
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-100">{selectedRecipient}</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold">Private Direct Message</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40 text-emerald-500" />
              <p className="text-xs uppercase font-bold tracking-wider">
                No messages here yet. Break the ice!
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender === currentUser.username;
              return (
                <div
                  key={m._id}
                  className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <PlayerAvatar username={m.sender} avatarUrl={m.senderAvatar} size="sm" />
                  )}

                  <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-[10px] font-black uppercase text-zinc-400 px-1">
                        {m.sender}
                      </span>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed relative group shadow-sm ${
                        m.deleted
                          ? "bg-zinc-800/40 text-zinc-500 italic border border-zinc-800"
                          : isMe
                          ? "bg-emerald-600 text-white rounded-br-sm shadow-emerald-950/20"
                          : "bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700/60"
                      }`}
                    >
                      <p className="break-words">{m.content}</p>

                      <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] opacity-75">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>

                      {/* Delete button on hover for author or admin */}
                      {!m.deleted && (isMe || currentUser.role === "admin") && (
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="absolute -top-2.5 -right-2.5 p-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input & Quick Emojis */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
          {/* Quick emoji row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-base select-none custom-scrollbar">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="p-1 rounded-lg hover:bg-zinc-800 transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Message ${
                activeTab === "global"
                  ? "everyone..."
                  : activeTab === "game"
                  ? "the table..."
                  : selectedRecipient + "..."
              }`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 px-4 py-3 rounded-2xl text-xs font-semibold text-zinc-200 outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
