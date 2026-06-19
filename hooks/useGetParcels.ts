"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { LandParcel } from "./useRegisterParcel";
import { decodeParcel } from "@/lib/parcelCodec";

export interface OwnedParcel {
    parcel: LandParcel;
    outPoint: {
        txHash: string;
        index: string;
    };
    capacity: string;
}

export function useGetParcels() {
    const signer = ccc.useSigner();

    const getParcels = async (): Promise<OwnedParcel[]> => {
        if (!signer) {
            throw new Error("No signer connected");
        }

        const results: OwnedParcel[] = [];

        for await (const cell of signer.findCells(
            {},
            true
        )) {
            const dataHex = cell.outputData;

            if (!dataHex || dataHex === "0x") {
                continue;
            }

            try {
                const parsed = decodeParcel(dataHex);
                results.push({
                    parcel: parsed,
                    outPoint: {
                        txHash: cell.outPoint.txHash,
                        index: cell.outPoint.index.toString(),
                    },
                    capacity: ccc.fixedPointToString(cell.cellOutput.capacity),
                });
            } catch {
                continue;
            }
        }

        return results;
    };

    return { getParcels };
}