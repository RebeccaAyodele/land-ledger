"use client";

import { useState, useEffect } from "react";
import { useGetParcels, OwnedParcel } from "@/hooks/useGetParcels";
import { ccc } from "@ckb-ccc/connector-react";

export default function ParcelList() {
  const { getParcels } = useGetParcels();
  const signer = ccc.useSigner();

  const [parcels, setParcels] = useState<OwnedParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchParcels = async () => {
    if (!signer) {
      setError("Connect your wallet first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getParcels();
      setParcels(result);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signer) {
      fetchParcels();
    }
  }, [signer]);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Parcels</h2>
        <button
          onClick={fetchParcels}
          disabled={loading}
          className="text-sm border rounded px-3 py-1 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {parcels.length === 0 && !loading && !error && (
        <p className="text-sm opacity-70">No parcels registered yet.</p>
      )}

      {parcels.map((p, i) => (
        <div key={i} className="border rounded p-3 flex flex-col gap-1">
          <p className="font-bold">{p.parcel.parcelId}</p>
          <p className="text-sm">{p.parcel.location}</p>
          <p className="text-xs opacity-70 break-all">
            Deed: {p.parcel.deedHash}
          </p>
          <p className="text-xs opacity-70">Capacity: {p.capacity} CKB</p>
        </div>
      ))}
    </div>
  );
}