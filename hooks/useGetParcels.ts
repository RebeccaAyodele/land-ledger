"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { LandParcel } from "./useRegisterParcel";

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
                const bytes = ccc.bytesFrom(dataHex);
                const json = new TextDecoder().decode(bytes);
                const parsed = JSON.parse(json);

                if (
                    typeof parsed.parcelId === "string" &&
                    typeof parsed.location === "string" &&
                    typeof parsed.deedHash === "string" &&
                    typeof parsed.owner === "string"
                ) {
                    results.push({
                        parcel: parsed as LandParcel,
                        outPoint: {
                            txHash: cell.outPoint.txHash,
                            index: cell.outPoint.index.toString(),
                        },
                        capacity: ccc.fixedPointToString(cell.cellOutput.capacity),
                    });
                }
            } catch {
                continue;
            }
        }

        return results;
    };

    return { getParcels };
}