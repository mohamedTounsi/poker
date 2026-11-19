"use client";

import { useState, useRef, useActionState } from "react";
import { updateProfileAction, changePasswordAction } from "../actions";
import {
  User,
  Key,
  Camera,
  Moon,
  Sun,
  Bell,
  Loader2,
  Check,
  ShieldCheck,
  Palette,
} from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";

interface SettingsClientProps {
  user: any;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfileAction,
    null
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    changePasswordAction,
    null
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image must be smaller than 8MB");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) setUploadError(data.error);
      else setAvatarUrl(data.url);
    } catch {
      setUploadError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Avatar & Profile Information */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-100 uppercase">
              Public Profile & Bio
            </h2>
            <p className="text-xs text-zinc-400">Visible to all players on the platform</p>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <PlayerAvatar username={user.username} avatarUrl={avatarUrl} size="xxl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Change avatar photo"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-black text-zinc-100 uppercase">{user.username}</h3>
            <p className="text-xs text-zinc-400">
              Upload a custom player avatar (JPG, PNG, WebP up to 8MB)
            </p>
            {uploadError && <p className="text-rose-400 text-xs font-bold">{uploadError}</p>}
          </div>
        </div>

        {/* Bio Form */}
        <form action={profileAction} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1.5">
              Player Bio / Motto
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={user?.bio || ""}
              placeholder="e.g. Tight aggressive. Always folding pre."
              maxLength={250}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 p-3.5 rounded-2xl text-xs font-medium text-zinc-200 outline-none resize-none"
            />
            <span className="text-[10px] text-zinc-500 float-right mt-1">Max 250 characters</span>
          </div>

          {profileState?.error && (
            <p className="text-rose-400 text-xs font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
              {profileState.error}
            </p>
          )}
          {profileState?.success && (
            <p className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
              {profileState.success}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProfilePending}
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProfilePending ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Security: Password Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-100 uppercase">
              Account Security
            </h2>
            <p className="text-xs text-zinc-400">Update your account credentials</p>
          </div>
        </div>

        <form action={passwordAction} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1.5">
              Current Password
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 p-3 rounded-xl text-xs font-medium text-zinc-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1.5">
              New Password (Min. 6 chars)
            </label>
            <input
              name="newPassword"
              type="password"
              minLength={6}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 p-3 rounded-xl text-xs font-medium text-zinc-200 outline-none"
            />
          </div>

          {passwordState?.error && (
            <p className="text-rose-400 text-xs font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
              {passwordState.error}
            </p>
          )}
          {passwordState?.success && (
            <p className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
              {passwordState.success}
            </p>
          )}

          <button
            type="submit"
            disabled={isPasswordPending}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPasswordPending ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
