import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import PortalLogo from "@/components/branding/PortalLogo";

const adminLinks = [
  { href: "/panel", label: "Panel" },
  { href: "/nueva-salida", label: "Ver formulario" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-3 py-3 sm:px-5 sm:py-5 xl:px-6 xl:py-6 2xl:px-8">
      <div className="surface-card mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1680px] flex-col rounded-[32px] border border-white/70">
        <header className="flex flex-col gap-6 border-b border-slate-200/80 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Portal administrador</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <PortalLogo size="sm" />
              <span className="portal-role-badge portal-role-badge--admin">Administrador</span>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="portal-nav-link"
              >
                {link.label}
              </Link>
            ))}
            <SignOutButton />
          </nav>
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">{children}</div>
      </div>
    </div>
  );
}