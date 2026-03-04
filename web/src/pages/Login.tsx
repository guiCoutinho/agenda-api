import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/auth";

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
      navigate("/"); // vai pra home após logar
    } catch {
      setError("Login ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <h1 style={{ marginBottom: 16 }}>Entrar</h1>

        <label style={{ display: "block", marginBottom: 10 }}>
          Login
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            autoComplete="username"
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            autoComplete="current-password"
          />
        </label>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}