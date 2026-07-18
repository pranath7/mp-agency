"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  FileText,
  Menu,
  X,
  Briefcase,
  ChevronDown,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/meetings", label: "Meetings", icon: Calendar },
  { href: "/invoices", label: "Invoices", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const mockUser = {
    name: "MP Owner",
    role: "owner",
    email: "owner@mpdigital.in",
  };

  const initials = "MO";

  return (
    <div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 39, display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, #2563EB, #059669)",
              borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Briefcase size={18} color="white" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "14px", lineHeight: 1.2 }}>
                MP Digital
              </div>
              <div style={{ color: "#64748b", fontSize: "11px" }}>Agency Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div style={{ marginBottom: "6px", padding: "0 4px" }}>
            <span style={{ color: "#334155", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Navigation
            </span>
          </div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link${isActive ? " active" : ""}`}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div className="avatar" style={{ width: "30px", height: "30px", fontSize: "12px" }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {mockUser.name}
              </div>
              <div style={{ color: "#64748b", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {mockUser.role}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-layout">
        {/* Top bar */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-ghost btn-sm mobile-menu-btn"
              style={{ display: "none" }}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-foreground)" }}>
                {navItems.find(n => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)))?.label ?? "Dashboard"}
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              fontSize: "13px", color: "var(--color-muted-foreground)",
              background: "var(--color-muted)", borderRadius: "8px",
              padding: "5px 12px", fontWeight: 500,
              border: "1px solid var(--color-border)",
            }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-overlay { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
