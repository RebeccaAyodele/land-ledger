"use client";

import { useState } from "react";
import { useDeployTypeScript } from "@/hooks/useDeployTypeScript";

export default function DeployTypeScript() {
  const { deployTypeScript } = useDeployTypeScript();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    txHash: string;
    codeHash: string;
    index: string;
  } | null>(null);

  const handleDeploy = async () => {
    setLoading(true);
    setStatus("Reading binary...");

    try {
      const response = await fetch("/parcel-type-script");
      if (!response.ok) {
        throw new Error("Binary not found. Did you copy it to /public?");
      }

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Import ccc for hexFrom
      const { ccc } = await import("@ckb-ccc/connector-react");
      const binaryHex = ccc.hexFrom(bytes);

      setStatus("Deploying to testnet...");
      const deployed = await deployTypeScript(binaryHex);
      setResult(deployed);
      setStatus("Deployed successfully!");
    } catch (err: any) {
      setStatus(`Error: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md border rounded p-4">
      <h2 className="text-xl font-semibold">Deploy Type Script</h2>
      <p className="text-xs opacity-70">
        One-time operation. Copy the code hash after deploying.
      </p>
      <button
        onClick={handleDeploy}
        disabled={loading}
        className="bg-foreground text-background rounded p-2 font-bold disabled:opacity-50"
      >
        {loading ? "Deploying..." : "Deploy Parcel Type Script"}
      </button>
      {status && <p className="text-sm break-all">{status}</p>}
      {result && (
        <div className="flex flex-col gap-1 text-xs break-all">
          <p><strong>Tx Hash:</strong> {result.txHash}</p>
          <p><strong>Code Hash:</strong> {result.codeHash}</p>
          <p><strong>Index:</strong> {result.index}</p>
          <p className="text-yellow-400 mt-2">
            Save the Code Hash — you will need it to reference this type script.
          </p>
        </div>
      )}
    </div>
  );
}