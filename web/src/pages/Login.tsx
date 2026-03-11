import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Building2, ShieldCheck } from "lucide-react";
import { loginRequest } from "@/services/auth";
import { getMe } from "@/services/users";

export default function Login() {
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const authResponse = await loginRequest({ login: loginValue, password });
      localStorage.setItem("token", authResponse.token);
      const me = await getMe();
      localStorage.setItem("me", JSON.stringify(me));
      if (me.mustChangePassword) navigate("/trocar-senha");
      else if (me.role === "VISITADOR") navigate("/visitador");
      else navigate("/agenda");
    } catch { setError("Login ou senha inválidos."); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-split">
      {/* Left decorative panel — visible only on lg+ */}
      <div className="login-left">
        <div className="login-left-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(184,145,42,0.15)", border: "1px solid rgba(184,145,42,0.25)",
            borderRadius: "100px", padding: "0.38rem 1rem",
            fontSize: "0.76rem", fontWeight: 600, color: "#d4ab4a",
            letterSpacing: "0.06em", textTransform: "uppercase",
            marginBottom: "2rem"
          }}>
            <ShieldCheck size={12} /> Plataforma interna
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.75rem", color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Unimobili<span style={{ color: "#d4ab4a" }}>.</span>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.93rem", color: "rgba(255,255,255,0.58)", maxWidth: 340, lineHeight: 1.7 }}>
            Centralize agendamentos, acompanhe visitas e mantenha a operação organizada em um só lugar.
          </p>
        </div>
        <div style={{
          position: "relative", zIndex: 1,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", padding: "1.1rem 1.4rem",
          background: "rgba(255,255,255,0.04)",
        }}>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.42)", margin: 0 }}>
            Acesso restrito aos colaboradores da Unimobili.
          </p>
        </div>
      </div>

      {/* Right: login form */}
      <div className="login-right">
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Brand (shown on all sizes, especially important on mobile where left panel is hidden) */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#0d1b2e", letterSpacing: "-0.02em" }}>
              Unimobili<span style={{ color: "#b8912a" }}>.</span>
            </div>
            <p style={{ marginTop: "0.35rem", fontSize: "0.82rem", color: "#5a6a7e", margin: "0.35rem 0 0" }}>
              Acesso restrito — colaboradores
            </p>
          </div>

          <div className="login-form-card">
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.45rem", color: "#0d1b2e", margin: "0 0 0.2rem" }}>
              Entrar
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#5a6a7e", margin: "0 0 1.6rem" }}>
              Use suas credenciais para acessar o sistema.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Login</label>
                <input
                  className="form-input"
                  value={loginValue}
                  onChange={e => setLoginValue(e.target.value)}
                  placeholder="Seu login"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                disabled={loading}
              >
                <LogIn size={16} /> {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
