"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Contributor {
  user_id: string;
  username: string;
  entry_count: number;
  rank: number;
}

interface TopContributorsProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export default function TopContributors({
  limit = 5,
  showTitle = true,
  compact = false,
}: TopContributorsProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContributors();
  }, [limit]);

  const loadContributors = async () => {
    try {
      const response = await fetch("/api/contributors");
      if (!response.ok) {
        throw new Error("Failed to load contributors");
      }
      const data = await response.json();
      setContributors(data.slice(0, limit));
    } catch (error) {
      console.error("Error loading contributors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (contributors.length === 0) {
    return null;
  }

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

  if (compact) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {showTitle && (
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Top Contributors
          </h3>
        )}
        <div className="space-y-1">
          {contributors.map((contributor) => (
            <div
              key={contributor.user_id}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-600 dark:text-gray-400">
                {getRankIcon(contributor.rank)} @{contributor.username}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {contributor.entry_count}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {showTitle && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Contributors
          </h3>
          <Link
            href="/leaderboard"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            View All →
          </Link>
        </div>
      )}
      <div className="space-y-2">
        {contributors.map((contributor) => (
          <div
            key={contributor.user_id}
            className="flex items-center justify-between rounded-md bg-gray-50 p-2 dark:bg-gray-700/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getRankIcon(contributor.rank)}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                @{contributor.username}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {contributor.entry_count} {contributor.entry_count === 1 ? "entry" : "entries"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

