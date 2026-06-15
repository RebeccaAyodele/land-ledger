"use client";

import { useState } from "react";
import { useRegisterParcel, LandParcel } from "@/hooks/useRegisterParcel";
import { ccc } from "@ckb-ccc/connector-react";

export default function RegisterParcel() {
  const { registerParcel } = useRegisterParcel();
  const signer = ccc.useSigner();

  const [parcelId, setParcelId] = useState("");
  const [location, setLocation] = useState("");
  const [deedHash, setDeedHash] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!signer) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!parcelId || !location || !deedHash) {
      setStatus("Fill in all fields.");
      return;
    }

    if (!parcelId || !location || !deedHash || !latitude || !longitude) {
      setStatus("Fill in all fields.");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setStatus("Latitude and longitude must be valid numbers.");
      return;
    }

    setLoading(true);
    setStatus("Submitting transaction...");

    try {
      const owner = await signer.getRecommendedAddress();

      const parcel: LandParcel = {
        parcelId,
        location,
        latitude: lat,
        longitude: lng,
        deedHash,
        owner,
      };

      const txHash = await registerParcel(parcel);
      setStatus(`Success! Tx: ${txHash}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <h2 className="text-xl font-semibold">Register Land Parcel</h2>
      <input
        className="border border-white/20 bg-white/10 p-2 rounded text-white placeholder:text-white/40"
        placeholder="Parcel ID"
        value={parcelId}
        onChange={(e) => setParcelId(e.target.value)}
      />
      <input
        className="border border-white/20 bg-white/10 p-2 rounded text-white placeholder:text-white/40"
        placeholder="Location description"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        className="border border-white/20 bg-white/10 p-2 rounded text-white placeholder:text-white/40"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
      />
      <input
        className="border border-white/20 bg-white/10 p-2 rounded text-white placeholder:text-white/40"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
      />
      <input
        className="border border-white/20 bg-white/10 p-2 rounded text-white placeholder:text-white/40"
        placeholder="Deed hash"
        value={deedHash}
        onChange={(e) => setDeedHash(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-foreground text-background rounded p-2 font-bold disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Register Parcel"}
      </button>
      {status && <p className="text-sm break-all">{status}</p>}
    </div>
  );
}