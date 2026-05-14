import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <PortalSectionLoader
      variant="whitelist"
      sectionLabel="Administracion"
      title="Gestion de acceso"
      description="Estamos preparando la whitelist institucional, sus filtros y el estado de los usuarios autorizados para ingresar al portal."
      statusText="Cargando usuarios habilitados, roles y controles de acceso por establecimiento."
    />
  );
}
