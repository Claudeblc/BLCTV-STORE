/**
 * Super Admin — Plans management
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getSuperPlans, createPlan, updatePlan, deletePlan, type Plan } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CreditCard, Coins, Calendar } from "lucide-react";

export default function SuperPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", description: "", durationDays: 365, priceCents: 0, currency: "EUR", pointsCost: 1 });

  const load = async () => {
    try {
      setPlans(await getSuperPlans());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createPlan(form);
      toast.success("Plan créé");
      setShowCreate(false);
      setForm({ name: "", description: "", durationDays: 365, priceCents: 0, currency: "EUR", pointsCost: 1 });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = async () => {
    if (!showEdit) return;
    try {
      await updatePlan(showEdit.id, form);
      toast.success("Plan mis à jour");
      setShowEdit(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Supprimer le plan "${plan.name}" ?`)) return;
    try {
      await deletePlan(plan.id);
      toast.success("Plan supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const PlanForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div><Label className="text-xs">Nom *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/50 mt-1" /></div>
      <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary/50 mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Durée (jours, 0=à vie)</Label><Input type="number" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: parseInt(e.target.value) || 0 })} className="bg-secondary/50 mt-1" /></div>
        <div><Label className="text-xs">Coût en points</Label><Input type="number" value={form.pointsCost} onChange={e => setForm({ ...form, pointsCost: parseInt(e.target.value) || 1 })} className="bg-secondary/50 mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Prix (centimes)</Label><Input type="number" value={form.priceCents} onChange={e => setForm({ ...form, priceCents: parseInt(e.target.value) || 0 })} className="bg-secondary/50 mt-1" /></div>
        <div><Label className="text-xs">Devise</Label><Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="bg-secondary/50 mt-1" /></div>
      </div>
      <DialogFooter><Button onClick={onSubmit}>{submitLabel}</Button></DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Plans d'abonnement</h1>
          <p className="text-sm text-muted-foreground">{plans.length} plan(s) configuré(s)</p>
        </div>
        <Button onClick={() => { setForm({ name: "", description: "", durationDays: 365, priceCents: 0, currency: "EUR", pointsCost: 1 }); setShowCreate(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Nouveau plan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32" /></Card>)}</div>
      ) : plans.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucun plan configuré</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      {plan.description && <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className={plan.active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}>
                    {plan.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{plan.durationDays === 0 ? "À vie" : `${plan.durationDays} jours`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-amber-400">{plan.pointsCost} point{plan.pointsCost > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setShowEdit(plan); setForm({ name: plan.name, description: plan.description || "", durationDays: plan.durationDays, priceCents: plan.priceCents, currency: plan.currency, pointsCost: plan.pointsCost }); }}>
                    <Pencil className="w-3 h-3" />Modifier
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(plan)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nouveau plan</DialogTitle></DialogHeader>
          <PlanForm onSubmit={handleCreate} submitLabel="Créer" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Modifier le plan</DialogTitle></DialogHeader>
          <PlanForm onSubmit={handleEdit} submitLabel="Enregistrer" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
