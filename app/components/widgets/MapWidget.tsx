"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { C } from "@/lib/theme";
import type { MapWidgetProps as MapWidgetDataProps } from "@/lib/types";

export type MapWidgetProps = MapWidgetDataProps & {
  accent: string;
  accentDim: string;
};

const MIN_MARKER_RADIUS = 6;
const MAX_MARKER_RADIUS = 28;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function computeCenter(
  markers: Array<{ lat: number; lng: number }>,
): [number, number] | null {
  if (!markers.length) return null;
  const sumLat = markers.reduce((s, m) => s + m.lat, 0);
  const sumLng = markers.reduce((s, m) => s + m.lng, 0);
  return [sumLat / markers.length, sumLng / markers.length];
}

function computeZoom(markers: Array<{ lat: number; lng: number }>): number {
  if (markers.length <= 1) return 5;
  const lats = markers.map((m) => m.lat);
  const lngs = markers.map((m) => m.lng);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const span = Math.max(latSpan, lngSpan);
  if (span < 1) return 10;
  if (span < 5) return 7;
  if (span < 20) return 5;
  if (span < 60) return 3;
  return 2;
}

export function MapWidget({
  markers = [],
  center,
  zoom,
  unit,
  scaledMarkers,
  accent,
}: MapWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Inject popup styles
    if (!document.getElementById("pagelight-map-css")) {
      const style = document.createElement("style");
      style.id = "pagelight-map-css";
      style.textContent = `
        .pagelight-popup .leaflet-popup-content-wrapper {
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          padding: 0;
        }
        .pagelight-popup .leaflet-popup-content {
          margin: 12px 14px;
        }
        .pagelight-popup .leaflet-popup-tip-container {
          display: none;
        }
        .pagelight-popup .leaflet-popup-close-button {
          color: ${C.muted} !important;
          font-size: 16px;
          top: 6px !important;
          right: 8px !important;
        }
        .leaflet-container {
          font-family: 'IBM Plex Mono', monospace;
          background: ${C.bg};
        }
        .leaflet-container path.leaflet-interactive:focus {
          outline: none;
        }
        .leaflet-control-zoom a {
          background: ${C.surface} !important;
          border-color: ${C.border} !important;
          color: ${C.muted} !important;
        }
        .leaflet-control-zoom a:hover {
          background: ${C.panel} !important;
          color: ${C.text} !important;
        }
        .leaflet-bar {
          border: 1px solid ${C.border} !important;
          box-shadow: none !important;
        }
        .leaflet-control-attribution {
          background: ${C.surface}cc !important;
          color: ${C.muted} !important;
          font-size: 9px !important;
          border-top: 1px solid ${C.border} !important;
        }
        .leaflet-control-attribution a {
          color: ${C.muted} !important;
        }
      `;
      document.head.appendChild(style);
    }

    import("leaflet").then((L) => {
      const container = containerRef.current;
      if (!container) return;

      const resolvedCenter: [number, number] =
        center ?? computeCenter(markers) ?? [20, 0];
      const resolvedZoom =
        zoom ?? (markers.length ? computeZoom(markers) : 2);

      const map = L.map(container, {
        center: resolvedCenter,
        zoom: resolvedZoom,
        scrollWheelZoom: true,
        attributionControl: true,
        zoomControl: true,
      });

      // Dark CartoDB tile layer matching app's dark aesthetic
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);

      const maxVal =
        markers.length > 0
          ? Math.max(...markers.map((m) => m.value ?? 0), 1)
          : 1;

      markers.forEach((marker) => {
        const hasValue = marker.value !== undefined && marker.value !== null;
        const radius =
          scaledMarkers && hasValue
            ? Math.max(
                MIN_MARKER_RADIUS,
                Math.min(MAX_MARKER_RADIUS, ((marker.value as number) / maxVal) * MAX_MARKER_RADIUS),
              )
            : MIN_MARKER_RADIUS + 2;

        const circle = L.circleMarker([marker.lat, marker.lng], {
          radius,
          fillColor: accent,
          color: accent,
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.25,
        });

        const valueHtml = hasValue
          ? `<div style="font-size:11px;color:${C.body};margin-top:2px;">${(marker.value as number).toLocaleString()}${unit ? " " + escapeHtml(unit) : ""}</div>`
          : "";
        const tooltipHtml = marker.tooltip
          ? `<div style="font-size:11px;color:${C.muted};margin-top:4px;line-height:1.4;">${escapeHtml(marker.tooltip)}</div>`
          : "";

        const popupContent = `
          <div style="font-family:'IBM Plex Mono',monospace;">
            <div style="font-weight:600;font-size:12px;color:${accent};">${escapeHtml(marker.label)}</div>
            ${valueHtml}
            ${tooltipHtml}
          </div>
        `;

        circle.bindPopup(popupContent, { className: "pagelight-popup", offset: [0, -(radius + 2)] });
        circle.bindTooltip(marker.label, {
          direction: "top",
          offset: [0, -radius - 2],
          opacity: 1,
          className: "pagelight-tooltip",
        });

        circle.addTo(map);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Props are static article data — the map initializes once per mount.
    // Leaflet maps are not designed for incremental re-initialization,
    // so we intentionally omit prop dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 400,
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: C.bg,
      }}
    />
  );
}
