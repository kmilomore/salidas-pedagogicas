-- Fase 7: desglose de transporte referencial administrativo por salida.

alter table public.salidas_pedagogicas
  add column if not exists tipo_transporte_referencial text,
  add column if not exists cantidad_buses_referencial integer,
  add column if not exists valor_unitario_bus_referencial numeric(12, 2);

alter table public.salidas_pedagogicas
  drop constraint if exists salidas_pedagogicas_tipo_transporte_referencial_check,
  add constraint salidas_pedagogicas_tipo_transporte_referencial_check
    check (tipo_transporte_referencial is null or tipo_transporte_referencial in ('taxi_bus', 'bus')),
  drop constraint if exists salidas_pedagogicas_cantidad_buses_referencial_check,
  add constraint salidas_pedagogicas_cantidad_buses_referencial_check
    check (cantidad_buses_referencial is null or cantidad_buses_referencial > 0),
  drop constraint if exists salidas_pedagogicas_valor_unitario_bus_referencial_check,
  add constraint salidas_pedagogicas_valor_unitario_bus_referencial_check
    check (valor_unitario_bus_referencial is null or valor_unitario_bus_referencial >= 0);

comment on column public.salidas_pedagogicas.tipo_transporte_referencial is
  'Tipo de transporte referencial definido por administracion: taxi_bus o bus.';

comment on column public.salidas_pedagogicas.cantidad_buses_referencial is
  'Cantidad de buses o taxi buses considerados en la estimacion administrativa.';

comment on column public.salidas_pedagogicas.valor_unitario_bus_referencial is
  'Valor unitario por bus o taxi bus usado para calcular el monto referencial.';