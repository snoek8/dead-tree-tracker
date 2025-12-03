"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { TreeEntry } from "@/lib/types";
import Link from "next/link";
import TopContributors from "@/components/Contributors/TopContributors";

const MapComponent = dynamic(() => import("@/components/Map/MapComponent"), {
  ssr: false,
});

export default function MapPage() {
  const [entries, setEntries] = useState<TreeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await fetch("/api/entries");
      if (!response.ok) {
        throw new Error("Failed to load entries");
      }
      const data = await response.json();
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <div className="absolute left-4 top-4 z-[1000] space-y-2">
        <Link
          href="/upload"
          className="block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
        >
          + Add Entry
        </Link>
        <Link
          href="/entries"
          className="block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          View All Entries
        </Link>
      </div>
      <div className="absolute right-4 top-4 z-[1000]">
        <TopContributors limit={5} showTitle={true} compact={true} />
      </div>
      <MapComponent entries={entries} />
    </div>
  );
}

