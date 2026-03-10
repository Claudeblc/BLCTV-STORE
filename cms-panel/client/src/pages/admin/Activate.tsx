/**
 * Admin — Activate a device with points
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { resellerActivate, getResellerPlans, checkLicenseStatus, type Plan } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tv, Coins, Search, CheckCircle, AlertCircle } from "lucide-react";

export default function Activate() {
  const { refreshProfile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [macAddress, setMacAddress] = useState("");
  const [planId, setPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    getResellerPlans().then(setPlans).catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (!macAddress) { toast.error("Entrez une adresse MAC"); return; }
    setChecking(true);
    try {
      const result = await checkLicenseStatus(macAddress);
      setCheckResult(result);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  };

  const handleActivate = async () => {
    if (!macAddress || !planId) { toast.error("MAC et plan requis"); return; }
    setLoading(true);
    try {
      const result = await resellerActivate(macAddress, parseInt(planId));
      toast.success(`Appareil activé ! Nouveau solde : ${result.newBalance} pts`);
      setMacAddress("");
      setPlanId("");
      setCheckResult(null);
      refreshProfile();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => String(p.id) === planId);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Activer un appareil</h1>
        <p className="text-sm text-muted-foreground">Utilisez vos points pour activer un appareil</p>
      </div>

      {/* Check device */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Vérifier un appareil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="XX:XX:XX:XX:XX:XX"
              value={macAddress}
              onChange={e => setMacAddress(e.target.value)}
              className="bg-secondary/50 border-border/50 font-mono flex-1"
            />
            <Button variant="outline" onClick={handleCheck} disabled={checking}>
              {checking ? "..." : "Vérifier"}
            </Button>
          </div>
          {checkResult && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                {checkResult.status === "active" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-sm font-semibold">Statut : </span>
                <Badge variant="outline" className={
                  checkResult.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                  checkResult.status === "trial" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" :
                  "bg-red-500/15 text-red-400 border-red-500/20"
                }>{checkResult.status}</Badge>
              </div>
              {checkResult.expiresAt && (
                <p className="text-xs text-muted-foreground">
                  Expire : {new Date(checkResult.expiresAt).toLocaleDateString("fr-FR")}
                </p>
              )}
              {checkResult.trialRemaining !== undefined && checkResult.status === "trial" && (
                <p className="text-xs text-muted-foreground">
                  Essai restant : {Math.ceil(checkResult.trialRemaining / (1000 * 60 * 60 * 24))} jours
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activate */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tv className="w-4 h-4 text-primary" />
            Activation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Adresse MAC</Label>
            <Input
              placeholder="XX:XX:XX:XX:XX:XX"
              value={macAddress}
              onChange={e => setMacAddress(e.target.value)}
              className="bg-secondary/50 border-border/50 font-mono mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Plan d'abonnement</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="bg-secondary/50 border-border/50 mt-1"><SelectValue placeholder="Choisir un plan" /></SelectTrigger>
              <SelectContent>
                {plans.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} — {p.pointsCost} point{p.pointsCost > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-sm">
                  Coût : <strong className="text-amber-400">{selectedPlan.pointsCost} point{selectedPlan.pointsCost > 1 ? "s" : ""}</strong>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Durée : {selectedPlan.durationDays === 0 ? "À vie" : `${selectedPlan.durationDays} jours`}
              </p>
            </div>
          )}

          <Button onClick={handleActivate} disabled={loading || !macAddress || !planId} className="w-full gap-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Activation...
              </span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Activer l'appareil
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
