import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import PlatformFooter from "@/components/branding/PlatformFooter";
import PortalLogo from "@/components/branding/PortalLogo";

const adminLinks = [
  { href: "/panel", label: "Panel" },
  { href: "/panel/auditoria", label: "Auditoria y controles" },
  { href: "/panel/whitelist", label: "Gestión de acceso" },
  { href: "/nueva-salida", label: "Ver formulario" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-app-shell">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <div className="portal-app-frame">
        <header className="portal-app-header">
          <div className="portal-app-header__lead">
            <p className="portal-kicker">Portal administrador</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <PortalLogo size="sm" />
              <span className="portal-role-badge portal-role-badge--admin">Administrador</span>
            </div>
          </div>
          <nav className="portal-app-nav" aria-label="Navegacion administrador">
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
        <main id="main-content" className="portal-app-main">{children}</main>
      </div>
      <PlatformFooter />
    </div>
  );
}