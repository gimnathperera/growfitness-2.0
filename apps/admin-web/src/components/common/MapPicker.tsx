import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (value: { lat: number; lng: number }) => void;
  className?: string;
  readOnly?: boolean;
}

function LocationMarker({
  value,
  onChange,
  readOnly,
}: {
  value?: { lat: number; lng: number };
  onChange: (latlng: LatLng) => void;
  readOnly?: boolean;
}) {
  const map = useMapEvents({
    click(e) {
      if (!readOnly) {
        onChange(e.latlng);
      }
    },
  });

  useEffect(() => {
    if (value) {
      map.flyTo([value.lat, value.lng], map.getZoom());
    }
  }, [value, map]);

  return value ? <Marker position={[value.lat, value.lng]} interactive={!readOnly} /> : null;
}

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka
const DEFAULT_ZOOM = 13;

export function MapPicker({ value, onChange, className, readOnly = false }: MapPickerProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <MapContainer
        center={value || DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        dragging={!readOnly}
        touchZoom={!readOnly}
        doubleClickZoom={!readOnly}
        scrollWheelZoom={!readOnly}
        boxZoom={!readOnly}
        keyboard={!readOnly}
        zoomControl={!readOnly}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          value={value}
          onChange={latlng => onChange({ lat: latlng.lat, lng: latlng.lng })}
          readOnly={readOnly}
        />
      </MapContainer>
    </div>
  );
}
