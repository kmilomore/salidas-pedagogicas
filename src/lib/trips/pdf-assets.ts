import { readFile } from "node:fs/promises";
import path from "node:path";

import polyline from "@mapbox/polyline";
import QRCode from "qrcode";
import sharp from "sharp";

import type { AdminTripRecord } from "@/types";

interface TripPdfAssets {
  directionsUrl: string;
  portalLogoDataUrl: string | null;
  qrCodeDataUrl: string | null;
  staticMapDataUrl: string | null;
}

const outboundPalette = ["#1B4F8A", "#0F766E", "#0369A1", "#C98908", "#BE123C", "#143B66"];
const returnColor = "#EA580C";

function resolveSegmentColor(kind: "outbound" | "return", order: number) {
  return kind === "return" ? returnColor : outboundPalette[order % outboundPalette.length];
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

  if (trip.ruta_segmentos.length) {
    trip.ruta_segmentos.forEach((segment) => {
      const encodedSegment = polyline.encode(segment.path.map((point) => [point.lat, point.lng]));
      const color = resolveSegmentColor(segment.kind, segment.order).replace("#", "0x");
      url.searchParams.append("path", `color:${color}FF|weight:${segment.kind === "return" ? 5 : 6}|enc:${encodedSegment}`);
    });
  } else {
    url.searchParams.set("path", `color:0x0F4C81FF|weight:6|enc:${trip.ruta_polyline}`);
  }

  url.searchParams.append("markers", `color:0x0F4C81|label:E|${formatCoordinatePair(trip.school_lat, trip.school_lng)}`);
  url.searchParams.append("markers", `color:0xB42318|label:D|${formatCoordinatePair(trip.lugar_lat, trip.lugar_lng)}`);
  url.searchParams.set("key", apiKey);

  return url.toString();
}

function encodeSvgDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildStaticRouteSvgDataUrl(trip: AdminTripRecord) {
  if (!trip.ruta_polyline || trip.school_lat === null || trip.school_lng === null) {
    return null;
  }

  try {
    const segments = trip.ruta_segmentos.length
      ? trip.ruta_segmentos
      : [
          {
            id: "segment-fallback",
            label: "Ruta",
            kind: "outbound" as const,
            order: 0,
            distanceKm: trip.distancia_km,
            durationMinutes: trip.duracion_minutos,
            startLabel: trip.school_name,
            endLabel: trip.lugar_nombre,
            path: polyline.decode(trip.ruta_polyline).map(([lat, lng]) => ({ lat, lng })),
          },
        ];
    const points = [{ lat: trip.school_lat, lng: trip.school_lng }, ...segments.flatMap((segment) => segment.path), { lat: trip.lugar_lat, lng: trip.lugar_lng }];

    if (points.length < 2) {
      return null;
    }

    const width = 1200;
    const height = 680;
    const padding = 60;
    const lngValues = points.map((point) => point.lng);
    const latValues = points.map((point) => point.lat);
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);
    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const lngSpan = Math.max(maxLng - minLng, 0.0001);
    const latSpan = Math.max(maxLat - minLat, 0.0001);
    const scale = Math.min((width - padding * 2) / lngSpan, (height - padding * 2) / latSpan);
    const contentWidth = lngSpan * scale;
    const contentHeight = latSpan * scale;
    const offsetX = (width - contentWidth) / 2;
    const offsetY = (height - contentHeight) / 2;

    const projectPoint = (lat: number, lng: number) => {
      const x = offsetX + (lng - minLng) * scale;
      const y = height - (offsetY + (lat - minLat) * scale);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    const [originX, originY] = projectPoint(trip.school_lat, trip.school_lng).split(",");
    const [destinationX, destinationY] = projectPoint(trip.lugar_lat, trip.lugar_lng).split(",");
    const segmentPolylines = segments
      .map((segment) => {
        const polylinePoints = segment.path.map((point) => projectPoint(point.lat, point.lng)).join(" ");
        const color = resolveSegmentColor(segment.kind, segment.order);
        return `<polyline fill="none" stroke="${color}" stroke-width="${segment.kind === "return" ? 8 : 10}" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />`;
      })
      .join("");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F8FBFF" />
            <stop offset="100%" stop-color="#EAF1F8" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" rx="28" fill="url(#bg)" />
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="#FFFFFF" stroke="#D8E2EE" stroke-width="2" />
        ${segmentPolylines}
        <circle cx="${originX}" cy="${originY}" r="15" fill="#1B4F8A" />
        <circle cx="${destinationX}" cy="${destinationY}" r="15" fill="#B42318" />
        <text x="${originX}" y="${Number(originY) + 4}" text-anchor="middle" font-size="14" font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="#FFFFFF">E</text>
        <text x="${destinationX}" y="${Number(destinationY) + 4}" text-anchor="middle" font-size="14" font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="#FFFFFF">D</text>
        <text x="60" y="70" font-size="28" font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="#0F172A">Ruta operativa</text>
        <text x="60" y="110" font-size="18" font-family="Helvetica, Arial, sans-serif" fill="#475569">${trip.school_name} a ${trip.lugar_nombre}</text>
      </svg>
    `;

    return encodeSvgDataUrl(svg);
  } catch {
    return null;
  }
}

async function buildStaticMapDataUrl(trip: AdminTripRecord) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY?.trim();
  const svgFallback = buildStaticRouteSvgDataUrl(trip);

  if (!apiKey) {
    return svgFallback;
  }

  const staticMapUrl = buildTripStaticMapUrl(trip, apiKey);

  if (!staticMapUrl) {
    return svgFallback;
  }

  const response = await fetch(staticMapUrl, {
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return svgFallback;
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
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
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