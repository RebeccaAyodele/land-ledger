"use client";

import { ccc } from "@ckb-ccc/connector-react";

export function useDeployTypeScript() {
  const signer = ccc.useSigner();

  const deployTypeScript = async (binaryHex: string) => {
    if (!signer) {
      throw new Error("No signer connected");
    }

    const tx = ccc.Transaction.from({
      outputs: [
        {
          lock: (await signer.getRecommendedAddressObj()).script,
        },
      ],
      outputsData: [binaryHex],
    });

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer);

    const txHash = await signer.sendTransaction(tx);

    const codeHash = ccc.hashCkb(binaryHex);

    return { txHash, codeHash, index: "0x0" };
  };

  return { deployTypeScript };
}