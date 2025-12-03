"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TreeEntry } from "@/lib/types";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  entries: TreeEntry[];
}

export default function MapComponent({ entries }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 2);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Wait for map to be fully ready before allowing markers
    map.whenReady(() => {
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Map might already be removed
        }
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    // Wait for map to be fully initialized and ready
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    // Check if map container is actually in the DOM and map is ready
    try {
      const container = map.getContainer();
      if (!container || !container.parentElement) {
        return;
      }
    } catch (e) {
      // Map not ready yet
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        if (map.hasLayer(marker)) {
          marker.remove();
        }
      } catch (e) {
        // Marker might already be removed
      }
    });
    markersRef.current = [];

    // Add markers for each entry
    entries.forEach((entry) => {
      if (!mapRef.current) return;

      try {
        const marker = L.marker([entry.latitude, entry.longitude]);

        // Check if map is ready before adding
        if (map && map.getContainer()) {
          marker.addTo(map);

          const popupContent = `
            <div style="max-width: 300px;">
              <img src="${
                entry.photo_url
              }" alt="Dead tree" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(
                entry.created_at
              ).toLocaleDateString()}</p>
              ${
                entry.notes
                  ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${entry.notes}</p>`
                  : ""
              }
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Location: ${entry.latitude.toFixed(
                6
              )}, ${entry.longitude.toFixed(6)}</p>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        }
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });

    // Fit map to show all markers if there are entries
    if (entries.length > 0 && mapRef.current && markersRef.current.length > 0) {
      try {
        const group = new L.FeatureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [entries, mapReady]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}
