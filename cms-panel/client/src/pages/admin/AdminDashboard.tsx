/**
 * Admin (Reseller) Dashboard — Overview of own stats
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getResellerStats } from "@/lib/api";
import { toast } from "sonner";
import { Monitor, CheckCircle, XCircle, Coins, Users } from "lucide-react";

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="bg-card border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color }}>{value}</p>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResellerStats()
      .then(setStats)
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-xl font-bold">Tableau de bord</h1></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-5 h-24" /></Card>)}
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-muted-foreground">Erreur de chargement</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vos statistiques</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Coins className="w-5 h-5" />} label="Mes points" value={stats.points} color="#eab308" />
        <StatCard icon={<Monitor className="w-5 h-5" />} label="Total appareils" value={stats.totalDevices} color="#6366f1" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Actifs" value={stats.activeDevices} color="#10b981" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Expirés" value={stats.expiredDevices} color="#ef4444" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Sous-revendeurs" value={stats.subResellers} color="#8b5cf6" />
      </div>
    </div>
  );
}
