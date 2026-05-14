import Link from "next/link";

import PortalLogo from "./PortalLogo";

export default function PlatformFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="portal-footer-minimal">
      <div className="portal-footer-minimal__inner">
        <div className="portal-footer-minimal__brand">
          <PortalLogo
            size="sm"
            textClassName="text-white"
            subtitleClassName="text-slate-200"
          />
        </div>
        <div className="portal-footer-minimal__copy">© {currentYear} SLEP Colchagua</div>
        <nav className="portal-footer-minimal__links" aria-label="Enlaces institucionales">
          <Link href="/login">Accesibilidad</Link>
          <Link href="/login">Privacidad</Link>
        </nav>
      </div>
    </footer>
  );
}