import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka
const DEFAULT_ZOOM = 13;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 'var(--radius)',
};

const MAP_ERROR_CHECK_DELAY_MS = 2500;

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (value: { lat: number; lng: number }) => void;
  className?: string;
  readOnly?: boolean;
}

export function MapPicker({ value, onChange, className, readOnly = false }: MapPickerProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoadError, setScriptLoadError] = useState(false);
  const [mapInitError, setMapInitError] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    id: 'google-map-script',
  });

  useEffect(() => {
    if (loadError) {
      setScriptLoadError(true);
    }
  }, [loadError]);

  // Detect when Google injects its "Something went wrong" error (e.g. invalid key, billing, API not enabled)
  useEffect(() => {
    if (!isLoaded) return;
    setMapInitError(false);
    const timer = window.setTimeout(() => {
      const errEl = containerRef.current?.querySelector('.gm-err-content');
      if (errEl) {
        setMapInitError(true);
      }
    }, MAP_ERROR_CHECK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isLoaded, value]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback(
    (e: { latLng?: google.maps.LatLng | null }) => {
      if (readOnly || !e.latLng) return;
      onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    },
    [onChange, readOnly]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    map.panTo({ lat: value.lat, lng: value.lng });
  }, [value]);

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    ...(readOnly && {
      gestureHandling: 'none',
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
    }),
  };

  if (!apiKey) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-muted/30 text-muted-foreground text-sm ${className ?? ''}`}>
        Configure VITE_GOOGLE_MAPS_API_KEY to show the map.
      </div>
    );
  }

  if (scriptLoadError || loadError) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-muted/30 text-muted-foreground text-sm ${className ?? ''}`}>
        Failed to load map.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-muted/30 text-muted-foreground text-sm ${className ?? ''}`}>
        Loading map…
      </div>
    );
  }

  if (mapInitError) {
    return (
      <div
        className={`h-full w-full flex flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground text-sm p-4 text-center ${className ?? ''}`}
        role="alert"
      >
        <p className="font-medium">Map couldn’t be loaded</p>
        <p className="text-xs max-w-sm">
          In Google Cloud Console: enable <strong>Maps JavaScript API</strong> for this project, turn on <strong>billing</strong>, and ensure your API key allows this origin (e.g. <code className="bg-muted px-1 rounded">http://localhost:5173</code> for dev).
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-full w-full ${className ?? ''}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={value ?? DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onMapLoad}
        onClick={onMapClick}
        options={mapOptions}
      >
        {value && <Marker position={value} />}
      </GoogleMap>
    </div>
  );
}
