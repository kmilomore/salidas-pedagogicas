"use client";

import { useJsApiLoader, type Libraries } from "@react-google-maps/api";

const portalGoogleMapsLibraries: Libraries = ["places"];

export function usePortalGoogleMapsLoader() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey,
    libraries: portalGoogleMapsLibraries,
  });
}

export function getPortalGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}