"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { loginSchema } from "@/lib/validations";
import { Eye, EyeOff, Briefcase, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: errs.email?.[0],
        password: errs.password?.[0],
      });
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 50%, #0F172A 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Background pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(37,99,235,0.15) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(5,150,105,0.1) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #2563EB, #059669)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(37,99,235,0.4)",
          }}>
            <Briefcase size={26} color="white" />
          </div>
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: 700, margin: "0 0 6px" }}>
            MP Digital Agency
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Internal Management Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 600, margin: "0 0 24px" }}>
            Sign in to your account
          </h2>

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "20px",
              color: "#fca5a5",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                color: "#cbd5e1",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@mpdigital.in"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.07)",
                  border: fieldErrors.email
                    ? "1px solid rgba(220,38,38,0.6)"
                    : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 150ms, box-shadow 150ms",
                  boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(37,99,235,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = fieldErrors.email ? "rgba(220,38,38,0.6)" : "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
              />
              {fieldErrors.email && (
                <p style={{ color: "#fca5a5", fontSize: "12px", margin: "4px 0 0" }}>{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                color: "#cbd5e1",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "10px 44px 10px 14px",
                    background: "rgba(255,255,255,0.07)",
                    border: fieldErrors.password
                      ? "1px solid rgba(220,38,38,0.6)"
                      : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 150ms, box-shadow 150ms",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(37,99,235,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)"; }}
                  onBlur={e => { e.target.style.borderColor = fieldErrors.password ? "rgba(220,38,38,0.6)" : "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ color: "#fca5a5", fontSize: "12px", margin: "4px 0 0" }}>{fieldErrors.password}</p>
              )}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "rgba(37,99,235,0.6)" : "linear-gradient(135deg, #2563EB, #1d4ed8)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 150ms",
                boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div style={{
            marginTop: "24px",
            padding: "14px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
          }}>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Demo credentials
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 4px" }}>
              owner@mpdigital.in / owner123!
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              partner@mpdigital.in / partner123!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569 !important; }
      `}</style>
    </div>
  );
}
