/**
 * Admin — Points transaction history
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getResellerPointsHistory, type PointTransaction } from "@/lib/api";
import { toast } from "sonner";
import { ArrowUpCircle, ArrowDownCircle, Coins } from "lucide-react";

export default function PointsHistory() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResellerPointsHistory()
      .then(data => { setTransactions(data.transactions); setBalance(data.balance); })
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const txTypeLabel: Record<string, string> = {
    purchase: "Achat",
    activation: "Activation",
    transfer_in: "Transfert reçu",
    transfer_out: "Transfert envoyé",
    admin_credit: "Crédit admin",
    admin_debit: "Débit admin",
    refund: "Remboursement",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Historique des points</h1>
          <p className="text-sm text-muted-foreground">{transactions.length} transaction(s)</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-amber-400">{balance} pts</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : transactions.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucune transaction</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => (
            <Card key={tx.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                      {tx.amount > 0 ? <ArrowUpCircle className="w-5 h-5 text-emerald-400" /> : <ArrowDownCircle className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{txTypeLabel[tx.type] || tx.type}</span>
                        <Badge variant="outline" className="text-[10px]">{tx.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tx.description || "—"} • {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-mono">Solde: {tx.balanceAfter}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
