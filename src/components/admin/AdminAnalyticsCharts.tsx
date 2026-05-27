"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDatum {
  name: string;
  value: number;
}

interface CommuneChartDatum {
  comuna: string;
  viajes: number;
}

interface SchoolChartDatum {
  establecimiento: string;
  viajes: number;
  pasajeros: number;
}

interface MonthlyTripChartDatum {
  month: string;
  viajes: number;
}

interface AdminAnalyticsChartsProps {
  passengerCompositionData: ChartDatum[];
  statusData: ChartDatum[];
  communeChartData: CommuneChartDatum[];
  schoolChartData: SchoolChartDatum[];
  monthlyTripsChartData: MonthlyTripChartDatum[];
  totalPassengers: number;
  totalTrips: number;
}

const passengerColors = ["#005f73", "#ee9b00", "#334155"];
const statusColors = ["#059669", "#f59e0b"];

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    year: "2-digit",
  }).format(new Date(year, month - 1, 1));
}

export default function AdminAnalyticsCharts({
  passengerCompositionData,
  statusData,
  communeChartData,
  schoolChartData,
  monthlyTripsChartData,
  totalPassengers,
  totalTrips,
}: AdminAnalyticsChartsProps) {
  return (
    <>
      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
        <p className="text-sm font-semibold text-slate-950">Composicion de pasajeros</p>
        <p className="mt-1 text-sm text-slate-500">Distribucion interactiva por tipo de pasajero.</p>

        <div className="mt-5 h-[18rem] rounded-[20px] bg-white p-3">
          {passengerCompositionData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passengerCompositionData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2}>
                  {passengerCompositionData.map((entry, index) => (
                    <Cell key={entry.name} fill={passengerColors[index % passengerColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCompactNumber(value)} />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No hay pasajeros visibles con los filtros actuales.</div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {passengerCompositionData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: passengerColors[index % passengerColors.length] }} />
                <span className="text-slate-700">{entry.name}</span>
              </div>
              <span className="font-semibold text-slate-950">{formatCompactNumber(entry.value)} / {totalPassengers ? Math.round((entry.value / totalPassengers) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
        <p className="text-sm font-semibold text-slate-950">Estado de viajes</p>
        <p className="mt-1 text-sm text-slate-500">Distribucion interactiva entre enviadas y borradores.</p>

        <div className="mt-5 h-[18rem] rounded-[20px] bg-white p-3">
          {statusData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={76} paddingAngle={2}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCompactNumber(value)} />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No hay viajes visibles con los filtros actuales.</div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {statusData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColors[index % statusColors.length] }} />
                <span className="text-slate-700">{entry.name}</span>
              </div>
              <span className="font-semibold text-slate-950">{formatCompactNumber(entry.value)} / {totalTrips ? Math.round((entry.value / totalTrips) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">Viajes por escuela</p>
            <p className="mt-1 text-sm text-slate-500">Comparacion interactiva del ranking de establecimientos con mayor carga.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top 10</span>
        </div>

        <div className="mt-5 h-[22rem] rounded-[20px] bg-white p-3">
          {schoolChartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolChartData} margin={{ top: 10, right: 12, left: 0, bottom: 56 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="establecimiento" angle={-25} textAnchor="end" height={70} interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: number) => formatCompactNumber(value)} />
                <Legend />
                <Bar dataKey="viajes" name="Viajes" fill="#005f73" radius={[10, 10, 0, 0]} />
                <Bar dataKey="pasajeros" name="Pasajeros" fill="#94a3b8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No hay establecimientos con viajes para graficar.</div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">Comunas de destino</p>
            <p className="mt-1 text-sm text-slate-500">Distribucion territorial de las salidas registradas.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top 8</span>
        </div>

        <div className="mt-5 h-[22rem] rounded-[20px] bg-white p-3">
          {communeChartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communeChartData} layout="vertical" margin={{ top: 10, right: 12, left: 16, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="comuna" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCompactNumber(value)} />
                <Bar dataKey="viajes" name="Viajes" fill="#ee9b00" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No hay comunas visibles para graficar.</div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">Tendencia mensual de viajes</p>
            <p className="mt-1 text-sm text-slate-500">Lectura temporal de los ultimos meses con actividad visible.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Ultimos 8 meses</span>
        </div>

        <div className="mt-5 h-[20rem] rounded-[20px] bg-white p-3">
          {monthlyTripsChartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTripsChartData} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={(label) => formatMonthLabel(String(label))} formatter={(value: number) => formatCompactNumber(value)} />
                <Bar dataKey="viajes" name="Viajes" fill="#005f73" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No hay suficiente historial para graficar la tendencia mensual.</div>
          )}
        </div>
      </section>
    </>
  );
}