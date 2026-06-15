"use client";

import { useState, useEffect } from "react";
import { useGetParcels, OwnedParcel } from "@/hooks/useGetParcels";
import { useTransferParcel } from "@/hooks/useTransferParcel";
import { ccc } from "@ckb-ccc/connector-react";

export default function ParcelList() {
  const { getParcels } = useGetParcels();
  const { transferParcel } = useTransferParcel();
  const signer = ccc.useSigner();

  const [parcels, setParcels] = useState<OwnedParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transferTarget, setTransferTarget] = useState<number | null>(null);
  const [transferAddress, setTransferAddress] = useState("");
  const [transferStatus, setTransferStatus] = useState("");
  const [transferring, setTransferring] = useState(false);

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

  const handleTransfer = async (p: OwnedParcel) => {
    if (!transferAddress) {
      setTransferStatus("Enter a recipient address.");
      return;
    }

    setTransferring(true);
    setTransferStatus("Submitting transfer...");

    try {
      const txHash = await transferParcel(p.outPoint, p.parcel, transferAddress);
      setTransferStatus(`Success! Tx: ${txHash}`);
      setTransferTarget(null);
      setTransferAddress("");
      await fetchParcels();
    } catch (err: any) {
      setTransferStatus(`Error: ${err.message || String(err)}`);
    } finally {
      setTransferring(false);
    }
  };

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
        <div key={i} className="border rounded p-3 flex flex-col gap-2">
          <p className="font-bold">{p.parcel.parcelId}</p>
          <p className="text-sm">{p.parcel.location}</p>
          <p className="text-xs opacity-70 break-all">
            Deed: {p.parcel.deedHash}
          </p>
          <p className="text-xs opacity-70">Capacity: {p.capacity} CKB</p>

          {transferTarget === i ? (
            <div className="flex flex-col gap-2 mt-1">
              <input
                className="border p-2 rounded text-black text-sm"
                placeholder="Recipient address"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleTransfer(p)}
                  disabled={transferring}
                  className="bg-foreground text-background rounded px-3 py-1 text-sm font-bold disabled:opacity-50"
                >
                  {transferring ? "Sending..." : "Confirm Transfer"}
                </button>
                <button
                  onClick={() => {
                    setTransferTarget(null);
                    setTransferAddress("");
                    setTransferStatus("");
                  }}
                  className="border rounded px-3 py-1 text-sm"
                >
                  Cancel
                </button>
              </div>
              {transferStatus && (
                <p className="text-xs break-all">{transferStatus}</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setTransferTarget(i)}
              className="border rounded px-3 py-1 text-sm w-fit"
            >
              Transfer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}