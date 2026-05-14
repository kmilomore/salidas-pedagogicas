import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <PortalSectionLoader
      variant="admin"
      sectionLabel="Administracion"
      title="Panel administrativo"
      description="Estamos consolidando la vista transversal, filtros y exportaciones sobre las salidas visibles en el portal."
      statusText="Cargando salidas recientes, indicadores de cobertura y controles de listado administrativo."
    />
  );
}
