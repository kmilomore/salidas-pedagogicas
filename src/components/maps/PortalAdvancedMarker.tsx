"use client";

import { useEffect } from "react";
import { useGoogleMap } from "@react-google-maps/api";

interface PortalAdvancedMarkerProps {
  position: google.maps.LatLngLiteral;
  title?: string;
  label: string;
  variant?: "school" | "destination";
}

const markerStyles = {
  school: {
    background: "#1B4F8A",
    border: "#143B66",
  },
  destination: {
    background: "#0F766E",
    border: "#115E59",
  },
};

export default function PortalAdvancedMarker({
  position,
  title,
  label,
  variant = "destination",
}: PortalAdvancedMarkerProps) {
  const map = useGoogleMap();

  useEffect(() => {
    if (!map || typeof window === "undefined") {
      return;
    }

    const AdvancedMarkerElement = window.google.maps.marker?.AdvancedMarkerElement;

    if (!AdvancedMarkerElement) {
      return;
    }

    const palette = markerStyles[variant];
    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.height = "34px";
    content.style.width = "34px";
    content.style.alignItems = "center";
    content.style.justifyContent = "center";
    content.style.borderRadius = "9999px";
    content.style.border = `2px solid ${palette.border}`;
    content.style.background = palette.background;
    content.style.color = "#ffffff";
    content.style.fontSize = "14px";
    content.style.fontWeight = "700";
    content.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.18)";
    content.textContent = label;

    const marker = new AdvancedMarkerElement({
      map,
      position,
      title,
      content,
    });

    return () => {
      marker.map = null;
    };
  }, [label, map, position, title, variant]);

  return null;
}