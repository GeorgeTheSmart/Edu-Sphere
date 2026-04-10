"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Mail, FileText, Camera, Edit3, Check, X, Phone, Calendar, Flame, BookOpen, Clock, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";

interface DashboardUser {
  id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  created_at?: string;
  last_active?: string;
  current_level?: string;
  is_active?: number;
}

interface DashboardProfile {
  learning_streak?: number;
  total_study_time?: number;
  courses_completed?: number;
  learning_style?: string;
  confidence_pattern?: string;
  recommended_starting_level?: string;
  total_xp?: number;
  current_level?: number;
  avg_performance?: number;
  total_sessions?: number;
}

interface DashboardPayload {
  user?: DashboardUser;
  profile?: DashboardProfile;
}

const BIO_STORAGE_PREFIX = "learnsphere_profile_bio_";
const USER_NAME_KEY = "learnsphere_user_name";
const USER_EMAIL_KEY = "learnsphere_user_email";
const USER_PHONE_KEY = "learnsphere_user_phone";

function parseGoals(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payload, setPayload] = useState<DashboardPayload | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const [tempData, setTempData] = useState(profileData);
  const [isSaving, setIsSaving] = useState(false);

  const loadDashboard = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoadError("Sign in to view your profile.");
      setLoading(false);
      return;
    }

    // Fallback to whatever the user typed on login/register, so the Profile page
    // is never "empty" even if the backend request fails.
    const storedName = localStorage.getItem(USER_NAME_KEY) ?? "";
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY) ?? "";
    const storedBio = localStorage.getItem(`${BIO_STORAGE_PREFIX}${userId}`) ?? "";

    setProfileData({
      name: storedName || "Learner",
      email: storedEmail || "—",
      bio: storedBio,
    });
    setTempData({
      name: storedName || "Learner",
      email: storedEmail,
      bio: storedBio,
    });

    setLoading(true);
    setLoadError(null);

    try {
      const res = await apiFetch(`/dashboard/${userId}`);
      if (!res.ok) {
        // If we have fallback values, don't block editing behind an error banner.
        const hasFallback = Boolean(storedName || storedEmail || storedBio);
        if (!hasFallback) setLoadError("Could not load your profile. Try again later.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as DashboardPayload & {
        learning_goals?: unknown;
      };
      setPayload(data);

      const u = data.user;

      const goals = parseGoals(data.learning_goals);
      const defaultBio =
        goals.length > 0
          ? `Goals: ${goals.slice(0, 3).join(" · ")}`
          : data.profile?.learning_style
            ? `Preferred learning: ${data.profile.learning_style.replace(/_/g, " ")}${
                data.profile.recommended_starting_level
                  ? ` · Starting level: ${data.profile.recommended_starting_level}`
                  : ""
              }`
            : "";

      setProfileData({
        name: u?.name?.trim() || storedName || "Learner",
        email: u?.email?.trim() || storedEmail || "—",
        bio: storedBio || defaultBio,
      });
      setTempData({
        name: u?.name?.trim() || storedName || "Learner",
        email: u?.email?.trim() || storedEmail || "",
        bio: storedBio || defaultBio,
      });
    } catch {
      const hasFallback = Boolean(
        localStorage.getItem(USER_NAME_KEY) ||
          localStorage.getItem(USER_EMAIL_KEY) ||
          localStorage.getItem(`${BIO_STORAGE_PREFIX}${localStorage.getItem("userId")}`)
      );
      if (!hasFallback) setLoadError("Network error while loading profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    setIsSaving(true);
    try {
      if (userId) {
        localStorage.setItem(`${BIO_STORAGE_PREFIX}${userId}`, tempData.bio);
        localStorage.setItem(USER_NAME_KEY, tempData.name);
        localStorage.setItem(USER_EMAIL_KEY, tempData.email);
        // Phone is not editable on this screen yet; keep whatever was set on login.
        localStorage.setItem(
          USER_PHONE_KEY,
          localStorage.getItem(USER_PHONE_KEY) ?? ""
        );
      }
      setProfileData(tempData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const user = payload?.user;
  const prof = payload?.profile;

  const initials =
    (profileData.name || user?.name || "L")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "LS";

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading profile…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-amber-900">
          <h1 className="text-xl font-semibold mb-2">Profile unavailable</h1>
          <p>{loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Your account and learning stats from LearnSphere</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="relative -mt-16 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
                <div className="relative mb-4 sm:mb-0">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                    aria-hidden
                  >
                    {initials}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-colors opacity-60 cursor-not-allowed"
                    title="Photo upload is not available yet"
                    disabled
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                      <p className="text-gray-600 flex items-center mt-1">
                        <Mail size={16} className="mr-2 shrink-0" />
                        {profileData.email}
                      </p>
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <Edit3 size={16} />
                        <span>Edit profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account details from API (read-only) */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.phone_number && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <Phone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-gray-900 font-medium">{user.phone_number}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Member since</p>
                  <p className="text-gray-900 font-medium">{formatDate(user?.created_at)}</p>
                </div>
              </div>
              {user?.last_active && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                  <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last active</p>
                    <p className="text-gray-900 font-medium">{formatDate(user.last_active)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User size={16} className="mr-2 text-indigo-600" />
                  Full name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                    {profileData.name}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Stored locally (and also refreshed from the backend when available).
                </p>
              </div>

              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Mail size={16} className="mr-2 text-indigo-600" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                    {profileData.email}
                  </div>
                )}
              </div>

              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FileText size={16} className="mr-2 text-indigo-600" />
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={tempData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white resize-none"
                    placeholder="Tell us about yourself…"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700 leading-relaxed min-h-[5rem]">
                    {profileData.bio || "No bio yet. Add one to personalize your profile."}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Bio (and your name/email edits) are saved on this device.</p>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Save changes</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning stats from dashboard API */}
        {prof && (
          <div className="mt-6 bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Learning snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <Flame className="w-5 h-5 text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{prof.learning_streak ?? 0}</p>
                <p className="text-xs text-gray-600">Day streak</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <BookOpen className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{prof.courses_completed ?? 0}</p>
                <p className="text-xs text-gray-600">Courses done</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Clock className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{prof.total_study_time ?? 0}</p>
                <p className="text-xs text-gray-600">Study hours</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{prof.total_xp ?? 0}</p>
                <p className="text-xs text-gray-600">Total XP</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
              {prof.learning_style && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                  Style: {prof.learning_style}
                </span>
              )}
              {prof.confidence_pattern && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                  Confidence: {prof.confidence_pattern}
                </span>
              )}
              {prof.recommended_starting_level && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                  Level: {prof.recommended_starting_level}
                </span>
              )}
              {typeof prof.avg_performance === "number" && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                  Avg performance: {prof.avg_performance}%
                </span>
              )}
              {typeof prof.total_sessions === "number" && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                  Sessions: {prof.total_sessions}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              className="p-4 border-2 border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-colors group"
            >
              <div className="font-medium text-gray-900 group-hover:text-indigo-600">Change password</div>
              <div className="text-sm text-gray-500 mt-1">Coming soon</div>
            </button>
            <button
              type="button"
              className="p-4 border-2 border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-colors group"
            >
              <div className="font-medium text-gray-900 group-hover:text-indigo-600">Privacy settings</div>
              <div className="text-sm text-gray-500 mt-1">Coming soon</div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
