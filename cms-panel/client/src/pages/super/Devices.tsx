/**
 * Super Admin — Devices/Licenses management
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getSuperLicenses, superActivateLicense, superRevokeLicense, superBlockLicense,
  superDeleteLicense, superSetLicenseStatus, superAddDevice, getSuperPlans,
  type License, type Plan
} from "@/lib/api";
import { toast } from "sonner";
import { Search, Plus, CheckCircle, XCircle, Ban, Clock, Trash2, Monitor, RefreshCw } from "lucide-react";

export default function SuperDevices() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showActivate, setShowActivate] = useState<License | null>(null);

  const [addForm, setAddForm] = useState({ macAddress: "", deviceName: "", email: "", customerName: "", notes: "" });
  const [activateForm, setActivateForm] = useState({ planId: 0, email: "", customerName: "", notes: "" });

  const load = async () => {
    try {
      const [licData, planData] = await Promise.all([getSuperLicenses(), getSuperPlans()]);
      setLicenses(licData.licenses);
      setPlans(planData);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = licenses.filter(l => {
    const matchSearch = l.macAddress.toLowerCase().includes(search.toLowerCase()) ||
      (l.deviceName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = async () => {
    try {
      await superAddDevice(addForm);
      toast.success("Appareil ajouté");
      setShowAdd(false);
      setAddForm({ macAddress: "", deviceName: "", email: "", customerName: "", notes: "" });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleActivate = async () => {
    if (!showActivate) return;
    try {
      await superActivateLicense({ macAddress: showActivate.macAddress, planId: activateForm.planId || undefined, email: activateForm.email, customerName: activateForm.customerName, notes: activateForm.notes });
      toast.success("Appareil activé");
      setShowActivate(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAction = async (mac: string, action: "revoke" | "block" | "delete") => {
    const labels = { revoke: "révoquer", block: "bloquer", delete: "supprimer" };
    if (!confirm(`Voulez-vous ${labels[action]} cet appareil ?`)) return;
    try {
      if (action === "revoke") await superRevokeLicense(mac);
      else if (action === "block") await superBlockLicense(mac);
      else await superDeleteLicense(mac);
      toast.success("Action effectuée");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Appareils</h1>
          <p className="text-sm text-muted-foreground">{licenses.length} appareil(s) enregistré(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1"><RefreshCw className="w-3.5 h-3.5" />Actualiser</Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1"><Plus className="w-3.5 h-3.5" />Ajouter</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par MAC, nom, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="trial">En essai</SelectItem>
            <SelectItem value="expired">Expirés</SelectItem>
            <SelectItem value="blocked">Bloqués</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucun appareil trouvé</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(lic => (
            <Card key={lic.id} className="bg-card border-border/50 hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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
                        {lic.deviceName && <span>{lic.deviceName}</span>}
                        {lic.customerName && <span>{lic.customerName}</span>}
                        <span>Créé : {formatDate(lic.createdAt)}</span>
                        {lic.expiresAt && <span>Expire : {formatDate(lic.expiresAt)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {lic.status !== "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => { setShowActivate(lic); setActivateForm({ planId: plans[0]?.id || 0, email: lic.email || "", customerName: lic.customerName || "", notes: "" }); }}>
                        <CheckCircle className="w-3 h-3" />Activer
                      </Button>
                    )}
                    {lic.status === "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={() => handleAction(lic.macAddress, "revoke")}>
                        <XCircle className="w-3 h-3" />Révoquer
                      </Button>
                    )}
                    {lic.status !== "blocked" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={() => handleAction(lic.macAddress, "block")}>
                        <Ban className="w-3 h-3" />Bloquer
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleAction(lic.macAddress, "delete")}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Device Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Ajouter un appareil</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Adresse MAC *</Label><Input placeholder="XX:XX:XX:XX:XX:XX" value={addForm.macAddress} onChange={e => setAddForm({ ...addForm, macAddress: e.target.value })} className="bg-secondary/50 mt-1 font-mono" /></div>
            <div><Label className="text-xs">Nom de l'appareil</Label><Input value={addForm.deviceName} onChange={e => setAddForm({ ...addForm, deviceName: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label className="text-xs">Nom client</Label><Input value={addForm.customerName} onChange={e => setAddForm({ ...addForm, customerName: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Ajouter</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={!!showActivate} onOpenChange={() => setShowActivate(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Activer — {showActivate?.macAddress}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Plan</Label>
              <Select value={String(activateForm.planId)} onValueChange={v => setActivateForm({ ...activateForm, planId: parseInt(v) })}>
                <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.pointsCost} pt{p.pointsCost > 1 ? "s" : ""})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={activateForm.email} onChange={e => setActivateForm({ ...activateForm, email: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label className="text-xs">Nom client</Label><Input value={activateForm.customerName} onChange={e => setActivateForm({ ...activateForm, customerName: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Input value={activateForm.notes} onChange={e => setActivateForm({ ...activateForm, notes: e.target.value })} className="bg-secondary/50 mt-1" /></div>
          </div>
          <DialogFooter><Button onClick={handleActivate}>Activer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
