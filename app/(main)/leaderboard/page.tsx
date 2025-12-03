"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopContributors from "@/components/Contributors/TopContributors";

interface Contributor {
  user_id: string;
  username: string;
  entry_count: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    try {
      const response = await fetch("/api/contributors");
      if (!response.ok) {
        throw new Error("Failed to load contributors");
      }
      const data = await response.json();
      setContributors(data);
    } catch (error) {
      console.error("Error loading contributors:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/map"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          ← Back to Map
        </Link>
      </div>

      <h1 className="mb-6 text-3xl font-bold">Leaderboard</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Top contributors to the Dead Tree Tracker community
      </p>

      {contributors.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No contributors yet. Be the first to add an entry!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contributors.map((contributor) => (
            <div
              key={contributor.user_id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getRankIcon(contributor.rank)}</span>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    @{contributor.username}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {contributor.entry_count} {contributor.entry_count === 1 ? "entry" : "entries"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {contributor.entry_count}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  trees tracked
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

