import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/auth";
import { getMe } from "../services/users";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await loginRequest({ login, password });
      localStorage.setItem("token", token);
      const me = await getMe();
      localStorage.setItem("me", JSON.stringify(me));

      if (me.role === "VISITADOR") {
        navigate("/visitador");
      } else {
        navigate("/agenda");
      }
    } catch {
      setError("Login ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-bg" style={{ display: "grid", placeItems: "center" }}>
      <div className="page-shell" style={{ maxWidth: 980, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
        <section className="card" style={{ padding: 26, background: "linear-gradient(160deg, #0f7b6c 0%, #105f95 100%)", color: "#f8fdff" }}>
          <p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.04em" }}>UNIMOBILI</p>
          <h1 style={{ margin: "8px 0 10px", fontSize: "2rem", lineHeight: 1.1 }}>Gestao de visitas em tempo real</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            Agenda semanal, distribuicao por visitador e acompanhamento das proximas visitas em um unico fluxo.
          </p>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Entrar</h2>
          <p className="muted" style={{ marginTop: 0 }}>Use suas credenciais para acessar o painel.</p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <label>
              Login
              <input
                className="input"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Senha
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
