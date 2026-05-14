import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <main className="portal-loader-shell" aria-busy="true" aria-live="polite">
      <PortalSectionLoader variant="portal" />
    </main>
  );
}
