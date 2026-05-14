"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login?message=Sesion%20cerrada%20correctamente.");
      router.refresh();
    } catch {
      setIsLoading(false);
      router.replace("/login?message=No%20fue%20posible%20cerrar%20la%20sesion%20correctamente.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={className ?? "portal-nav-link"}
    >
      {isLoading ? "Cerrando sesion..." : "Cerrar sesion"}
    </button>
  );
}