import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <PortalSectionLoader
      variant="audit"
      sectionLabel="Auditoria"
      title="Auditoria y controles"
      description="Estamos reuniendo los controles operativos, accesos recientes y eventos administrativos persistidos del portal."
      statusText="Cargando bitacora reciente, variables sensibles y resumen de control institucional."
    />
  );
}
