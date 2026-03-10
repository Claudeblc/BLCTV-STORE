/**
 * Super Admin — Resellers/Admins management
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getSuperAdmins, createAdmin, updateAdmin, deleteAdmin,
  changeAdminPassword, addPointsToAdmin, deductPointsFromAdmin,
  type ResellerData
} from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Coins, Key, Search, UserPlus } from "lucide-react";

export default function SuperAdmins() {
  const [admins, setAdmins] = useState<ResellerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<ResellerData | null>(null);
  const [showPoints, setShowPoints] = useState<ResellerData | null>(null);
  const [showPassword, setShowPassword] = useState<ResellerData | null>(null);

  // Form states
  const [form, setForm] = useState({ username: "", password: "", displayName: "", email: "", phone: "", points: 0, notes: "" });
  const [editForm, setEditForm] = useState({ displayName: "", email: "", phone: "", status: "", notes: "" });
  const [pointsForm, setPointsForm] = useState({ amount: 0, description: "", action: "add" as "add" | "deduct" });
  const [newPassword, setNewPassword] = useState("");

  const load = async () => {
    try {
      const data = await getSuperAdmins();
      setAdmins(data.filter(a => a.role !== "super_admin"));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = admins.filter(a =>
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      await createAdmin(form);
      toast.success("Revendeur créé");
      setShowCreate(false);
      setForm({ username: "", password: "", displayName: "", email: "", phone: "", points: 0, notes: "" });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = async () => {
    if (!showEdit) return;
    try {
      await updateAdmin(showEdit.id, editForm);
      toast.success("Revendeur mis à jour");
      setShowEdit(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (admin: ResellerData) => {
    if (!confirm(`Supprimer ${admin.displayName} ?`)) return;
    try {
      await deleteAdmin(admin.id);
      toast.success("Revendeur supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handlePoints = async () => {
    if (!showPoints) return;
    try {
      if (pointsForm.action === "add") {
        await addPointsToAdmin(showPoints.id, pointsForm.amount, pointsForm.description);
        toast.success(`${pointsForm.amount} points ajoutés`);
      } else {
        await deductPointsFromAdmin(showPoints.id, pointsForm.amount, pointsForm.description);
        toast.success(`${pointsForm.amount} points retirés`);
      }
      setShowPoints(null);
      setPointsForm({ amount: 0, description: "", action: "add" });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handlePasswordChange = async () => {
    if (!showPassword) return;
    try {
      await changeAdminPassword(showPassword.id, newPassword);
      toast.success("Mot de passe changé");
      setShowPassword(null);
      setNewPassword("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      suspended: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      blocked: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    return <Badge variant="outline" className={colors[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Revendeurs</h1>
          <p className="text-sm text-muted-foreground">{admins.length} revendeur(s) enregistré(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Nouveau revendeur
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucun revendeur trouvé</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(admin => (
            <Card key={admin.id} className="bg-card border-border/50 hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {admin.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{admin.displayName}</span>
                        {statusBadge(admin.status)}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">@{admin.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-amber-400">{admin.points} pts</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setShowPoints(admin); setPointsForm({ amount: 0, description: "", action: "add" }); }}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setShowEdit(admin); setEditForm({ displayName: admin.displayName, email: admin.email || "", phone: admin.phone || "", status: admin.status, notes: "" }); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setShowPassword(admin)}>
                      <Key className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => handleDelete(admin)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nouveau revendeur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Nom d'utilisateur *</Label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label className="text-xs">Mot de passe *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
            <div><Label className="text-xs">Nom affiché *</Label><Input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label className="text-xs">Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
            <div><Label className="text-xs">Points initiaux</Label><Input type="number" value={form.points} onChange={e => setForm({ ...form, points: parseInt(e.target.value) || 0 })} className="bg-secondary/50 mt-1" /></div>
            <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="bg-secondary/50 mt-1" /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Modifier {showEdit?.displayName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Nom affiché</Label><Input value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label className="text-xs">Téléphone</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
            <div>
              <Label className="text-xs">Statut</Label>
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full mt-1 h-9 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground">
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleEdit}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Points Dialog */}
      <Dialog open={!!showPoints} onOpenChange={() => setShowPoints(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Gérer les points — {showPoints?.displayName}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Solde actuel : <strong className="text-amber-400">{showPoints?.points} pts</strong></p>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={pointsForm.action === "add" ? "default" : "outline"} size="sm" onClick={() => setPointsForm({ ...pointsForm, action: "add" })}>Ajouter</Button>
              <Button variant={pointsForm.action === "deduct" ? "default" : "outline"} size="sm" onClick={() => setPointsForm({ ...pointsForm, action: "deduct" })}>Retirer</Button>
            </div>
            <div><Label className="text-xs">Nombre de points</Label><Input type="number" value={pointsForm.amount} onChange={e => setPointsForm({ ...pointsForm, amount: parseInt(e.target.value) || 0 })} className="bg-secondary/50 mt-1" /></div>
            <div><Label className="text-xs">Description</Label><Input value={pointsForm.description} onChange={e => setPointsForm({ ...pointsForm, description: e.target.value })} className="bg-secondary/50 mt-1" /></div>
          </div>
          <DialogFooter><Button onClick={handlePoints}>{pointsForm.action === "add" ? "Ajouter" : "Retirer"} les points</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={!!showPassword} onOpenChange={() => setShowPassword(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Changer le mot de passe — {showPassword?.displayName}</DialogTitle></DialogHeader>
          <div><Label className="text-xs">Nouveau mot de passe</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary/50 mt-1" /></div>
          <DialogFooter><Button onClick={handlePasswordChange}>Changer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
