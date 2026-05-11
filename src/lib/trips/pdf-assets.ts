import { readFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";

import type { AdminTripRecord } from "@/types";

interface TripPdfAssets {
  directionsUrl: string;
  portalLogoDataUrl: string | null;
  qrCodeDataUrl: string | null;
  staticMapDataUrl: string | null;
}

function formatCoordinatePair(lat: number, lng: number) {
  return `${lat},${lng}`;
}

export function buildTripDirectionsUrl(trip: AdminTripRecord) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("travelmode", "driving");

  if (trip.school_lat !== null && trip.school_lng !== null) {
    url.searchParams.set("origin", formatCoordinatePair(trip.school_lat, trip.school_lng));
  } else if (trip.school_address.trim()) {
    url.searchParams.set("origin", trip.school_address.trim());
  }

  url.searchParams.set("destination", formatCoordinatePair(trip.lugar_lat, trip.lugar_lng));
  url.searchParams.set("destination_place_id", trip.lugar_nombre);

  return url.toString();
}

function buildTripStaticMapUrl(trip: AdminTripRecord, apiKey: string) {
  if (!trip.ruta_polyline || trip.school_lat === null || trip.school_lng === null) {
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
  url.searchParams.set("size", "1200x680");
  url.searchParams.set("scale", "2");
  url.searchParams.set("maptype", "roadmap");
  url.searchParams.set("path", `color:0x0F4C81FF|weight:6|enc:${trip.ruta_polyline}`);
  url.searchParams.append("markers", `color:0x0F4C81|label:E|${formatCoordinatePair(trip.school_lat, trip.school_lng)}`);
  url.searchParams.append("markers", `color:0xB42318|label:D|${formatCoordinatePair(trip.lugar_lat, trip.lugar_lng)}`);
  url.searchParams.set("key", apiKey);

  return url.toString();
}

async function buildStaticMapDataUrl(trip: AdminTripRecord) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const staticMapUrl = buildTripStaticMapUrl(trip, apiKey);

  if (!staticMapUrl) {
    return null;
  }

  const response = await fetch(staticMapUrl, {
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const mimeType = response.headers.get("content-type") || "image/png";
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
}

async function buildQrCodeDataUrl(value: string) {
  try {
    return await QRCode.toDataURL(value, {
      margin: 1,
      width: 180,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });
  } catch {
    return null;
  }
}

async function buildPortalLogoDataUrl() {
  try {
    const filePath = path.join(process.cwd(), "public", "SLEPCOLCHAGUA.webp");
    const imageBuffer = await readFile(filePath);

    return `data:image/webp;base64,${imageBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadTripPdfAssets(trip: AdminTripRecord): Promise<TripPdfAssets> {
  const directionsUrl = buildTripDirectionsUrl(trip);
  const [portalLogoDataUrl, qrCodeDataUrl, staticMapDataUrl] = await Promise.all([
    buildPortalLogoDataUrl(),
    buildQrCodeDataUrl(directionsUrl),
    buildStaticMapDataUrl(trip),
  ]);

  return {
    directionsUrl,
    portalLogoDataUrl,
    qrCodeDataUrl,
    staticMapDataUrl,
  };
}