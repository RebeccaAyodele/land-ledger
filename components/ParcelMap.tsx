"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { OwnedParcel } from "@/hooks/useGetParcels";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
export default function ParcelMap({ parcels }: { parcels: OwnedParcel[] }) {
    const validParcels = parcels.filter(
        (p) =>
            typeof p.parcel.latitude === "number" &&
            typeof p.parcel.longitude === "number" &&
            !isNaN(p.parcel.latitude) &&
            !isNaN(p.parcel.longitude)
    );

    if (validParcels.length === 0) {
        return (
            <p className="text-sm opacity-70">
                No parcels with coordinates to display.
            </p>
        );
    }

    const center: [number, number] = [
        validParcels[0].parcel.latitude,
        validParcels[0].parcel.longitude,
    ];

    return (
        <div className="w-full max-w-md h-80 rounded overflow-hidden">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validParcels.map((p, i) => (
                    <Marker
                        key={i}
                        position={[p.parcel.latitude, p.parcel.longitude]}
                    >
                        <Popup>
                            <strong>{p.parcel.parcelId}</strong>
                            <br />
                            {p.parcel.location}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}