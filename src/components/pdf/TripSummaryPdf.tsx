/* eslint-disable jsx-a11y/alt-text */

import { Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatRut } from "@/lib/validations/salida";
import type { AdminTripRecord } from "@/types";

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
  directionsUrl: string;
  portalLogoDataUrl: string | null;
  qrCodeDataUrl: string | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 22,
    backgroundColor: "#F6F7FB",
    color: "#0F172A",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  hero: {
    backgroundColor: "#0F4C81",
    borderRadius: 14,
    padding: 14,
    color: "#FFFFFF",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroHeaderText: {
    flex: 1,
  },
  heroLogo: {
    width: 56,
    height: 56,
  },
  heroKicker: {
    fontSize: 8,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 9,
    lineHeight: 1.5,
    opacity: 0.95,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
  },
  metricLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#64748B",
  },
  metricValue: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  sectionGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  section: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#0F4C81",
    fontFamily: "Helvetica-Bold",
  },
  fieldBlock: {
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#64748B",
  },
  fieldValue: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 1.45,
    color: "#0F172A",
  },
  participants: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  metricCardHighlight: {
    flex: 1,
    backgroundColor: "#EBF4FF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  metricLabelHighlight: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#1D4ED8",
  },
  metricValueHighlight: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A",
  },
  staffHeader: {
    flexDirection: "row",
    backgroundColor: "#E8EEF5",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  staffRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 8,
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
  routePageTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  routePageSubtitle: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 1.5,
    color: "#475569",
  },
  routeLegGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  routeLegCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  routeLegTitle: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.0,
    color: "#0F4C81",
    fontFamily: "Helvetica-Bold",
  },
  routeLegText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.5,
    color: "#0F172A",
  },
  routeLegMeta: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 1.5,
    color: "#475569",
  },
  routeSupportGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  qrPanel: {
    width: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  qrImage: {
    width: 110,
    height: 110,
  },
  qrLabel: {
    marginTop: 8,
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#64748B",
  },
  qrHelp: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 1.45,
    color: "#334155",
    textAlign: "center",
  },
  linkCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  linkText: {
    marginTop: 8,
    fontSize: 9,
    lineHeight: 1.55,
    color: "#0F4C81",
    textDecoration: "underline",
  },
  footer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    fontSize: 7.5,
    color: "#475569",
    textAlign: "center",
  },
});

export default function TripSummaryPdf({ trip, directionsUrl, portalLogoDataUrl, qrCodeDataUrl }: TripSummaryPdfProps) {
  const outboundRoute = `${trip.school_name} -> ${trip.lugar_nombre}`;
  const returnRoute = `${trip.lugar_nombre} -> ${trip.school_name}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            {portalLogoDataUrl ? <Image style={styles.heroLogo} src={portalLogoDataUrl} /> : null}
            <View style={styles.heroHeaderText}>
              <Text style={styles.heroKicker}>SLEP Colchagua</Text>
              <Text style={styles.heroTitle}>Comprobante de salida pedagogica</Text>
              <Text style={styles.heroSubtitle}>{trip.actividad} · {trip.school_name} · RBD {trip.rbd}</Text>
            </View>
          </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requerimientos adicionales / observaciones</Text>
          <Text style={[styles.fieldValue, { marginTop: 10 }]}>
            {trip.requerimientos_adicionales || "Sin observaciones adicionales informadas por el establecimiento."}
          </Text>
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
            <View style={styles.metricCardHighlight}>
              <Text style={styles.metricLabelHighlight}>Total pasajeros</Text>
              <Text style={styles.metricValueHighlight}>
                {String(trip.cantidad_estudiantes + trip.cantidad_apoderados + trip.funcionarios.length)}
              </Text>
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

      <Page size="A4" style={styles.page}>
        <Text style={styles.routePageTitle}>Ruta operacional y acceso en terreno</Text>
        <Text style={styles.routePageSubtitle}>
          Este comprobante incorpora el desglose operativo del trayecto y un QR para abrir la ruta en Google Maps desde un telefono.
        </Text>

        <View style={styles.routeLegGrid}>
          <View style={styles.routeLegCard}>
            <Text style={styles.routeLegTitle}>Ruta de ida</Text>
            <Text style={styles.routeLegText}>{outboundRoute}</Text>
            <Text style={styles.routeLegMeta}>{formatDistance(trip.distancia_ida_km)} · {formatDuration(trip.duracion_ida_minutos)}</Text>
            <Text style={styles.routeLegMeta}>{trip.school_address}</Text>
            <Text style={styles.routeLegMeta}>{trip.lugar_direccion}</Text>
          </View>

          <View style={styles.routeLegCard}>
            <Text style={styles.routeLegTitle}>Ruta de vuelta</Text>
            <Text style={styles.routeLegText}>{returnRoute}</Text>
            <Text style={styles.routeLegMeta}>{formatDistance(trip.distancia_vuelta_km)} · {formatDuration(trip.duracion_vuelta_minutos)}</Text>
            <Text style={styles.routeLegMeta}>{trip.lugar_direccion}</Text>
            <Text style={styles.routeLegMeta}>{trip.school_address}</Text>
          </View>
        </View>

        <View style={styles.routeSupportGrid}>
          <View style={styles.qrPanel}>
            {qrCodeDataUrl ? <Image style={styles.qrImage} src={qrCodeDataUrl} /> : null}
            <Text style={styles.qrLabel}>QR Google Maps</Text>
            <Text style={styles.qrHelp}>Escanea este codigo para abrir la ruta directamente en Google Maps.</Text>
          </View>

          <View style={styles.linkCard}>
            <Text style={styles.sectionTitle}>Apertura directa en Maps</Text>
            <Text style={styles.fieldValue}>Resumen vial registrado: {trip.ruta_resumen}</Text>
            <Link src={directionsUrl} style={styles.linkText}>
              Abrir ruta en Google Maps
            </Link>
            <Text style={styles.fieldValue}>Origen institucional: {trip.school_name}</Text>
            <Text style={styles.fieldValue}>Destino operativo: {trip.lugar_nombre}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Comprobante PDF con QR de navegacion y detalle operacional del trayecto · Registro {trip.id}</Text>
      </Page>
    </Document>
  );
}