"use client";

import { useId, useMemo, useRef, useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

interface SelectedPlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  comuna: string;
  region: string;
}

interface LugarAutocompleteProps {
  value: string;
  selectedPlace: SelectedPlace | null;
  onChange: (value: string) => void;
  onSelect: (place: SelectedPlace) => void;
  onReset: () => void;
  disabled?: boolean;
}

function getAddressComponent(components: google.maps.GeocoderAddressComponent[] | undefined, type: string) {
  return components?.find((component) => component.types.includes(type))?.long_name ?? "";
}

export default function LugarAutocomplete({
  value,
  selectedPlace,
  onChange,
  onSelect,
  onReset,
  disabled = false,
}: LugarAutocompleteProps) {
  const serviceHostId = useId();
  const serviceHostRef = useRef<HTMLDivElement | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const requestOptions = useMemo(
    () => ({
      componentRestrictions: { country: "cl" },
      location:
        typeof window !== "undefined" && window.google?.maps
          ? new window.google.maps.LatLng(-34.5, -71.0)
          : undefined,
      radius: 150000,
    }),
    [],
  );

  const { ready, suggestions, setValue, clearSuggestions } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions,
    cache: 300,
  });

  const handleInputChange = (nextValue: string) => {
    setSelectionError(null);
    setValue(nextValue);
    onChange(nextValue);
  };

  const handleSelectSuggestion = async (placeId: string, description: string) => {
    if (!window.google?.maps?.places || !serviceHostRef.current) {
      setSelectionError("Google Places aun no esta disponible en el navegador.");
      return;
    }

    const service = new window.google.maps.places.PlacesService(serviceHostRef.current);

    await new Promise<void>((resolve) => {
      service.getDetails(
        {
          placeId,
          fields: ["name", "formatted_address", "geometry.location", "address_components", "place_id"],
        },
        (result, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !result?.geometry?.location) {
            setSelectionError("No fue posible confirmar el lugar desde Google Places.");
            resolve();
            return;
          }

          const comuna =
            getAddressComponent(result.address_components, "locality") ||
            getAddressComponent(result.address_components, "administrative_area_level_3");
          const region = getAddressComponent(result.address_components, "administrative_area_level_1");

          if (!comuna || !region || !result.place_id) {
            setSelectionError("El lugar debe incluir comuna y region para continuar.");
            resolve();
            return;
          }

          const confirmedPlace = {
            placeId: result.place_id,
            name: result.name || description,
            address: result.formatted_address || description,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            comuna,
            region,
          };

          setValue(confirmedPlace.name, false);
          onChange(confirmedPlace.name);
          clearSuggestions();
          setSelectionError(null);
          onSelect(confirmedPlace);
          resolve();
        },
      );
    });
  };

  return (
    <div>
      <div ref={serviceHostRef} id={serviceHostId} className="hidden" />

      {selectedPlace ? (
        <div className="portal-card-subtle border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Destino confirmado</p>
              <h4 className="mt-2 text-lg font-semibold text-emerald-950">{selectedPlace.name}</h4>
              <p className="mt-2 text-sm leading-6 text-emerald-900/80">{selectedPlace.address}</p>
              <p className="mt-1 text-sm text-emerald-900/80">
                {selectedPlace.comuna}, {selectedPlace.region}
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="portal-button portal-button--secondary portal-button--sm border-emerald-300 text-emerald-900 hover:border-emerald-500"
            >
              Cambiar lugar
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(event) => handleInputChange(event.target.value)}
            disabled={disabled || !ready}
            placeholder="Buscar museo, parque, universidad o centro cultural"
            className="portal-input mt-0"
          />

          {suggestions.status === "OK" && suggestions.data.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-[12px] border border-[var(--border-1)] bg-white p-2 shadow-[var(--shadow-lg)]">
              {suggestions.data.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => void handleSelectSuggestion(suggestion.place_id, suggestion.description)}
                  className="flex w-full flex-col rounded-[8px] px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">{suggestion.structured_formatting.main_text}</span>
                  <span className="mt-1 text-sm text-slate-600">{suggestion.description}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {selectionError ? <p className="portal-field-error mt-3">{selectionError}</p> : null}
    </div>
  );
}

export type { SelectedPlace };