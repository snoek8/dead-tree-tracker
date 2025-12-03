"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";
import { compressImage } from "@/lib/utils/imageCompression";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setLocationError(
          "Unable to get your location. Please enable location permissions."
        );
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setFile(selectedFile);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !location) {
      setError("Please select a photo and ensure location is available");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user and ensure session is fresh
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in. Please try logging in again.");
      }

      // Compress image
      const compressedFile = await compressImage(file);

      // Upload to Supabase Storage
      // Always use .jpg extension for compressed images
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("tree-photos")
        .upload(fileName, compressedFile, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL - use the path from upload response
      const filePath = uploadData?.path || fileName;
      
      // Construct the correct public URL format for public buckets
      // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const correctPublicUrl = `${supabaseUrl}/storage/v1/object/public/tree-photos/${filePath}`;
      
      console.log("Uploaded file path:", filePath);
      console.log("Public URL:", correctPublicUrl);

      // Save entry to database via API route (better auth handling)
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photo_url: correctPublicUrl,
          latitude: location.lat,
          longitude: location.lng,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save entry");
      }

      const insertedData = await response.json();

      // Show success message
      setSuccessMessage("Entry uploaded successfully!");
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/map");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to upload entry");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

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

      <h1 className="mb-6 text-3xl font-bold">Upload Dead Tree Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Photo <span className="text-red-500">*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 max-h-64 rounded-lg object-cover"
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Location</label>
          {location ? (
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                Location captured: {location.lat.toFixed(6)},{" "}
                {location.lng.toFixed(6)}
              </p>
              <button
                type="button"
                onClick={getLocation}
                className="mt-2 text-sm text-green-700 underline hover:text-green-900 dark:text-green-300"
              >
                Refresh location
              </button>
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {locationError ||
                  "Getting your location..."}
              </p>
              <button
                type="button"
                onClick={getLocation}
                className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900 dark:text-yellow-300"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Add any additional notes about this dead tree..."
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file || !location}
          className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Submit Entry"}
        </button>
      </form>

      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          duration={2000}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}

