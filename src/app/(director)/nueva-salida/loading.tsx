import PortalSectionLoader from "@/components/branding/PortalSectionLoader";

export default function Loading() {
  return (
    <PortalSectionLoader
      variant="wizard"
      sectionLabel="Formulario de salida"
      title="Nueva salida"
      description="Estamos preparando el establecimiento, el catalogo PME y la superficie operativa necesaria para iniciar el formulario."
      statusText="Conectando datos del establecimiento, dimensiones PME y bloques del wizard institucional."
    />
  );
}
