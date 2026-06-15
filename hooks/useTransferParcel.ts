"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { LandParcel } from "./useRegisterParcel";

export function useTransferParcel() {
    const signer = ccc.useSigner();

    const transferParcel = async (
        outPoint: { txHash: string; index: string },
        parcel: LandParcel,
        newOwnerAddress: string
    ) => {
        if (!signer) {
            throw new Error("No signer connected");
        }

        // Resolve the new owner's lock script from their address
        const newOwnerAddressObj = await ccc.Address.fromString(
            newOwnerAddress,
            signer.client
        );
        const newLock = newOwnerAddressObj.script;

        const updatedParcel: LandParcel = {
            ...parcel,
            owner: newOwnerAddress,
        };

        const json = JSON.stringify(updatedParcel);
        const dataHex = ccc.hexFrom(ccc.bytesFrom(json, "utf8"));

        const tx = ccc.Transaction.from({
            inputs: [
                {
                    previousOutput: {
                        txHash: outPoint.txHash,
                        index: outPoint.index,
                    },
                },
            ],
            outputs: [
                {
                    lock: newLock,
                },
            ],
            outputsData: [dataHex],
        });

        await tx.completeInputsByCapacity(signer);
        await tx.completeFeeBy(signer);

        const txHash = await signer.sendTransaction(tx);

        return txHash;
    };

    return { transferParcel };
}