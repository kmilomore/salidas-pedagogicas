import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <PortalSectionLoader
      variant="admin"
      sectionLabel="Analitica"
      title="Analitica y metricas"
      description="Estamos consolidando los indicadores de viajes, pasajeros, comunas y distribucion por establecimiento."
      statusText="Cargando graficos administrativos y resumenes transversales del historial visible."
    />
  );
}