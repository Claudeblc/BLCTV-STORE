import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { forceChangePassword } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

export default function ChangePassword() {
  const { reseller } = useAuth();
  const [, navigate] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await forceChangePassword(currentPassword, newPassword);
      toast.success("Mot de passe changé avec succès");
      if (reseller?.role === "super_admin") {
        navigate("/super/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(135deg, oklch(0.11 0.015 260) 0%, oklch(0.15 0.02 275) 50%, oklch(0.11 0.015 260) 100%)"
    }}>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <KeyRound className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Changement obligatoire</h1>
          <p className="text-sm text-muted-foreground mt-1">Vous devez changer votre mot de passe</p>
        </CardHeader>
        <CardContent className="pt-4 pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">Mot de passe actuel</Label>
              <Input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-secondary/50 border-border/50 h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">Nouveau mot de passe</Label>
              <Input type={showPasswords ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary/50 border-border/50 h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">Confirmer le nouveau mot de passe</Label>
              <Input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-secondary/50 border-border/50 h-11" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPasswords ? "Masquer" : "Afficher"} les mots de passe
              </button>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? "Changement..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
