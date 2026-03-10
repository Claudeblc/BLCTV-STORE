/**
 * Dashboard Layout — Slate Admin Pro
 * Persistent sidebar + top header + content area
 */
import { type ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Users, Monitor, CreditCard, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield, Coins, History, UserPlus,
  Tv, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { reseller, logout, isSuperAdmin } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const superAdminNav: NavItem[] = [
    { label: "Tableau de bord", href: "/super/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Revendeurs", href: "/super/admins", icon: <Users className="w-5 h-5" /> },
    { label: "Appareils", href: "/super/devices", icon: <Monitor className="w-5 h-5" /> },
    { label: "Plans", href: "/super/plans", icon: <CreditCard className="w-5 h-5" /> },
    { label: "Paiements", href: "/super/payments", icon: <Coins className="w-5 h-5" /> },
    { label: "Paramètres", href: "/super/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const adminNav: NavItem[] = [
    { label: "Tableau de bord", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Activer un appareil", href: "/admin/activate", icon: <Tv className="w-5 h-5" /> },
    { label: "Mes appareils", href: "/admin/devices", icon: <Monitor className="w-5 h-5" /> },
    { label: "Historique points", href: "/admin/points", icon: <History className="w-5 h-5" /> },
    { label: "Sous-revendeurs", href: "/admin/sub-resellers", icon: <UserPlus className="w-5 h-5" /> },
  ];

  const navItems = isSuperAdmin ? superAdminNav : adminNav;

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-sidebar-foreground truncate">BLCTV CMS</h1>
              <p className="text-[10px] text-muted-foreground truncate">
                {isSuperAdmin ? "Super Admin" : "Admin Panel"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary/15 text-primary border-l-2 border-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              } ${collapsed ? "justify-center px-2" : ""}`}>
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        {!collapsed && reseller && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-sidebar-accent/30">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{reseller.displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">@{reseller.username}</p>
            {reseller.role === "admin" && (
              <div className="flex items-center gap-1 mt-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-mono font-bold text-amber-400">{reseller.points} pts</span>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10 ${collapsed ? "px-2" : ""}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 ${collapsed ? "w-16" : "w-64"} shrink-0`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground z-50 hidden lg:flex"
          style={{ left: collapsed ? "52px" : "248px" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold text-foreground">
              {navItems.find(n => location === n.href || location.startsWith(n.href + "/"))?.label || "Panel"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && reseller && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono font-bold text-primary">{reseller.points} pts</span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
              {reseller?.displayName?.charAt(0) || "?"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
