import { ccc } from "@ckb-ccc/connector-react";
import * as fs from "fs";
import * as path from "path";


async function deploy() {
  const binaryPath = path.join(
    __dirname,
    "../contracts/parcel-type-script/target/riscv64imac-unknown-none-elf/release/parcel-type-script"
  );

  const binary = fs.readFileSync(binaryPath);
  const dataHex = ccc.hexFrom(new Uint8Array(binary));

  console.log("Binary size:", binary.length, "bytes");
  console.log("Data hex (first 64 chars):", dataHex.slice(0, 64));
  console.log("Code hash would be:", ccc.hashCkb(dataHex));
}

deploy().catch(console.error);