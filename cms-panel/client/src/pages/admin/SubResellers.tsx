/**
 * Admin — Sub-resellers management
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getSubResellers, createSubReseller, transferPoints, type ResellerData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserPlus, Coins, Send, Search } from "lucide-react";

export default function SubResellers() {
  const { refreshProfile } = useAuth();
  const [subs, setSubs] = useState<ResellerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showTransfer, setShowTransfer] = useState<ResellerData | null>(null);

  const [form, setForm] = useState({ username: "", password: "", displayName: "", email: "", phone: "", points: 0 });
  const [transferAmount, setTransferAmount] = useState(0);

  const load = async () => {
    try {
      setSubs(await getSubResellers());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = subs.filter(s =>
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      await createSubReseller(form);
      toast.success("Sous-revendeur créé");
      setShowCreate(false);
      setForm({ username: "", password: "", displayName: "", email: "", phone: "", points: 0 });
      load();
      refreshProfile();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleTransfer = async () => {
    if (!showTransfer) return;
    try {
      const result = await transferPoints(showTransfer.id, transferAmount);
      toast.success(`Points transférés ! Nouveau solde : ${result.newBalance} pts`);
      setShowTransfer(null);
      setTransferAmount(0);
      load();
      refreshProfile();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Sous-revendeurs</h1>
          <p className="text-sm text-muted-foreground">{subs.length} sous-revendeur(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Nouveau sous-revendeur
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Aucun sous-revendeur</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => (
            <Card key={sub.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {sub.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{sub.displayName}</span>
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">{sub.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">@{sub.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-amber-400">{sub.points} pts</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => { setShowTransfer(sub); setTransferAmount(0); }}>
                      <Send className="w-3 h-3" />Transférer
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
          <DialogHeader><DialogTitle>Nouveau sous-revendeur</DialogTitle></DialogHeader>
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
            <div><Label className="text-xs">Points initiaux (transférés de votre solde)</Label><Input type="number" value={form.points} onChange={e => setForm({ ...form, points: parseInt(e.target.value) || 0 })} className="bg-secondary/50 mt-1" /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={!!showTransfer} onOpenChange={() => setShowTransfer(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Transférer des points à {showTransfer?.displayName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Solde actuel du sous-revendeur : <strong className="text-amber-400">{showTransfer?.points} pts</strong></p>
            <div><Label className="text-xs">Nombre de points</Label><Input type="number" value={transferAmount} onChange={e => setTransferAmount(parseInt(e.target.value) || 0)} className="bg-secondary/50 mt-1" /></div>
          </div>
          <DialogFooter><Button onClick={handleTransfer}>Transférer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
