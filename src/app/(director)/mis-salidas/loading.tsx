import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <PortalSectionLoader
      variant="history"
      sectionLabel="Historial"
      title="Mis salidas"
      description="Estamos consolidando el historial operativo del establecimiento y el acceso a sus comprobantes institucionales."
      statusText="Cargando salidas registradas, metricas visibles y estado administrativo del historial."
    />
  );
}
