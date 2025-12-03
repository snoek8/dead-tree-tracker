"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TreeEntry } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function EntriesPage() {
  const [entries, setEntries] = useState<TreeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEntries, setUserEntries] = useState<TreeEntry[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      if (user) {
        setUserEntries(data?.filter((e) => e.user_id === user.id) || []);
      }
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const { error } = await supabase.from("entries").delete().eq("id", id);
      if (error) throw error;
      loadEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading entries...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Entries</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Total: {entries.length} entries | Your entries: {userEntries.length}
          </p>
        </div>
        <Link
          href="/map"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          View Map
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const isOwner = userEntries.some((e) => e.id === entry.id);
          return (
            <div
              key={entry.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={entry.photo_url}
                  alt="Dead tree"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
                {entry.notes && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {entry.notes}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                </p>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="mt-4 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No entries yet. Be the first to add one!
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
          >
            Add Entry
          </Link>
        </div>
      )}
    </div>
  );
}

