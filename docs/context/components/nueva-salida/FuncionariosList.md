# Componente: FuncionariosList

## Archivo
- `src/components/nueva-salida/FuncionariosList.tsx`

## Rol
Gestionar el arreglo dinámico de funcionarios responsables.

## Responsabilidades
- Agregar o quitar filas.
- Normalizar nombre y cargo.
- Formatear el RUT en blur.
- Reflejar errores por fila desde `react-hook-form`.

## Dependencias
- `useFieldArray` desde el contenedor principal.
- `formatRut` e `isValidRut`.