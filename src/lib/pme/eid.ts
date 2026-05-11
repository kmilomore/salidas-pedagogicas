export interface PmeSubdimensionOption {
  value: string;
  label: string;
}

export interface PmeDimensionOption {
  value: string;
  label: string;
  sourceDimension: string;
  subdimensions: PmeSubdimensionOption[];
}

export const PME_DIMENSIONS: PmeDimensionOption[] = [
  {
    value: "GESTION_DEL_LIDERAZGO",
    label: "Gestion del liderazgo",
    sourceDimension: "Liderazgo",
    subdimensions: [
      { value: "LIDERAZGO_DEL_SOSTENEDOR", label: "Liderazgo del sostenedor" },
      { value: "LIDERAZGO_DEL_DIRECTOR", label: "Liderazgo del director" },
      { value: "PLANIFICACION_Y_GESTION_DE_RESULTADOS", label: "Planificacion y gestion de resultados" },
    ],
  },
  {
    value: "GESTION_PEDAGOGICA",
    label: "Gestion pedagogica",
    sourceDimension: "Gestión pedagógica",
    subdimensions: [
      { value: "GESTION_CURRICULAR", label: "Gestion curricular" },
      { value: "ENSENANZA_Y_APRENDIZAJE_EN_EL_AULA", label: "Ensenanza y aprendizaje en el aula" },
      { value: "APOYO_AL_DESARROLLO_DE_LOS_ESTUDIANTES", label: "Apoyo al desarrollo de los estudiantes" },
    ],
  },
  {
    value: "GESTION_DE_LA_CONVIVENCIA",
    label: "Gestion de la convivencia",
    sourceDimension: "Formación y convivencia",
    subdimensions: [
      { value: "FORMACION", label: "Formacion" },
      { value: "CONVIVENCIA", label: "Convivencia" },
      { value: "PARTICIPACION_Y_VIDA_DEMOCRATICA", label: "Participacion y vida democratica" },
    ],
  },
  {
    value: "GESTION_DE_RECURSOS",
    label: "Gestion de recursos",
    sourceDimension: "Gestión de recursos",
    subdimensions: [
      { value: "GESTION_DE_PERSONAL", label: "Gestion de personal" },
      { value: "GESTION_DE_RECURSOS_FINANCIEROS", label: "Gestion de recursos financieros" },
      { value: "GESTION_DE_RECURSOS_EDUCATIVOS", label: "Gestion de recursos educativos" },
    ],
  },
];

export function getPmeDimensionByValue(value: string) {
  return PME_DIMENSIONS.find((dimension) => dimension.value === value) ?? null;
}