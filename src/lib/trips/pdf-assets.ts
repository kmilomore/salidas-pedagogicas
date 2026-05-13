import { readFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";
import sharp from "sharp";

import type { AdminTripRecord } from "@/types";

interface TripPdfAssets {
  directionsUrl: string;
  portalLogoDataUrl: string | null;
  qrCodeDataUrl: string | null;
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
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadTripPdfAssets(trip: AdminTripRecord): Promise<TripPdfAssets> {
  const directionsUrl = buildTripDirectionsUrl(trip);
  const [portalLogoDataUrl, qrCodeDataUrl] = await Promise.all([
    buildPortalLogoDataUrl(),
    buildQrCodeDataUrl(directionsUrl),
  ]);

  return {
    directionsUrl,
    portalLogoDataUrl,
    qrCodeDataUrl,
  };
}