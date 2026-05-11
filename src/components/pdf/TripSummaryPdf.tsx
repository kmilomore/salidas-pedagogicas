import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatRut } from "@/lib/validations/salida";
import type { AdminTripRecord } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    backgroundColor: "#F6F7FB",
    color: "#0F172A",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  hero: {
    backgroundColor: "#0F4C81",
    borderRadius: 14,
    padding: 20,
    color: "#FFFFFF",
  },
  heroKicker: {
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.5,
    opacity: 0.95,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748B",
  },
  metricValue: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  sectionGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  section: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#0F4C81",
    fontFamily: "Helvetica-Bold",
  },
  fieldBlock: {
    marginTop: 10,
  },
  fieldLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#64748B",
  },
  fieldValue: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 1.45,
    color: "#0F172A",
  },
  participants: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  staffHeader: {
    flexDirection: "row",
    backgroundColor: "#E8EEF5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  staffRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cellName: {
    flex: 1.4,
  },
  cellRut: {
    flex: 0.9,
  },
  cellRole: {
    flex: 1,
  },
  footer: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    fontSize: 8.5,
    color: "#475569",
    textAlign: "center",
  },
});

function formatDistance(value: number) {
  return `${Number(value ?? 0).toFixed(1)} km`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  if (!remainingMinutes) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

interface TripSummaryPdfProps {
  trip: AdminTripRecord;
}

export default function TripSummaryPdf({ trip }: TripSummaryPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>SLEP Colchagua</Text>
          <Text style={styles.heroTitle}>Comprobante de salida pedagogica</Text>
          <Text style={styles.heroSubtitle}>{trip.actividad} · {trip.school_name} · RBD {trip.rbd}</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Fecha</Text>
              <Text style={styles.metricValue}>{trip.fecha}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Distancia</Text>
              <Text style={styles.metricValue}>{formatDistance(trip.distancia_km)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Duracion</Text>
              <Text style={styles.metricValue}>{formatDuration(trip.duracion_minutos)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionGrid}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Establecimiento</Text>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <Text style={styles.fieldValue}>{trip.school_name}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Comuna</Text>
              <Text style={styles.fieldValue}>{trip.school_comuna}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Direccion</Text>
              <Text style={styles.fieldValue}>{trip.school_address}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Director asociado</Text>
              <Text style={styles.fieldValue}>{trip.director_email ?? "No informado"}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destino y PME</Text>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Destino</Text>
              <Text style={styles.fieldValue}>{trip.lugar_nombre}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Direccion de destino</Text>
              <Text style={styles.fieldValue}>{trip.lugar_direccion}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Dimension PME</Text>
              <Text style={styles.fieldValue}>{trip.pme_dimension}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Subdimension PME</Text>
              <Text style={styles.fieldValue}>{trip.pme_subdimension}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionGrid}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objetivo pedagogico</Text>
            <Text style={[styles.fieldValue, { marginTop: 10 }]}>{trip.objetivo}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ruta</Text>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Horario</Text>
              <Text style={styles.fieldValue}>{trip.hora_salida.slice(0, 5)} · {trip.hora_regreso ? trip.hora_regreso.slice(0, 5) : "No informado"}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Comuna y region</Text>
              <Text style={styles.fieldValue}>{trip.lugar_comuna} · {trip.lugar_region}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Resumen vial</Text>
              <Text style={styles.fieldValue}>{trip.ruta_resumen}</Text>
            </View>
          </View>
        </View>

        <View style={styles.participants}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Estudiantes</Text>
              <Text style={styles.metricValue}>{String(trip.cantidad_estudiantes)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Apoderados</Text>
              <Text style={styles.metricValue}>{String(trip.cantidad_apoderados)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Funcionarios</Text>
              <Text style={styles.metricValue}>{String(trip.funcionarios.length)}</Text>
            </View>
          </View>

          <View style={styles.staffHeader}>
            <Text style={styles.cellName}>Funcionario</Text>
            <Text style={styles.cellRut}>RUT</Text>
            <Text style={styles.cellRole}>Cargo</Text>
          </View>
          {trip.funcionarios.map((staff, index) => (
            <View key={`${staff.rut}-${index}`} style={styles.staffRow}>
              <Text style={styles.cellName}>{staff.nombre_completo}</Text>
              <Text style={styles.cellRut}>{formatRut(staff.rut)}</Text>
              <Text style={styles.cellRole}>{staff.cargo}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Documento generado automaticamente por Salidas Pedagogicas · Registro {trip.id}</Text>
      </Page>
    </Document>
  );
}