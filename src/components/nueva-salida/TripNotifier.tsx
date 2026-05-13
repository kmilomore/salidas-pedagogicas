"use client";

import { useEffect } from "react";

export default function TripNotifier({ id }: { id: string }) {
  useEffect(() => {
    fetch(`/api/trips/${id}/notify`, { method: "POST" }).catch(() => {});
  }, [id]);

  return null;
}
