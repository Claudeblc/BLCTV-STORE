/**
 * Super Admin Dashboard — Overview stats + quick actions
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getSuperDashboard, type DashboardStats } from "@/lib/api";
import { Monitor, Users, Coins, CreditCard, CheckCircle, Clock, XCircle, Ban } from "lucide-react";

function StatCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card className="bg-card border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color }}>{value}</p>
            {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuperDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuperDashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble du système</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50 animate-pulse">
              <CardContent className="p-5 h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-muted-foreground">Erreur de chargement</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble du système</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Monitor className="w-5 h-5" />} label="Total appareils" value={stats.totalDevices} color="#6366f1" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Actifs" value={stats.activeDevices} color="#10b981" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="En essai" value={stats.trialDevices} color="#f59e0b" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Expirés" value={stats.expiredDevices} color="#ef4444" />
        <StatCard icon={<Ban className="w-5 h-5" />} label="Bloqués" value={stats.blockedDevices} color="#f43f5e" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Revendeurs" value={stats.totalResellers} color="#8b5cf6" />
        <StatCard icon={<Coins className="w-5 h-5" />} label="Total points" value={stats.totalPoints} color="#eab308" />
        <StatCard icon={<CreditCard className="w-5 h-5" />} label="Paiements" value={stats.totalPayments} color="#06b6d4" />
      </div>

      {stats.blockingDisabled !== undefined && (
        <Card className="bg-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stats.blockingDisabled ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className="text-sm">
                Blocage des appareils : <strong>{stats.blockingDisabled ? "Désactivé" : "Activé"}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
