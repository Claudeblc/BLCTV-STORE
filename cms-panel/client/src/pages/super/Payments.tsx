/**
 * Super Admin — Payments history
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getSuperPayments } from "@/lib/api";
import { toast } from "sonner";
import { Search, CreditCard } from "lucide-react";

export default function SuperPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getSuperPayments()
      .then(setPayments)
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    (p.macAddress || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      failed: "bg-red-500/15 text-red-400 border-red-500/20",
      refunded: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    };
    return <Badge variant="outline" className={colors[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Paiements</h1>
        <p className="text-sm text-muted-foreground">{payments.length} paiement(s)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par MAC, nom, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucun paiement trouvé</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((pay: any) => (
            <Card key={pay.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{pay.macAddress}</span>
                        {statusBadge(pay.status || "completed")}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {pay.customerName && <span>{pay.customerName}</span>}
                        <span>{pay.paymentMethod}</span>
                        <span>{formatDate(pay.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold">
                      {pay.pointsUsed ? `${pay.pointsUsed} pts` : `${(pay.amountCents / 100).toFixed(2)} ${pay.currency}`}
                    </span>
                    {pay.processedBy && <p className="text-[10px] text-muted-foreground">par {pay.processedBy}</p>}
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
