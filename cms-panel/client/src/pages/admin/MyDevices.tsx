/**
 * Admin — My activated devices
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getResellerLicenses, type License } from "@/lib/api";
import { toast } from "sonner";
import { Search, Monitor, CheckCircle, Clock, XCircle, Ban } from "lucide-react";

export default function MyDevices() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getResellerLicenses()
      .then(data => setLicenses(data.licenses))
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = licenses.filter(l =>
    l.macAddress.toLowerCase().includes(search.toLowerCase()) ||
    (l.deviceName || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      active: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <CheckCircle className="w-3 h-3" /> },
      trial: { color: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: <Clock className="w-3 h-3" /> },
      expired: { color: "bg-red-500/15 text-red-400 border-red-500/20", icon: <XCircle className="w-3 h-3" /> },
      blocked: { color: "bg-rose-500/15 text-rose-400 border-rose-500/20", icon: <Ban className="w-3 h-3" /> },
    };
    const c = config[status] || config.trial;
    return <Badge variant="outline" className={`gap-1 ${c.color}`}>{c.icon}{status}</Badge>;
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Mes appareils</h1>
        <p className="text-sm text-muted-foreground">{licenses.length} appareil(s) activé(s) par vous</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucun appareil trouvé</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(lic => (
            <Card key={lic.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Monitor className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">{lic.macAddress}</span>
                        {statusBadge(lic.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {lic.customerName && <span>{lic.customerName}</span>}
                        <span>Activé : {formatDate(lic.activatedAt)}</span>
                        {lic.expiresAt && <span>Expire : {formatDate(lic.expiresAt)}</span>}
                        {!lic.expiresAt && lic.status === "active" && <span className="text-emerald-400">À vie</span>}
                      </div>
                    </div>
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
