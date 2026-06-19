"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { LandParcel } from "./useRegisterParcel";
import { encodeParcel } from "@/lib/parcelCodec";
import { PARCEL_TYPE_SCRIPT, PARCEL_TYPE_SCRIPT_OUT_POINT } from "@/lib/typeScriptConfig";

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

        const dataHex = encodeParcel(updatedParcel);

        const tx = ccc.Transaction.from({
            cellDeps: [
                {
                    outPoint: PARCEL_TYPE_SCRIPT_OUT_POINT,
                    depType: "code",
                },
            ],
            outputs: [
                {
                    lock: newLock,
                    type: PARCEL_TYPE_SCRIPT,
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