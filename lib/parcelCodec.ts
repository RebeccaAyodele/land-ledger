import { bytes } from "@ckb-lumos/codec";
import { BytesLike } from "@ckb-lumos/codec/lib/base";
import { table, byteVecOf } from "@ckb-lumos/codec/lib/molecule";

const { bytifyRawString, hexify, bytify } = bytes;

const StringCodec = byteVecOf({
  pack: (str: string) => bytifyRawString(str),
  unpack: (buf: BytesLike) => new TextDecoder().decode(bytify(buf)),
});

const NumberCodec = byteVecOf({
  pack: (num: number) => bytifyRawString(String(num)),
  unpack: (buf: BytesLike) => parseFloat(new TextDecoder().decode(bytify(buf))),
});


export const LandParcelCodec = table(
    {
        parcelId: StringCodec,
        location: StringCodec,
        latitude: NumberCodec,
        longitude: NumberCodec,
        deedHash: StringCodec,
        owner: StringCodec,
    },
    ["parcelId", "location", "latitude", "longitude", "deedHash", "owner"]
);

export type LandParcelMolecule = {
    parcelId: string;
    location: string;
    latitude: number;
    longitude: number;
    deedHash: string;
    owner: string;
};

export function encodeParcel(parcel: LandParcelMolecule): string {
    const packed = LandParcelCodec.pack(parcel);
    return hexify(packed);
}

export function decodeParcel(dataHex: string): LandParcelMolecule {
    const buf = bytify(dataHex);
    return LandParcelCodec.unpack(buf);
}