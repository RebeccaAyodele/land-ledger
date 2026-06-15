"use client";

import { ccc } from "@ckb-ccc/connector-react";

export interface LandParcel {
  parcelId: string;
  location: string;
  deedHash: string;
  owner: string;
}

export function useRegisterParcel() {
  const signer = ccc.useSigner();

  const registerParcel = async (parcel: LandParcel) => {
    if (!signer) {
      throw new Error("No signer connected");
    }

    const json = JSON.stringify(parcel);
    const dataHex = ccc.hexFrom(ccc.bytesFrom(json, "utf8"));

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