"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletOverview } from "@/components/hours-wallet/wallet-overview";
import { TransactionList } from "@/components/hours-wallet/transaction-list";

export default function HoursWalletPage() {
  const [walletId, setWalletId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletId = async () => {
      try {
        const response = await fetch("/api/hours-wallet");
        const result = await response.json();
        if (response.ok && result.data?.id) {
          setWalletId(result.data.id);
        }
      } catch (error) {
        console.error("Error fetching wallet ID:", error);
      }
    };
    fetchWalletId();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hours Wallet</h1>
        <p className="text-muted-foreground">Track your hours usage</p>
      </div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <WalletOverview />
        </TabsContent>
        <TabsContent value="transactions">
          {walletId ? (
            <TransactionList walletId={walletId} />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No wallet data available. The transaction list will appear once your wallet is loaded.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
