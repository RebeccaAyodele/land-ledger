"use client";

import { encodeParcel } from "@/lib/parcelCodec";
import { ccc } from "@ckb-ccc/connector-react";

export interface LandParcel {
  parcelId: string;
  location: string;
  latitude: number;
  longitude: number;
  deedHash: string;
  owner: string;
}

export function useRegisterParcel() {
  const signer = ccc.useSigner();

  const registerParcel = async (parcel: LandParcel) => {
    if (!signer) {
      throw new Error("No signer connected");
    }

    const dataHex = encodeParcel(parcel);

    const lock = (await signer.getRecommendedAddressObj()).script;

    const tx = ccc.Transaction.from({
      outputs: [
        {
          lock,
        },
      ],
      outputsData: [dataHex],
    });

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer);

    const txHash = await signer.sendTransaction(tx);

    return txHash;
  };

  return { registerParcel };
}