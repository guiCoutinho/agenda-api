import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Save } from "lucide-react";
import { changeMyPassword, getMe } from "@/services/users";

export default function TrocarSenha() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 4) { setError("A senha deve ter pelo menos 4 caracteres."); return; }
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      await changeMyPassword(password);
      const me = await getMe();
      localStorage.setItem("me", JSON.stringify(me));
      navigate(me.role === "VISITADOR" ? "/visitador" : "/agenda");
    } catch {
      setError("Não foi possível trocar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#0d1b2e" }}>
            Unimobili<span style={{ color: "#b8912a" }}>.</span>
          </div>
        </div>
        <div className="login-form-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #f6f1e5, #ede7d2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b8912a" }}>
              <KeyRound size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", color: "#0d1b2e" }}>Trocar senha</h2>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#5a6a7e", marginTop: 2 }}>Defina uma nova senha para continuar.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Nova senha</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
              disabled={loading}
            >
              <Save size={15} />
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
