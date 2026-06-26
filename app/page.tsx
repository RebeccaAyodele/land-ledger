"use client"

import ConnectWallet from "@/components/ConnectWallet";
import RegisterParcel from "@/components/RegisterParcel";
import ParcelList from "@/components/ParcelList";

export default function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold">LandLedger</h1>
          <p className="text-sm opacity-60 mt-1">
            Decentralized land title registry on Nervos CKB
          </p>
        </div>
        <ConnectWallet />
      </header>

      <main className="flex flex-col gap-12 max-w-lg">
        <RegisterParcel />
        <ParcelList />
      </main>

      <footer className="mt-20 text-xs opacity-40 text-center">
        Built on Nervos CKB testnet — SDG 16
      </footer>
    </div>
  );
}
