"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      const data = await response.json();
      setCurrentUsername(data.username);
      setUsername(data.username || "");
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update username");
      }

      const data = await response.json();
      setCurrentUsername(data.username);
      setSuccessMessage("Username updated successfully!");
      
      // Refresh the page data after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update username");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/map"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          ← Back to Map
        </Link>
      </div>

      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Username
            </label>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Choose a unique username (3-30 characters, letters, numbers,
              underscores, and hyphens only). This will be displayed on your
              entries.
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              pattern="[a-zA-Z0-9_-]{3,30}"
              maxLength={30}
            />
            {currentUsername && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Current username: <strong>@{currentUsername}</strong>
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !username || username === currentUsername}
            className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Username"}
          </button>
        </form>
      </div>

      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          duration={3000}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}

