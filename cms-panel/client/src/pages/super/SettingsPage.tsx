/**
 * Super Admin — Settings (blocking toggle, custom messages, etc.)
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSuperDashboard, toggleBlocking, getSuperSetting, setSuperSetting } from "@/lib/api";
import { toast } from "sonner";
import { Settings, Shield, MessageSquare, Save } from "lucide-react";

export default function SettingsPage() {
  const [blockingDisabled, setBlockingDisabled] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [appPrice, setAppPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSuperDashboard(),
      getSuperSetting("custom_message").catch(() => ({ value: "" })),
      getSuperSetting("app_price").catch(() => ({ value: "" })),
    ]).then(([dash, msg, price]) => {
      setBlockingDisabled(!!dash.blockingDisabled);
      setCustomMessage(msg.value || "");
      setAppPrice(price.value || "");
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleToggleBlocking = async (disabled: boolean) => {
    try {
      await toggleBlocking(disabled);
      setBlockingDisabled(disabled);
      toast.success(disabled ? "Blocage désactivé" : "Blocage activé");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSaveMessage = async () => {
    try {
      await setSuperSetting("custom_message", customMessage);
      toast.success("Message enregistré");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSavePrice = async () => {
    try {
      await setSuperSetting("app_price", appPrice);
      toast.success("Prix enregistré");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24" /></Card>)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configuration globale du système</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Blocking toggle */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Blocage des appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Désactiver le blocage des appareils expirés</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Quand activé, les appareils expirés ne seront pas bloqués automatiquement
                </p>
              </div>
              <Switch checked={blockingDisabled} onCheckedChange={handleToggleBlocking} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${blockingDisabled ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className="text-xs text-muted-foreground">
                Blocage actuellement : <strong>{blockingDisabled ? "désactivé" : "activé"}</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Custom message */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Message personnalisé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Message affiché dans l'application pour les utilisateurs</p>
            <Input value={customMessage} onChange={e => setCustomMessage(e.target.value)} placeholder="Entrez un message..." className="bg-secondary/50 border-border/50" />
            <Button size="sm" onClick={handleSaveMessage} className="gap-1">
              <Save className="w-3.5 h-3.5" />Enregistrer
            </Button>
          </CardContent>
        </Card>

        {/* App price */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Prix de l'application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Prix affiché sur la page de paiement</p>
            <Input value={appPrice} onChange={e => setAppPrice(e.target.value)} placeholder="ex: 49.99" className="bg-secondary/50 border-border/50" />
            <Button size="sm" onClick={handleSavePrice} className="gap-1">
              <Save className="w-3.5 h-3.5" />Enregistrer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
