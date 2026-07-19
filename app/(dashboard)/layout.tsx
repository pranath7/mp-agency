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

  // ─── Meetings Push Notifications & Web Audio Alarms ───
  useEffect(() => {
    // 1. Request notification permissions
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // Sound alert generator (creates synth alert ringtone dynamically)
    function playAlarmBeep() {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5 beep
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.25);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch (err) {
        console.warn("AudioContext playback blocked by browser user interaction policy", err);
      }
    }

    // Show native notification banner
    function showNotificationBanner(title: string, body: string) {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    }

    // Poller to scan meetings
    async function checkMeetingsSchedule() {
      try {
        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const monthNum = String(dateObj.getMonth() + 1).padStart(2, '0');
        const monthString = `${year}-${monthNum}`;

        const res = await fetch(`/api/meetings?month=${monthString}`);
        if (!res.ok) return;
        const scheduledList: any[] = await res.json();

        const nowMs = Date.now();

        scheduledList.forEach((m: any) => {
          if (m.status !== "scheduled") return;

          const meetingTimeMs = new Date(m.dateTime).getTime();
          const timeDiffMs = meetingTimeMs - nowMs;

          // 1. One Day Before Notification (within a 10 minute window: 23 hours 50 mins to 24 hours 0 mins)
          const targetDayMs = 24 * 60 * 60 * 1000;
          if (timeDiffMs > targetDayMs - 600000 && timeDiffMs <= targetDayMs) {
            const notifiedKey = `notified_1day_${m.id}`;
            if (!localStorage.getItem(notifiedKey)) {
              localStorage.setItem(notifiedKey, "true");
              playAlarmBeep();
              showNotificationBanner(
                "📅 Meeting Tomorrow!",
                `"${m.title}" with client ${m.client?.name || "Partner"} is scheduled tomorrow at ${new Date(m.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`
              );
            }
          }

          // 2. One Hour Before Notification (within a 5 minute window: 55 mins to 60 mins)
          const targetHourMs = 60 * 60 * 1000;
          if (timeDiffMs > targetHourMs - 300000 && timeDiffMs <= targetHourMs) {
            const notifiedKey = `notified_1hour_${m.id}`;
            if (!localStorage.getItem(notifiedKey)) {
              localStorage.setItem(notifiedKey, "true");
              playAlarmBeep();
              showNotificationBanner(
                "⏰ Meeting in 1 Hour!",
                `"${m.title}" starts in 60 minutes. Get ready!`
              );
            }
          }

          // 3. During / At Meeting Time Notification (within a 5 minute window: -5 mins to +1 min)
          if (timeDiffMs >= -300000 && timeDiffMs <= 60000) {
            const notifiedKey = `notified_now_${m.id}`;
            if (!localStorage.getItem(notifiedKey)) {
              localStorage.setItem(notifiedKey, "true");
              playAlarmBeep();
              showNotificationBanner(
                "🚨 Meeting Starting Now!",
                `"${m.title}" is scheduled to start now at ${new Date(m.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`
              );
            }
          }
        });
      } catch (err) {
        console.error("Failed to run meetings background check", err);
      }
    }

    // Run check immediately and poll every 30 seconds
    checkMeetingsSchedule();
    const interval = setInterval(checkMeetingsSchedule, 30000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", padding: "14px 20px" }}>
          <img src="/logo.png" alt="MP Digital Logo" style={{ height: "42px", objectFit: "contain", borderRadius: "6px" }} />
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
            }} className="topbar-date">
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`mobile-bottom-link${isActive ? " active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 16px;
          left: 16px;
          right: 16px;
          z-index: 40;
          background: rgba(15, 23, 42, 0.88); /* Sleek dark theme matching sidebar */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 8px 4px;
          box-shadow: 0 10px 25px -3px rgba(0,0,0,0.3);
          justify-content: space-around;
          align-items: center;
        }
        .mobile-bottom-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #64748b;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
          padding: 6px 4px;
          border-radius: 10px;
          transition: all 0.2s ease;
          flex: 1;
        }
        .mobile-bottom-link.active {
          color: #3b82f6;
          transform: scale(1.05);
        }
        @media (max-width: 1024px) {
          .mobile-overlay { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: flex; }
          .mobile-menu-btn { display: none !important; } /* Replace sidebar with bottom bar */
          .mobile-overlay { display: none !important; }
          .topbar-date { display: none !important; } /* Simplify header on mobile */
          .page-content { padding-bottom: 96px !important; }
        }
      `}</style>
    </div>
  );
}
